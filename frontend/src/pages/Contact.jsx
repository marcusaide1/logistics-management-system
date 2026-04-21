import { useState } from "react";
import { apiFetch } from "../api.js";
import { useToast } from "../toast.jsx";

export function Contact() {
  const { push } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSending(true);
    try {
      await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify({ email, name: name || undefined, subject, message })
      });
      push("Thanks — your message was received.", "success");
      setSubject("");
      setMessage("");
    } catch (err) {
      push(err.message || "Send failed", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900">Contact</h1>
      <p className="mt-3 text-slate-700">
        For quotes, support, or partnership inquiries, email{" "}
        <a className="font-medium text-sky-800 hover:underline" href="mailto:support@logiflow.example">
          support@logiflow.example
        </a>{" "}
        or use the form below.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-slate-800">Email</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-800">Name</span>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Subject</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-800">Message</span>
          <textarea
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            rows={5}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={sending}
          className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
