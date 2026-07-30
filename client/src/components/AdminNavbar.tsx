import { Link, useLocation } from "wouter";
import { Bell, ArrowLeft } from "lucide-react";

const LOGO_URL = "/api/assets/logo_neopolis_akademy_9c9a0823.png";

type AdminPage = "candidatures" | "training" | "content";

const NAV_ITEMS: { id: AdminPage; label: string; href: string }[] = [
  { id: "candidatures", label: "Candidatures", href: "/admin" },
  { id: "training", label: "Suivi Apprenants", href: "/admin/training" },
  { id: "content", label: "Contenu", href: "/admin/content" },
];

interface AdminNavbarProps {
  activePage: AdminPage;
  /** Optional: notification bell content (rendered on the right) */
  notificationSlot?: React.ReactNode;
}

export function AdminNavbar({ activePage, notificationSlot }: AdminNavbarProps) {
  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: "var(--wise-canvas)", borderBottom: "1px solid var(--wise-canvas-soft)" }}>
      <div className="container flex items-center justify-between h-16">
        {/* Left: Logo + Badge */}
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <img src={LOGO_URL} alt="Neopolis Akademy" className="h-8 object-contain cursor-pointer" />
          </Link>
          <span className="text-xs font-semibold ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: "var(--wise-primary-pale)", color: "var(--wise-positive-deep)" }}>Admin</span>
        </div>

        {/* Center: Navigation tabs */}
        <div className="flex items-center gap-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                activePage === item.id ? "font-semibold" : "hover:bg-gray-100"
              }`}
              style={{
                backgroundColor: activePage === item.id ? "var(--wise-primary-pale)" : undefined,
                color: activePage === item.id ? "var(--wise-positive-deep)" : "var(--wise-mute)",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right: Notifications + Back */}
        <div className="flex items-center gap-2">
          {notificationSlot}
          <Link href="/">
            <button className="wise-btn-tertiary text-sm flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
