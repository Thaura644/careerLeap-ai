import { useEffect, useState } from "react";
import { Bot, Check, Copy, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiDelete, apiGet, apiPost, API_BASE } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

type McpTokenSummary = {
  id: number;
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
};

/**
 * Real MCP (Model Context Protocol) connections — lets the user generate a
 * personal access token so Claude, ChatGPT, or any other MCP-compatible AI
 * assistant can connect to their own Leap.ai account and read their real
 * data (see backend McpServerController). The token is shown exactly once.
 */
export const McpConnections = () => {
  const { toast } = useToast();
  const [tokens, setTokens] = useState<McpTokenSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [freshToken, setFreshToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = () => {
    apiGet<{ tokens: McpTokenSummary[] }>("/mcp/tokens")
      .then((res) => setTokens(res.tokens || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await apiPost<{ token: string }>("/mcp/tokens", { label: label || "AI assistant" });
      setFreshToken(res.token);
      setLabel("");
      load();
    } catch {
      toast({ title: "Couldn't create token", description: "Try again in a moment.", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: number) => {
    try {
      await apiDelete(`/mcp/tokens/${id}`);
      setTokens((t) => t.filter((x) => x.id !== id));
    } catch {
      toast({ title: "Couldn't revoke token", description: "Try again in a moment.", variant: "destructive" });
    }
  };

  const copyToken = () => {
    if (!freshToken) return;
    navigator.clipboard.writeText(freshToken).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const mcpUrl = `${API_BASE}/mcp`;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-edu-indigo/10 text-edu-indigo">
          <Bot className="h-5 w-5" />
        </span>
        <div>
          <h3 className="font-semibold">Connect AI assistants (MCP)</h3>
          <p className="text-sm text-muted-foreground">
            Generate a token so Claude, ChatGPT, or any MCP-compatible assistant can read your
            real Leap.ai profile, practice scenarios, and plan — with your permission, scoped to
            your account only.
          </p>
        </div>
      </div>

      {freshToken && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            Copy this now — you won't be able to see it again.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded bg-white px-3 py-2 text-xs dark:bg-black/30">
              {freshToken}
            </code>
            <Button size="sm" variant="outline" onClick={copyToken}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <details className="mt-3 text-xs text-muted-foreground">
            <summary className="cursor-pointer font-medium">Setup instructions</summary>
            <div className="mt-2 space-y-2">
              <p><strong>Claude Code:</strong></p>
              <code className="block overflow-x-auto rounded bg-white p-2 dark:bg-black/30">
                claude mcp add --transport http leap-ai {mcpUrl} --header &quot;Authorization: Bearer {freshToken}&quot;
              </code>
              <p>
                <strong>Claude Desktop / other MCP clients:</strong> add a remote server pointing
                to <code>{mcpUrl}</code> with an <code>Authorization: Bearer &lt;token&gt;</code>{" "}
                header.
              </p>
            </div>
          </details>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="Label (e.g. 'Claude Desktop')"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={100}
        />
        <Button onClick={handleCreate} disabled={creating} className="shrink-0 bg-edu-indigo hover:bg-opacity-90">
          {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate token
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : tokens.length === 0 ? (
        <p className="text-sm text-muted-foreground">No connections yet.</p>
      ) : (
        <div className="space-y-2">
          {tokens.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{t.label}</p>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(t.createdAt).toLocaleDateString()}
                  {t.lastUsedAt ? ` · last used ${new Date(t.lastUsedAt).toLocaleDateString()}` : " · never used"}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => handleRevoke(t.id)} aria-label="Revoke">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
