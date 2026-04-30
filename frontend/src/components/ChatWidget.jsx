import { useState, useRef, useEffect } from "react";
import { apiFetch } from "../api.js";
import { useToast } from "../toast.jsx";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const messagesEndRef = useRef(null);
  const { push } = useToast();

  // Initialize chat session
  useEffect(() => {
    if (open && !sessionId) {
      initializeSession();
    }
  }, [open, sessionId]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function initializeSession() {
    try {
      const data = await apiFetch("/chat/session", {
        method: "POST",
        body: JSON.stringify({
          visitorName: "Guest",
          visitorEmail: null
        })
      });
      setSessionId(data.session.sessionId);
      setMessages([
        {
          sender: "ai",
          content: "Hello! 👋 I'm the LogiFlow AI Assistant. How can I help you today? You can ask me about tracking shipments, payment status, or general logistics questions.",
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      push("Failed to start chat session", "error");
      console.error(err);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!input.trim() || !sessionId || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { sender: "user", content: userMsg, timestamp: new Date() }
    ]);

    setLoading(true);
    try {
      const data = await apiFetch("/chat/message", {
        method: "POST",
        body: JSON.stringify({
          sessionId,
          message: userMsg
        })
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          content: data.response.content,
          timestamp: new Date(),
          type: data.response.type
        }
      ]);

      if (data.escalated) {
        setEscalated(true);
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            content:
              "Your chat has been escalated to a human agent. They'll be with you shortly!",
            timestamp: new Date()
          }
        ]);
      }
    } catch (err) {
      push(err.message || "Failed to send message", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-sky-600 text-white shadow-lg hover:bg-sky-700 flex items-center justify-center text-xl z-40"
        aria-label="Open chat"
        title="Chat with us"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 rounded-lg shadow-2xl bg-white flex flex-col z-50 border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between bg-sky-600 text-white px-4 py-3 rounded-t-lg">
        <div>
          <h3 className="font-semibold">LogiFlow Support</h3>
          <p className="text-xs opacity-90">
            {escalated ? "Human agent connecting..." : "AI Assistant"}
          </p>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-white hover:bg-sky-700 rounded px-2 py-1"
          aria-label="Close chat"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <p>Loading chat...</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-sky-600 text-white"
                    : "bg-white text-slate-800 border border-slate-200"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {msg.timestamp?.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-800 border border-slate-200 px-3 py-2 rounded-lg">
              <div className="flex gap-1">
                <span className="inline-block w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                <span className="inline-block w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }}></span>
                <span className="inline-block w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-slate-200 bg-white p-3 rounded-b-lg"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={escalated ? "Waiting for agent..." : "Type your message..."}
            disabled={loading || escalated}
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:bg-slate-100"
          />
          <button
            type="submit"
            disabled={loading || !input.trim() || escalated}
            className="bg-sky-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-sky-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
