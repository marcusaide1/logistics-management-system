import { useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api.js";
import { useToast } from "../toast.jsx";

export function Footer() {
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
      push("Message sent. We will reply shortly.", "success");
      setSubject("");
      setMessage("");
    } catch (err) {
      push(err.message || "Could not send message", "error");
    } finally {
      setSending(false);
    }
  }

  return (
    <footer className="border-t border-sky-200 bg-brand-footer text-slate-900">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div>
          <p className="text-lg font-semibold">LogiFlow Logistics</p>
          <p className="mt-2 text-sm text-slate-700">
            Reliable freight, warehousing, and last-mile delivery for growing businesses.
          </p>
          <p className="mt-3 text-sm">
            <span className="font-medium">HQ:</span> 1200 Commerce Blvd, Houston, TX
          </p>
          <p className="text-sm">
            <a className="hover:underline" href="mailto:aidenehimarcus@gmail.com">
              aidenehimarcus@gmail.com
            </a>
          </p>
          <p className="text-sm">+1 (800) 555-0199</p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Links</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link className="hover:underline" to="/privacy">
                Privacy policy
              </Link>
            </li>
            <li>
              <Link className="hover:underline" to="/terms">
                Terms of service
              </Link>
            </li>
            <li>
              <Link className="hover:underline" to="/track">
                Parcel tracking
              </Link>
            </li>
          </ul>
          <p className="mt-4 text-sm font-semibold text-slate-600">Social</p>
          <div className="mt-2 flex gap-3 text-sm">
            <a className="hover:underline" href="https://facebook.com" target="_blank" rel="noreferrer">
              Facebook
            </a>
            <a className="hover:underline" href="https://twitter.com" target="_blank" rel="noreferrer">
              Twitter
            </a>
            <a className="hover:underline" href="https://instagram.com" target="_blank" rel="noreferrer">
              Instagram
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-600">Quick message</p>
          <form onSubmit={onSubmit} className="mt-3 space-y-2">
            <input
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Your email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Subject"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <textarea
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="Message"
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-md bg-sky-700 px-3 py-2 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send"}
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-sky-200 py-4 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} LogiFlow Logistics. All rights reserved.
      </div>
    </footer>
  );
}
