import { useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, Check, Loader2, ImagePlus, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/BackButton";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { scanReceipt } from "@/lib/ai.functions";
import { useAuth } from "@/context/AuthContext";
import { useCards } from "@/hooks/useCards";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { useCurrency } from "@/hooks/useCurrency";

type Extracted = {
  amount?: number;
  currency?: string;
  date?: string;
  merchant?: string;
  description?: string;
  type?: "income" | "expense";
  category?: string;
  categoryEmoji?: string;

};

const BUCKET = "financial-documents";

const ScanPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const scanReceiptFn = useServerFn(scanReceipt);
  const { cards } = useCards();
  const { categories, addCategory, updateCategory, refetch: refetchCategories } = useCategories();
  const { addTransaction } = useTransactions();
  const { formatCurrency } = useCurrency();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);


  const [preview, setPreview] = useState<string | null>(null);
  const [phase, setPhase] = useState<"camera" | "preview" | "processing" | "result">("camera");
  const [result, setResult] = useState<Extracted | null>(null);
  const [saving, setSaving] = useState(false);
  const [camError, setCamError] = useState<string | null>(null);

  const stopCam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const startCam = async () => {
    stopCam();
    setCamError(null);
    const md = typeof navigator !== "undefined" ? navigator.mediaDevices : undefined;
    if (!md?.getUserMedia) {
      setCamError(
        window.isSecureContext === false
          ? "A câmara só funciona em HTTPS. Use “Galeria/Foto” para enviar o documento."
          : "Câmara indisponível aqui. Use “Galeria/Foto” para enviar o documento.",
      );
      return;
    }
    try {
      const s = await md.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play().catch(() => {});
      }
    } catch (e: any) {
      const name = e?.name;
      setCamError(
        name === "NotAllowedError" || name === "SecurityError"
          ? "Acesso à câmara negado. Ative-o nas permissões do navegador."
          : name === "NotFoundError" || name === "OverconstrainedError"
            ? "Nenhuma câmara encontrada. Use “Galeria/Foto”."
            : "Não foi possível abrir a câmara. Use “Galeria/Foto”.",
      );
    }
  };

  useEffect(() => {
    if (phase === "camera") startCam();
    return () => stopCam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);


  const capture = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d")?.drawImage(v, 0, 0);
    setPreview(c.toDataURL("image/jpeg", 0.9));
    stopCam();
    setPhase("preview");
  };

  const pickFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      stopCam();
      setPhase("preview");
    };
    reader.readAsDataURL(file);
  };

  const dataUriToBlob = (uri: string) => {
    const [meta, b64] = uri.split(",");
    const mime = /data:(.*?);base64/.exec(meta)?.[1] || "image/jpeg";
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  };

  const analyze = async () => {
    if (!preview || !user) return;
    setPhase("processing");
    try {
      const blob = dataUriToBlob(preview);
      const isPdf = blob.type === "application/pdf";
      const path = `${user.id}/${Date.now()}.${isPdf ? "pdf" : "jpg"}`;
      const up = await supabase.storage.from(BUCKET).upload(path, blob, {
        contentType: blob.type,
        upsert: false,
      });
      if (up.error) throw up.error;

      const data = await scanReceiptFn({
        data: {
          file_path: path,
          mime_type: blob.type,
          file_name: isPdf ? "documento.pdf" : "recibo.jpg",
          categories: categories.map((c) => c.name),
        },
      });

      const extracted = (data as any)?.extracted as Extracted | undefined;
      if (!extracted || !(Number(extracted.amount) > 0)) {
        throw new Error("Não conseguimos ler o valor deste documento. Tente outra foto.");
      }
      setResult(extracted);
      setPhase("result");
    } catch (e: any) {
      toast.error(e?.message || "Falha ao analisar.");
      setPhase("preview");
    }
  };

  /** Normaliza a data lida (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YY...) para YYYY-MM-DD. */
  const normalizeDate = (raw?: string) => {
    const today = new Date().toISOString().slice(0, 10);
    if (!raw) return today;
    const s = raw.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/.exec(s);
    if (m) {
      const d = m[1].padStart(2, "0");
      const mo = m[2].padStart(2, "0");
      const y = m[3].length === 2 ? `20${m[3]}` : m[3];
      const iso = `${y}-${mo}-${d}`;
      if (!Number.isNaN(new Date(iso).getTime())) return iso;
    }
    const parsed = new Date(s);
    return Number.isNaN(parsed.getTime()) ? today : parsed.toISOString().slice(0, 10);
  };

  const norm = (v: string) =>
    v
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  const isEmoji = (v?: string | null) => !!v && /\p{Extended_Pictographic}/u.test(v);

  const save = async () => {
    if (!result || !user) return;
    setSaving(true);
    const type: "income" | "expense" = result.type === "income" ? "income" : "expense";
    const wanted = norm(result.category || "");
    let cat = categories.find((c) => c.type === type && norm(c.name) === wanted);
    if (!cat && wanted) cat = categories.find((c) => norm(c.name) === wanted);
    const emoji = isEmoji(result.categoryEmoji) ? result.categoryEmoji! : "🧾";

    if (!cat && result.category) {
      cat =
        (await addCategory(
          result.category,
          type,
          type === "income" ? "#22C55E" : "#EF4444",
          emoji,
        )) || undefined;
    }
    // Garante que a categoria existente mostra um emoji no gráfico de pizza
    if (cat && !isEmoji(cat.icon)) {
      await updateCategory(cat.id, { icon: emoji });
    }

    const occurred = normalizeDate(result.date);
    const saved = await addTransaction({
      category_id: cat?.id ?? null,
      type,
      amount: Number(result.amount) || 0,
      description: result.merchant || result.description || "Recibo digitalizado",
      icon: isEmoji(cat?.icon) ? cat!.icon : emoji,
      source: "scan",
      occurred_on: occurred,
      date: occurred,
    });
    setSaving(false);
    if (saved) {
      const now = new Date();
      const d = new Date(occurred);
      const sameMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      toast.success(
        sameMonth
          ? "Transação criada a partir da digitalização"
          : `Transação criada em ${d.toLocaleDateString("pt-PT")} — veja em “Sempre”.`,
      );
      await refetchCategories();
      navigate("/dashboard");
    } else {
      toast.error("Não foi possível guardar.");
    }
  };



  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <BackButton to="/dashboard" />
          <h1 className="text-lg font-semibold font-display text-foreground">Digitalizar recibo</h1>
          <div className="w-10" />
        </div>

        <AnimatePresence mode="wait">
          {phase === "camera" && (
            <motion.div
              key="camera"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden border border-primary/20 bg-black">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Frame guide */}
                <div className="pointer-events-none absolute inset-6 rounded-2xl border-2 border-primary/60 shadow-[0_0_60px_hsl(var(--primary)/0.4)_inset]" />
                <motion.div
                  aria-hidden
                  initial={{ y: 0 }}
                  animate={{ y: [0, 200, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute left-6 right-6 h-0.5 bg-primary shadow-[0_0_20px_hsl(var(--primary))]"
                />
                {camError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 bg-black/80 text-center">
                    <p className="text-sm text-foreground">{camError}</p>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="h-11 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
                    >
                      Tirar foto
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm underline text-muted-foreground"
                    >
                      Enviar da galeria (imagem ou PDF)
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-around">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Escolher da galeria"
                  className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-foreground active:scale-95 transition"
                >
                  <ImagePlus size={22} />
                </button>
                <button
                  onClick={() => (camError ? cameraInputRef.current?.click() : capture())}
                  aria-label="Capturar"
                  className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.5)] active:scale-95 transition"
                >
                  <Camera size={30} />
                </button>
                <div className="w-12 h-12" />
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Recibos, faturas, extratos ou comprovativos — imagem ou PDF.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) pickFile(f);
                  e.target.value = "";
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) pickFile(f);
                  e.target.value = "";
                }}
              />

            </motion.div>
          )}

          {phase === "preview" && preview && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {preview.startsWith("data:application/pdf") ? (
                <div className="w-full rounded-3xl border border-primary/20 bg-card/60 p-10 text-center text-sm text-muted-foreground">
                  PDF pronto para análise
                </div>
              ) : (
                <img
                  src={preview}
                  alt="Capturado"
                  className="w-full rounded-3xl border border-primary/20"
                />
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPreview(null);
                    setPhase("camera");
                  }}
                  className="flex-1 h-12 rounded-full border border-border text-foreground flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> Repetir
                </button>
                <button
                  onClick={analyze}
                  className="flex-1 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center gap-2 shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                >
                  <Zap size={18} /> Analisar
                </button>
              </div>
            </motion.div>
          )}

          {phase === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 gap-4"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">A ler o seu recibo com IA…</p>
            </motion.div>
          )}

          {phase === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {preview && (
                <img
                  src={preview}
                  alt=""
                  className="w-full max-h-48 object-cover rounded-2xl border border-border"
                />
              )}
              <div className="finance-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase text-muted-foreground">
                    {result.type === "income" ? "receita" : "despesa"}
                  </span>
                  <span
                    className={`text-2xl font-bold font-display ${
                      result.type === "income" ? "text-income" : "text-expense"
                    }`}
                  >
                    {result.type === "income" ? "+" : "-"}
                    {formatCurrency(Number(result.amount) || 0)}
                  </span>
                </div>
                <div className="pt-2 border-t border-border text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Comerciante: </span>
                    <span className="text-foreground">{result.merchant || "—"}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Categoria: </span>
                    <span className="text-foreground">{result.category || "Outros"}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Data: </span>
                    <span className="text-foreground">{result.date || "hoje"}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setPhase("camera")}
                  className="flex-1 h-12 rounded-full border border-border text-foreground"
                >
                  Digitalizar outro
                </button>
                <button
                  disabled={saving}
                  onClick={save}
                  className="flex-1 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center gap-2 shadow-[0_0_20px_hsl(var(--primary)/0.4)] disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Check size={18} /> Guardar transação
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <canvas ref={canvasRef} className="hidden" />
      </div>
      <BottomNav />
    </div>
  );
};

export default ScanPage;
