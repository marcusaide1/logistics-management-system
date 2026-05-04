import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";
import { ChatWidget } from "./ChatWidget.jsx";
import { apiFetch } from "../api.js";

export function Layout() {
  const [systemOnline, setSystemOnline] = useState(true);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchStatus() {
      try {
        const data = await apiFetch("/system/status");
        if (!mounted) return;
        setSystemOnline(data.online);
        setStatusMessage(data.online ? "" : "Support is currently offline. Access is limited until someone is online.");
      } catch (err) {
        if (!mounted) return;
        setSystemOnline(false);
        setStatusMessage("Unable to reach the service. Please wait until support is back online.");
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-brand-page">
      <Header />
      {!systemOnline && (
        <div className="border-b border-amber-400 bg-amber-50 text-amber-900 px-4 py-3 text-center text-sm">
          {statusMessage}
        </div>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget systemOnline={systemOnline} />
    </div>
  );
}
