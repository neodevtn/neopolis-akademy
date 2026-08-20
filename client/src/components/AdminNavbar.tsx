import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { BrandLogo } from "@/components/BrandLogo";
import { Activity, AlertTriangle, ArrowLeft, BarChart3, BookOpen, ChevronDown, FileImage, KanbanSquare, LayoutDashboard, Menu, MessageSquare, UserCheck, UserPlus, Users } from "lucide-react";

type AdminPage = "candidatures" | "training" | "content" | "media" | "errors";
type NavItem = { label: string; href: string; icon: typeof LayoutDashboard; page: AdminPage; description: string };

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Recrutement",
    items: [
      { label: "Candidatures", href: "/admin", icon: LayoutDashboard, page: "candidatures", description: "Évaluer et décider" },
      { label: "Kanban candidatures", href: "/admin?tab=kanban", icon: KanbanSquare, page: "candidatures", description: "Suivre les étapes" },
      { label: "Évaluation", href: "/admin?tab=analytics", icon: BarChart3, page: "candidatures", description: "Analyser les candidatures" },
      { label: "Invitations de candidature", href: "/admin?tab=invitations", icon: UserPlus, page: "candidatures", description: "Relancer les candidats" },
      { label: "Candidats sélectionnés", href: "/admin/training?tab=selected", icon: UserCheck, page: "training", description: "Activer les comptes" },
    ],
  },
  {
    label: "Apprenants",
    items: [
      { label: "Suivi des apprenants", href: "/admin/training?tab=learners", icon: Users, page: "training", description: "Progression et engagement" },
      { label: "Invitations directes", href: "/admin/training?tab=invitations", icon: UserPlus, page: "training", description: "Inviter et annuler" },
      { label: "Reporting", href: "/admin/training?tab=analytics", icon: BarChart3, page: "training", description: "Performance et tendances" },
      { label: "Communications", href: "/admin?tab=communications", icon: MessageSquare, page: "candidatures", description: "Informer les publics" },
      { label: "Journal d’activité", href: "/admin?tab=activity", icon: Activity, page: "candidatures", description: "Tracer les actions" },
    ],
  },
  {
    label: "Pédagogie",
    items: [
      { label: "Contenu des cours", href: "/admin/content", icon: BookOpen, page: "content", description: "Cours, quiz et examens" },
      { label: "Bibliothèque médias", href: "/admin/media", icon: FileImage, page: "media", description: "Vidéos, PDF et images" },
    ],
  },
  {
    label: "Contrôle",
    items: [
      { label: "Erreurs client", href: "/admin/errors", icon: AlertTriangle, page: "errors", description: "Surveiller et traiter" },
    ],
  },
];

interface AdminNavbarProps {
  activePage: AdminPage;
  notificationSlot?: React.ReactNode;
}

function getCurrentLabel(location: string, activePage: AdminPage) {
  return NAV_GROUPS.flatMap((group) => group.items).find((item) => item.page === activePage && location === item.href)?.label
    || NAV_GROUPS.flatMap((group) => group.items).find((item) => item.page === activePage)?.label
    || "Administration";
}

/** Persistent admin navigation grouped by the administrator’s core workflows. */
export function AdminNavbar({ activePage, notificationSlot }: AdminNavbarProps) {
  const [location] = useLocation();
  const currentLocation = `${location}${typeof window === "undefined" ? "" : window.location.search}`;
  const currentLabel = getCurrentLabel(currentLocation, activePage);

  useEffect(() => {
    const root = document.getElementById("root");
    root?.classList.add("admin-navigation-shell");
    return () => root?.classList.remove("admin-navigation-shell");
  }, []);

  const isActive = (item: NavItem) => currentLocation === item.href || (item.href === "/admin" && currentLocation === "/admin");

  return <>
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-5">
        <Link href="/admin" className="flex min-w-0 items-center gap-3"><BrandLogo className="h-8 max-w-[132px]" /><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">Admin</span></Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Navigation administration">
        {NAV_GROUPS.map((group) => <section key={group.label} className="mb-6"><h2 className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{group.label}</h2><div className="space-y-1">{group.items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return <Link key={item.href} href={item.href} className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${active ? "bg-blue-50 text-blue-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`} aria-current={active ? "page" : undefined}><Icon className={`h-4 w-4 shrink-0 ${active ? "text-blue-700" : "text-slate-400 group-hover:text-slate-600"}`} /><span className="min-w-0 flex-1"><span className="block text-sm font-semibold leading-tight">{item.label}</span><span className={`mt-0.5 block truncate text-[11px] ${active ? "text-blue-600" : "text-slate-400"}`}>{item.description}</span></span></Link>;
        })}</div></section>)}
      </nav>
      <div className="border-t border-slate-100 p-3"><Link href="/" className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"><ArrowLeft className="h-4 w-4" /> Voir le site</Link></div>
    </aside>

    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
      <div className="flex min-w-0 items-center gap-2"><span className="hidden text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 sm:inline">Administration</span><span className="hidden text-slate-300 sm:inline">/</span><span className="truncate text-sm font-semibold text-slate-900">{currentLabel}</span></div>
      <div className="flex items-center gap-2">{notificationSlot}<Link href="/" className="hidden items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 sm:flex lg:hidden"><ArrowLeft className="h-4 w-4" /> Retour</Link><details className="relative lg:hidden"><summary className="flex cursor-pointer list-none items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"><Menu className="h-4 w-4" /> Menu<ChevronDown className="h-3.5 w-3.5" /></summary><div className="absolute right-0 top-11 z-50 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">{NAV_GROUPS.map((group) => <div key={group.label} className="mb-2 last:mb-0"><p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{group.label}</p>{group.items.map((item) => <Link key={item.href} href={item.href} className={`block rounded-md px-2 py-2 text-sm ${isActive(item) ? "bg-blue-50 font-semibold text-blue-800" : "text-slate-700 hover:bg-slate-50"}`}>{item.label}</Link>)}</div>)}</div></details></div>
    </header>
  </>;
}
