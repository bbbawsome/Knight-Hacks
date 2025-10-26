import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function sanitizeMarkdown(text: string) {
  if (!text) return text;
  let t = String(text);

  // Convert common bullet characters to markdown bullets
  t = t.replace(/•/g, "-");

  // Ensure section headings (bolded labels like **Key points:** ) start on their own line
  t = t.replace(/\*\*([^*]+?):\*\*/g, "\n\n**$1:**");

  // If bullets or numbered steps were glued to a heading, move them to new lines
  t = t.replace(/\*\*[^*]+\:\*\*\s*-\s*/g, (m) => m.replace(/-\s*/, "\n- "));

  // Convert inline " - " lists into real list items (only when preceded by punctuation/line start)
  t = t.replace(/(?<=[:;\-\n\r])\s*-\s+/g, "\n- ");
  // Fallback: convert " - " patterns that look like list markers
  t = t.replace(/\s-\s(?=[A-Z0-9])/g, "\n- ");

  // Ensure numbered steps are on their own lines
  t = t.replace(/\s?(\d+)\.\s+/g, "\n$1. ");

  // Normalize multiple blank lines
  t = t.replace(/\n{3,}/g, "\n\n");

  // Trim leading/trailing whitespace
  return t.trim();
}

export default function ChatClient() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setReply(null);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: input }] }),
      });
      const json = await res.json();
      if (json?.ok) setReply(json.reply ?? "");
      else setError(json?.error?.message || "Unknown server error");
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const rendered = reply ? sanitizeMarkdown(reply) : "";

  return (
    <div>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={4} cols={60} />
      <div style={{ marginTop: 8 }}>
        <button onClick={send} disabled={loading || !input.trim()}>
          {loading ? "Sending…" : "Send"}
        </button>
      </div>

      {reply !== null && (
        <div style={{ marginTop: 12 }}>
          <h4>Reply</h4>
          <div style={{ background: "#fff", padding: 12, borderRadius: 6 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{rendered}</ReactMarkdown>
          </div>
        </div>
      )}

      {error && (
        <div style={{ color: "crimson", marginTop: 12 }}>
          <h4>Error</h4>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
}