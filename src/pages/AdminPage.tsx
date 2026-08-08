import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Shield, 
  ArrowLeft, 
  History, 
  CheckCircle2, 
  XCircle,
  Loader2,
  RefreshCw,
  Settings,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/useSubscription";
import BottomNav from "@/components/BottomNav";
import MrrDashboard from "@/components/MrrDashboard";

interface WebhookLog {
  id: string;
  email: string;
  evento: string;
  plano_aplicado: string | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
  source: string | null;
}

const PAGE_SIZE = 50;

const AdminPage = () => {
  const navigate = useNavigate();
  const { isAdmin } = useSubscription();
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, navigate]);

  const fetchLogs = async (offset = 0, append = false) => {
    if (!append) setLoadingLogs(true);
    else setLoadingMore(true);

    const { data, error } = await supabase
      .from("webhook_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      console.error("Error fetching logs:", error);
      toast.error("Error loading logs");
    } else {
      const fetched = (data || []) as unknown as WebhookLog[];
      if (append) {
        setLogs((prev) => [...prev, ...fetched]);
      } else {
        setLogs(fetched);
      }
      setHasMore(fetched.length === PAGE_SIZE);
    }
    setLoadingLogs(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    if (isAdmin) fetchLogs();
  }, [isAdmin]);

  // Realtime subscription for new webhook logs
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel(`webhook-logs-realtime-`+Math.random().toString(36).slice(2))
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "webhook_logs" },
        (payload) => {
          const newLog = payload.new as WebhookLog;
          setLogs((prev) => [newLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const handleLoadMore = () => {
    fetchLogs(logs.length, true);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-US", {
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
      <div className="p-4 border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mr-4">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Shield className="w-5 h-5 text-amber-500 mr-2" />
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-8">
        {/* MRR Dashboard */}
        <MrrDashboard />

        {/* Admin shortcuts */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate("/admin/settings")}
            className="finance-card text-left hover:border-primary/50 transition"
          >
            <Settings className="w-5 h-5 text-primary mb-2" />
            <p className="font-semibold">Payment Settings</p>
            <p className="text-xs text-muted-foreground">Hotmart checkout URL</p>
          </button>
          <button
            onClick={() => navigate("/admin/support")}
            className="finance-card text-left hover:border-primary/50 transition"
          >
            <MessageSquare className="w-5 h-5 text-primary mb-2" />
            <p className="font-semibold">Support Tickets</p>
            <p className="text-xs text-muted-foreground">Manage user support</p>
          </button>
        </div>

        {/* Webhook History */}
        <div className="finance-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Webhook History
            </h2>
            <Button variant="ghost" size="sm" onClick={() => fetchLogs()} disabled={loadingLogs}>
              <RefreshCw className={`w-4 h-4 ${loadingLogs ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {loadingLogs ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No webhooks logged yet
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs">{formatDate(log.created_at)}</TableCell>
                        <TableCell className="text-xs font-medium">{log.email}</TableCell>
                        <TableCell className="text-xs">{log.evento}</TableCell>
                        <TableCell className="text-xs">{log.plano_aplicado || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="default"
                            className={
                              log.source === "hotmart"
                                ? "bg-green-600 hover:bg-green-700 text-white text-[10px]"
                                : log.source === "hotmart"
                                ? "bg-amber-600 hover:bg-amber-700 text-white text-[10px]"
                                : "bg-blue-600 hover:bg-blue-700 text-white text-[10px]"
                            }
                          >
                            {log.source || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.success ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="flex items-center gap-1">
                              <XCircle className="w-4 h-4 text-red-500" />
                              {log.error_message && (
                                <span className="text-xs text-red-400 max-w-[100px] truncate">
                                  {log.error_message}
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {hasMore && (
                <div className="flex justify-center mt-4">
                  <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={loadingMore}>
                    {loadingMore ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading...</>
                    ) : (
                      "Load more"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminPage;
