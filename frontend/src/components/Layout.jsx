import { Outlet } from "react-router-dom";
import { Header } from "./Header.jsx";
import { Footer } from "./Footer.jsx";
import { ChatWidget } from "./ChatWidget.jsx";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-page">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
