import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BUCKET = "financial-documents";

const EXPENSE_CATEGORIES = [
  "Food", "Transportation", "Shopping", "Entertainment", "Bills",
  "Healthcare", "Education", "Travel", "Investments", "Subscriptions", "Housing", "Other",
];
const INCOME_CATEGORIES = ["Salary", "Freelance", "Business", "Investments", "Refunds", "Other"];

const SCAN_SYSTEM_PROMPT = `You are an expert OCR financial assistant. Analyze the receipt/invoice/statement and extract the transaction.
Return ONE JSON object:
{ "amount": number, "currency": "USD"|"EUR"|"BRL"|string, "date": "YYYY-MM-DD",
  "merchant": string, "description": string, "type": "expense"|"income", "category": string }
Rules:
- Use today if the date is unclear.
- Category MUST come from these lists:
  Expense: ${EXPENSE_CATEGORIES.join(", ")}
  Income: ${INCOME_CATEGORIES.join(", ")}
- Output ONLY raw JSON, no markdown.`;

const VOICE_SYSTEM_PROMPT = `You are VAULT's financial parser.
You receive a user's natural-language sentence AND the user's existing PARENT
categories. Return one JSON object:

{
  "type": "income" | "expense",
  "amount": number,               // positive, no currency symbol
  "description": string,          // short human item, e.g. "Coffee at Starbucks", "Bread", "Gasoline"
  "itemEmoji": string,            // ONE emoji of the ITEM the user bought/received (☕ 🍞 ⛽ 👕 💰)
  "categoryName": string,         // MUST reuse one of the provided parent categories when it fits
  "categoryEmoji": string,        // ONE emoji for the parent category (used only if a new parent must be created)
  "isNewCategory": boolean        // true only if none of the provided parents fits
}

Hard rules:
- Food/drink items (coffee ☕, bread 🍞, pizza 🍕, restaurant 🍽️, groceries 🛒, snack, water)
  ALWAYS go under an existing food-like parent (Food / Alimentação / Comida / Groceries / Restaurants).
  Never create "Coffee" or "Bread" as a category.
- Anything with car, motorcycle, bike, fuel, gasoline, uber, taxi, bus, train, parts → Transport.
- Clothing, shoes, accessories, electronics for personal use → Shopping.
- Medicine, doctor, hospital → Health. Rent, mortgage, utilities → Bills/Housing.
- Salary, freelance income, refunds → an income parent (Salary / Income / Freelance).
- Only set isNewCategory=true when the sentence truly does not fit any existing parent.
- The itemEmoji is for the specific item; categoryEmoji is a broader symbol
  (🍽️ 🚗 🛍️ 💊 🏠 💡 💼 💰 📈).
- Understand English, Portuguese and Spanish. "gastei/paguei/spent/paid/comprei" → expense.
  "recebi/got/received/salary/salário" → income.
- Output ONLY raw JSON.`;

function parseJsonLoose(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        /* ignore */
      }
    }
  }
  return {};
}

async function callGateway(messages: unknown[]) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured.");
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages,
      response_format: { type: "json_object" },
    }),
  });
  return resp;
}

