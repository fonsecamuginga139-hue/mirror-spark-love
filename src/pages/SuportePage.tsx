import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Loader2, MessageCircle, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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

const SupportPage = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchTickets = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setTickets(data as SupportTicket[]);
    }
    setLoadingTickets(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`support-tickets-user-`+Math.random().toString(36).slice(2))
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "support_tickets",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }

    if (!user || !profile?.email) {
      toast.error("Você precisa estar logado.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user.id,
        email: profile.email,
        subject: subject.trim(),
        message: message.trim(),
      });

      if (error) throw error;

      toast.success("Message sent. Our team will reply soon.");
      setSubject("");
      setMessage("");
      setShowForm(false);
    } catch {
      toast.error("Error sending message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/settings")}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft size={20} className="text-foreground" />
            </button>
            <h1 className="text-2xl font-bold text-foreground">Support</h1>
          </div>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="gap-1"
          >
            <Plus size={16} />
            New
          </Button>
        </div>

        {/* New Ticket Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="finance-card space-y-3 border border-primary/20">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <MessageCircle size={16} />
                New Message
              </h3>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject</label>
                <Input
                  placeholder="Ex: Issue adding a transaction"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={200}
                  className="bg-background border-border"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Message</label>
                <Textarea
                  placeholder="Describe the issue with as much detail as possible..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  rows={4}
                  className="bg-background border-border resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
                <Input
                  value={profile?.email || ""}
                  readOnly
                  className="bg-muted border-border text-muted-foreground"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        )}

        {/* Conversations */}
        <div className="space-y-1 mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <MessageCircle size={18} className="text-primary" />
            My Conversations
          </h2>
          <p className="text-xs text-muted-foreground">
            Your messages and team replies
          </p>
        </div>

        {loadingTickets ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="finance-card text-center py-12">
            <MessageCircle size={40} className="mx-auto text-muted-foreground mb-3 opacity-40" />
            <p className="text-muted-foreground text-sm">Nenhuma conversa ainda.</p>
            <p className="text-muted-foreground text-xs mt-1">
              Tap "New" to send a message.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="finance-card space-y-3">
                {/* Subject & Status */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">{ticket.subject}</span>
                  <Badge
                    variant="secondary"
                    className={
                      ticket.status === "answered"
                        ? "bg-primary/20 text-primary text-[10px] shrink-0"
                        : "bg-muted text-muted-foreground text-[10px] shrink-0"
                    }
                  >
                    {ticket.status === "answered" ? "Answered" : "Pending"}
                  </Badge>
                </div>

                {/* User message (right side) */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] bg-primary/15 border border-primary/20 rounded-2xl rounded-br-sm px-3 py-2">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{ticket.message}</p>
                    <span className="text-[10px] text-muted-foreground mt-1 block text-right">
                      {formatDate(ticket.created_at)}
                    </span>
                  </div>
                </div>

                {/* Admin reply (left side) */}
                {ticket.admin_reply && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] bg-muted border border-border rounded-2xl rounded-bl-sm px-3 py-2">
                      <p className="text-[10px] font-semibold text-primary mb-1">Vault Team</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{ticket.admin_reply}</p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">
                        {formatDate(ticket.updated_at)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default SupportPage;
