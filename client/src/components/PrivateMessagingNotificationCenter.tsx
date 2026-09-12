import { Bell, Mail, MonitorSpeaker, Volume2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type NotificationConversation = {
  id: number;
  subject: string;
  unreadCount: number;
  lastMessageAt: Date | string;
  learner?: { name: string | null; email: string | null };
};

export function PrivateMessagingNotificationCenter({
  isAdmin,
  onOpenConversation,
}: {
  isAdmin: boolean;
  onOpenConversation?: (conversationId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
  const preferencesQuery = trpc.privateMessaging.getNotificationPreferences.useQuery(undefined, { refetchOnWindowFocus: true });
  const notificationsQuery = trpc.privateMessaging.getNotificationCenter.useQuery({ limit: 20 }, { refetchOnWindowFocus: true });
  const updatePreferences = trpc.privateMessaging.updateNotificationPreferences.useMutation({
    onSuccess: async () => {
      await utils.privateMessaging.getNotificationPreferences.invalidate();
      toast.success("Préférences de notification enregistrées.");
    },
    onError: (error) => toast.error(error.message),
  });
  const preferences = preferencesQuery.data || { webEnabled: true, emailEnabled: true, soundEnabled: true };
  const notifications = (notificationsQuery.data || []) as NotificationConversation[];
  const unreadCount = notifications.reduce((count, item) => count + Number(item.unreadCount || 0), 0);
  const update = (key: "webEnabled" | "emailEnabled" | "soundEnabled", checked: boolean) => {
    updatePreferences.mutate({ ...preferences, [key]: checked });
  };

  return <>
    <Button variant="outline" size="icon" className="relative shrink-0 rounded-full bg-white" aria-label={unreadCount ? `${unreadCount} messages privés non lus` : "Centre de notifications privées"} onClick={() => setOpen(true)}>
      <Bell className="h-4 w-4" />
      {unreadCount ? <Badge className="absolute -right-1 -top-1 min-w-5 rounded-full px-1 py-0 text-[10px]">{unreadCount > 99 ? "99+" : unreadCount}</Badge> : null}
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Notifications de messagerie</DialogTitle>
          <DialogDescription>Les alertes indiquent uniquement un fil et son état. Le contenu des messages reste accessible après ouverture du fil.</DialogDescription>
        </DialogHeader>
        <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
          {notifications.map((item) => <button key={item.id} type="button" className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={() => { onOpenConversation?.(item.id); setOpen(false); }}><span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-950">{item.subject}</span><span className="mt-0.5 block text-xs text-slate-500">{isAdmin ? item.learner?.name || item.learner?.email || "Apprenant" : "Équipe Neopolis"}</span></span><Badge>{item.unreadCount}</Badge></button>)}
          {!notifications.length && !notificationsQuery.isLoading ? <p className="py-6 text-center text-sm text-slate-500">Aucun message privé non lu.</p> : null}
          {notificationsQuery.isLoading ? <p className="py-6 text-center text-sm text-slate-500">Chargement des notifications…</p> : null}
        </div>
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-950">Préférences personnelles</p>
          <PreferenceRow id="private-notification-web" icon={<MonitorSpeaker className="h-4 w-4" />} label="Alertes dans l’application" description="Mettre à jour le centre et les alertes live." checked={preferences.webEnabled} disabled={updatePreferences.isPending} onCheckedChange={(checked) => update("webEnabled", checked)} />
          <PreferenceRow id="private-notification-email" icon={<Mail className="h-4 w-4" />} label="E-mails de notification" description="E-mail minimal sans contenu de conversation." checked={preferences.emailEnabled} disabled={updatePreferences.isPending} onCheckedChange={(checked) => update("emailEnabled", checked)} />
          <PreferenceRow id="private-notification-sound" icon={<Volume2 className="h-4 w-4" />} label="Signal sonore" description="Jouer un signal discret pour un message reçu lorsque l’application est active." checked={preferences.soundEnabled} disabled={updatePreferences.isPending || !preferences.webEnabled} onCheckedChange={(checked) => update("soundEnabled", checked)} />
        </div>
      </DialogContent>
    </Dialog>
  </>;
}

function PreferenceRow({ id, icon, label, description, checked, disabled, onCheckedChange }: { id: string; icon: React.ReactNode; label: string; description: string; checked: boolean; disabled: boolean; onCheckedChange: (checked: boolean) => void }) {
  return <div className="flex items-start justify-between gap-4"><div className="flex min-w-0 gap-3"><span className="mt-0.5 text-primary" aria-hidden="true">{icon}</span><div><Label htmlFor={id} className="text-sm font-medium text-slate-900">{label}</Label><p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p></div></div><Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} /></div>;
}
