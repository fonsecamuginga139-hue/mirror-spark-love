import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Check, X, Loader2, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { parseVoiceTransaction } from "@/lib/ai.functions";
import { useCategories } from "@/hooks/useCategories";
import { useCards } from "@/hooks/useCards";
import { useTransactions } from "@/hooks/useTransactions";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type Parsed = {
  type: "income" | "expense";
  amount: number;
  description: string;
  itemEmoji: string;
  categoryName: string;
  categoryEmoji: string;
  isNewCategory: boolean;
  transcript: string;
};

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: any) => void) | null;
  onerror: ((e: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

const getRecognition = (): Recognition | null => {
  const w = window as any;
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
};

const VoiceTransactionModal = ({ isOpen, onClose }: Props) => {
  const parseVoiceTransactionFn = useServerFn(parseVoiceTransaction);
  const { categories, addCategory } = useCategories();
  const { cards, addCard } = useCards();
  const { addTransaction } = useTransactions();

  const [phase, setPhase] = useState<"listening" | "processing" | "confirm" | "saving">("listening");
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState<Parsed | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editType, setEditType] = useState<"income" | "expense">("expense");
  const [editAmount, setEditAmount] = useState<string>("");
  const [editDesc, setEditDesc] = useState("");
  const [editTag, setEditTag] = useState<"debit" | "credit">("debit");

  const recRef = useRef<Recognition | null>(null);
  const stoppedRef = useRef(false);

  const cleanupRecognition = () => {
    stoppedRef.current = true;
    try { recRef.current?.abort(); } catch { /* ignore */ }
    recRef.current = null;
  };

  const handleClose = () => {
    cleanupRecognition();
    setPhase("listening");
    setTranscript("");
    setParsed(null);
    setError(null);
    onClose();
  };

  const parseText = async (text: string) => {
    setPhase("processing");
    setError(null);
    try {
      const catNames = Array.from(new Set(categories.map((c) => c.name)));
      const data = await parseVoiceTransactionFn({ data: { text, categories: catNames } });
      const p = data as unknown as Parsed;
      setParsed(p);
      setEditType(p.type);
      setEditAmount(String(p.amount));
      // Keep the AI's clean description; user can edit it before saving.
      setEditDesc(p.description || text);
      setEditTag("debit");
      setPhase("confirm");
    } catch (e: any) {
      setError(e?.message || "Failed to parse. Please try again.");
      setPhase("listening");
    }
  };

  const start = () => {
    setError(null);
    setTranscript("");
    setParsed(null);
    setPhase("listening");
    stoppedRef.current = false;

    const rec = getRecognition();
    if (!rec) {
      setError("Voice input isn't supported in this browser. Try Chrome or Safari.");
      return;
    }
    rec.lang = "pt-PT";
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript?.trim() || "";
      setTranscript(text);
      if (text) parseText(text);
    };
    rec.onerror = (e: any) => {
      if (stoppedRef.current) return;
      setError(
        e?.error === "not-allowed"
          ? "Microphone access denied."
          : e?.error === "no-speech"
            ? "I didn't hear anything. Tap the mic and try again."
            : "Could not capture audio.",
      );
    };
    rec.onend = () => { /* nothing */ };

    recRef.current = rec;
    try { rec.start(); } catch { setError("Could not start voice input."); }
  };

  const finishNow = () => {
    try { recRef.current?.stop(); } catch { /* ignore */ }
    if (transcript) parseText(transcript);
  };

  useEffect(() => {
    if (isOpen) start();
    return () => cleanupRecognition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const confirm = async () => {
    if (!parsed) return;
    const amount = Number(editAmount);
    if (!isFinite(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    setPhase("saving");

    // Auto-provision a default wallet so the user never has to create one.
    let cardId: string | undefined = cards[0]?.id;
    if (!cardId) {
      const newCard = await addCard({ name: "Wallet", number: null, color: "#10B981", icon: "wallet" });
      cardId = newCard?.id;
      if (!cardId) {
        toast.error("Could not prepare your wallet. Try again.");
        setPhase("confirm");
        return;
      }
    }

    // Match against user's existing parent categories (case-insensitive).
    // Only create a new parent when the AI says none fits.
    let cat = categories.find(
      (c) =>
        (c.type === editType || c.type === null) &&
        c.name.toLowerCase() === parsed.categoryName.toLowerCase(),
    );
    if (!cat) {
      // Try a looser match ignoring type before creating anything new.
      cat = categories.find(
        (c) => c.name.toLowerCase() === parsed.categoryName.toLowerCase(),
      );
    }
    if (!cat && parsed.isNewCategory) {
      cat =
        (await addCategory(
          parsed.categoryName,
          editType,
          "#10B981",
          parsed.categoryEmoji, // AI-picked category emoji (never a plain 🏷️)
        )) || undefined;
    }

    // Store the ITEM emoji at the start of the description so category-detail
    // rows show ☕ / 🍞 / ⛽ per transaction while the CATEGORY keeps its own icon.
    const cleanDesc = (editDesc || parsed.description || "").trim();
    const description = cleanDesc.startsWith(parsed.itemEmoji)
      ? cleanDesc
      : `${parsed.itemEmoji} ${cleanDesc}`.trim();

    const inserted = await addTransaction({
      card_id: cardId,
      category_id: cat?.id ?? null,
      type: editType,
      amount,
      description,
      date: new Date().toISOString().split("T")[0],
    });

    // Save the debit/credit tag directly to the dedicated column when we can.
    if (inserted?.id) {
      try {
        await supabase
          .from("transactions")
          .update({ payment_tag: editTag })
          .eq("id", inserted.id);
      } catch { /* non-fatal */ }
    }

    if (inserted) {
      toast.success(`${editType === "income" ? "Income" : "Expense"} added by voice`);
      handleClose();
    } else {
      toast.error("Could not save the transaction.");
      setPhase("confirm");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="wrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 20%, hsl(160 84% 25%) 0%, hsl(160 60% 8%) 55%, hsl(220 20% 3%) 100%)",
          }}
        />

        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-primary/30 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute bottom-10 -right-20 w-80 h-80 rounded-full bg-primary/20 blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
          aria-label="Close"
          className="absolute top-4 right-4 z-[70] w-12 h-12 rounded-full bg-black/40 backdrop-blur border border-white/15 text-white flex items-center justify-center active:scale-95 transition"
        >
          <X size={22} />
        </button>

        <div className="relative h-full w-full flex flex-col items-center justify-between p-6 pt-16 pb-10 max-w-lg mx-auto overflow-y-auto">
          <div className="flex-1 w-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              {phase === "listening" && (
                <motion.div
                  key="listening"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="w-full text-center"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-primary-foreground/70 mb-4">
                    Listening
                  </p>
                  <p className="text-2xl sm:text-3xl font-display font-medium text-white leading-snug min-h-[6rem]">
                    {transcript ? (
                      transcript
                    ) : (
                      <span className="text-white/40">
                        Say something like<br />"I spent 20 on coffee"
                      </span>
                    )}
                  </p>
                  {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
                </motion.div>
              )}

              {phase === "processing" && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-4"
                >
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                  <p className="text-white/80">Understanding…</p>
                  <p className="text-xs text-white/50 italic max-w-xs text-center">"{transcript}"</p>
                </motion.div>
              )}

              {phase === "confirm" && parsed && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full"
                >
                  <div className="rounded-3xl bg-white/[0.07] backdrop-blur-xl border border-white/15 p-5 space-y-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)]">
                    {/* What we heard — verbatim */}
                    <div className="rounded-2xl bg-black/30 border border-white/10 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">You said</p>
                      <p className="text-white/90 text-sm italic">"{parsed.transcript || transcript}"</p>
                    </div>

                    {/* Item emoji + Category */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-3xl">
                        {parsed.itemEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Category</p>
                        <p className="text-white font-medium truncate">
                          <span className="mr-1">{parsed.categoryEmoji}</span>
                          {parsed.categoryName}
                          {parsed.isNewCategory && (
                            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/25 text-primary align-middle">new</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditType("expense")}
                        className={`h-11 rounded-xl flex items-center justify-center gap-2 border transition ${
                          editType === "expense"
                            ? "bg-red-500/20 border-red-300/40 text-red-100"
                            : "bg-white/5 border-white/10 text-white/60"
                        }`}
                      >
                        <TrendingDown size={16} /> Expense
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditType("income")}
                        className={`h-11 rounded-xl flex items-center justify-center gap-2 border transition ${
                          editType === "income"
                            ? "bg-primary/25 border-primary/50 text-white"
                            : "bg-white/5 border-white/10 text-white/60"
                        }`}
                      >
                        <TrendingUp size={16} /> Income
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-white/50">Amount</label>
                      <input
                        inputMode="decimal"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value.replace(",", "."))}
                        className="w-full mt-1 bg-transparent text-3xl font-bold font-display text-white outline-none border-b border-white/15 focus:border-primary/60 py-1"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-white/50">Description</label>
                      <input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Add a note…"
                        className="w-full mt-1 bg-white/5 border border-white/10 focus:border-primary/50 rounded-xl px-3 py-2 text-white placeholder:text-white/30 outline-none"
                      />
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-2">Tag</p>
                      <div className="flex gap-2">
                        {(["debit", "credit"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setEditTag(t)}
                            className={`px-4 h-9 rounded-full text-sm border transition ${
                              editTag === t
                                ? "bg-white text-primary border-white"
                                : "bg-white/5 border-white/15 text-white/70"
                            }`}
                          >
                            {t === "debit" ? "Debit" : "Credit"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {phase === "saving" && (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <Loader2 className="w-12 h-12 text-white animate-spin" />
                  <p className="text-white/80">Saving…</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="w-full flex items-center justify-center gap-6 mt-6">
            {phase === "listening" && (
              <>
                <button
                  onClick={start}
                  aria-label="Restart"
                  className="w-14 h-14 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center backdrop-blur"
                >
                  <RefreshCw size={22} />
                </button>

                <button
                  onClick={finishNow}
                  aria-label="Finish"
                  className="relative w-24 h-24 rounded-full bg-white text-primary flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.35)] active:scale-95 transition"
                >
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-white/40"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                  <Check size={40} strokeWidth={3} />
                </button>

                <div className="w-14 h-14" />
              </>
            )}

            {phase === "confirm" && (
              <div className="w-full flex gap-3">
                <button
                  onClick={start}
                  className="flex-1 h-14 rounded-full bg-white/10 border border-white/20 text-white font-medium flex items-center justify-center gap-2 backdrop-blur"
                >
                  <Mic size={18} /> Try again
                </button>
                <button
                  onClick={confirm}
                  className="flex-1 h-14 rounded-full bg-white text-primary font-semibold flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95"
                >
                  <Check size={20} strokeWidth={3} /> Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceTransactionModal;