export const scanReceipt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { file_path: string; mime_type: string; file_name?: string }) => {
    if (!input?.file_path || !input?.mime_type) {
      throw new Error("file_path and mime_type required");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    const { userId } = context;
    if (!data.file_path.startsWith(`${userId}/`)) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: docRow, error: docErr } = await supabaseAdmin
      .from("scanned_documents")
      .insert({
        user_id: userId,
        file_name: data.file_name || data.file_path.split("/").pop() || "document",
        file_url: data.file_path,
        file_type: data.mime_type,
        scan_status: "processing",
      })
      .select()
      .single();
    if (docErr || !docRow) throw new Error(docErr?.message || "Could not start the scan.");

    const fail = async (message: string) => {
      await supabaseAdmin
        .from("scanned_documents")
        .update({ scan_status: "failed", error_message: message.slice(0, 500) })
        .eq("id", docRow.id);
    };

    const { data: file, error: dlErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .download(data.file_path);
    if (dlErr || !file) {
      await fail(dlErr?.message || "File not found");
      throw new Error("Upload failed. Please try again.");
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
    const dataUri = `data:${data.mime_type};base64,${btoa(binary)}`;

    const content: unknown[] = [
      { type: "text", text: "Extract transaction details from this document." },
    ];
    if (data.mime_type === "application/pdf") {
      content.push({ type: "file", file: { filename: "receipt.pdf", file_data: dataUri } });
    } else {
      content.push({ type: "image_url", image_url: { url: dataUri } });
    }

    let aiResp: Response;
    try {
      aiResp = await callGateway([
        { role: "system", content: SCAN_SYSTEM_PROMPT },
        { role: "user", content },
      ]);
    } catch {
      await fail("AI gateway unreachable");
      throw new Error("Document processing is temporarily unavailable.");
    }

    if (!aiResp.ok) {
      const text = await aiResp.text();
      console.error(`[ai-scan-receipt] gateway ${aiResp.status}: ${text.slice(0, 500)}`);
      await fail(text);
      if (aiResp.status === 429) throw new Error("Too many requests. Please try again shortly.");
      if (aiResp.status === 402) throw new Error("Document processing is temporarily unavailable.");
      throw new Error("Document processing failed. Please try again.");
    }

    const aiJson = (await aiResp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const extracted = parseJsonLoose(aiJson?.choices?.[0]?.message?.content || "{}");

    await supabaseAdmin
      .from("scanned_documents")
      .update({
        scan_status: "completed",
        extracted_data: extracted as never,
        detected_amount: Number(extracted["amount"]) || null,
        detected_category: (extracted["category"] as string) || null,
        transaction_type: extracted["type"] === "income" ? "income" : "expense",
      })
      .eq("id", docRow.id);

    return { scan_id: docRow.id, extracted };
  });

export const parseVoiceTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { text: string; categories?: string[] }) => {
    const text = (input?.text || "").trim();
    if (!text) throw new Error("text is required");
    return {
      text,
      categories: Array.isArray(input.categories)
        ? input.categories.filter(Boolean).slice(0, 60)
        : [],
    };
  })
  .handler(async ({ data }) => {
    const userMessage =
      `Existing parent categories: ${data.categories.length ? data.categories.join(", ") : "(none yet)"}\n` +
      `Sentence: ${data.text}`;

    let aiResp: Response;
    try {
      aiResp = await callGateway([
        { role: "system", content: VOICE_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ]);
    } catch {
      throw new Error("AI gateway unreachable");
    }

    if (!aiResp.ok) {
      const text = await aiResp.text();
      console.error(`[ai-voice-transaction] gateway ${aiResp.status}: ${text.slice(0, 500)}`);
      if (aiResp.status === 429) throw new Error("Too many requests. Try again shortly.");
      if (aiResp.status === 402) throw new Error("AI credits exhausted.");
      throw new Error("Failed to parse transaction.");
    }

    const aiJson = (await aiResp.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const extracted = parseJsonLoose(aiJson?.choices?.[0]?.message?.content || "{}");

    const type = extracted["type"] === "income" ? "income" : "expense";
    const amount = Number(extracted["amount"]);
    if (!isFinite(amount) || amount <= 0) {
      throw new Error("Could not detect a valid amount. Please try again.");
    }

    return {
      type,
      amount,
      description: String(extracted["description"] || data.text).slice(0, 200),
      itemEmoji: String(extracted["itemEmoji"] || (type === "income" ? "💰" : "🧾")).slice(0, 4),
      categoryName: String(extracted["categoryName"] || "Other").slice(0, 40),
      categoryEmoji: String(extracted["categoryEmoji"] || "🗂️").slice(0, 4),
      isNewCategory: extracted["isNewCategory"] === true,
      transcript: data.text,
    };
  });
