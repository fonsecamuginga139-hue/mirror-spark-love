import { useState, useEffect } from "react";
import { ArrowLeft, Send, Loader2, MessageCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

interface SupportTicket {
  id: string;
  user_id: string;
  email: string;
  subject: string;
  message: string;
  admin_reply: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const AdminSupportPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useSubscription();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isAdmin) navigate("/dashboard");
  }, [isAdmin, navigate]);

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTickets(data as SupportTicket[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchTickets();
  }, [isAdmin]);

  // Realtime
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel(`support-tickets-admin-`+Math.random().toString(36).slice(2))
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_tickets" },
        () => fetchTickets()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const handleReply = async () => {
    if (!selectedTicket || !reply.trim()) {
      toast.error("Write a reply.");
      return;
    }

    setSending(true);
    const { error } = await supabase
      .from("support_tickets")
      .update({
        admin_reply: reply.trim(),
        status: "answered",
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedTicket.id);

    if (error) {
      toast.error("Error ao enviar resposta.");
    } else {
      toast.success("Resposta enviada!");
      setReply("");
      setSelectedTicket(null);
    }
    setSending(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin")}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Reply to Support</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchTickets} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Selected ticket detail */}
        {selectedTicket && (
          <div className="finance-card mb-6 border border-primary/20 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{selectedTicket.email}</p>
                <p className="text-sm font-semibold text-foreground mt-1">{selectedTicket.subject}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setSelectedTicket(null); setReply(""); }}>
                ✕
              </Button>
            </div>

            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-primary/15 border border-primary/20 rounded-2xl rounded-br-sm px-3 py-2">
                <p className="text-sm text-foreground whitespace-pre-wrap">{selectedTicket.message}</p>
                <span className="text-[10px] text-muted-foreground mt-1 block text-right">
                  {formatDate(selectedTicket.created_at)}
                </span>
              </div>
            </div>

            {/* Existing reply */}
            {selectedTicket.admin_reply && (
              <div className="flex justify-start">
                <div className="max-w-[85%] bg-muted border border-border rounded-2xl rounded-bl-sm px-3 py-2">
                  <p className="text-[10px] font-semibold text-primary mb-1">Your previous reply</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{selectedTicket.admin_reply}</p>
                </div>
              </div>
            )}

            {/* Reply input */}
            <div className="space-y-2">
              <Textarea
                placeholder="Write your reply..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                className="bg-background border-border resize-none"
              />
              <Button onClick={handleReply} disabled={sending} className="w-full">
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Ticket list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="finance-card text-center py-12">
            <MessageCircle size={40} className="mx-auto text-muted-foreground mb-3 opacity-40" />
            <p className="text-muted-foreground">Nenhum ticket de suporte.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => { setSelectedTicket(ticket); setReply(ticket.admin_reply || ""); }}
                className="w-full finance-card text-left hover:border-primary/30 transition-colors border border-transparent"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{ticket.email}</p>
                    <p className="text-sm font-semibold text-foreground truncate">{ticket.subject}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      ticket.status === "answered"
                        ? "bg-primary/20 text-primary text-[10px] shrink-0"
                        : "bg-destructive/20 text-destructive text-[10px] shrink-0"
                    }
                  >
                    {ticket.status === "answered" ? "Answered" : "Open"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{ticket.message}</p>
                <p className="text-[10px] text-muted-foreground mt-2">{formatDate(ticket.created_at)}</p>
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default AdminSupportPage;
