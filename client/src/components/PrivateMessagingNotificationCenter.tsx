import { Bell, Mail, MonitorSpeaker, Volume2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
  const preferencesQuery = trpc.privateMessaging.getNotificationPreferences.useQuery(undefined, { refetchOnWindowFocus: true });
  const notificationsQuery = trpc.privateMessaging.getNotificationCenter.useQuery({ limit: 20 }, { refetchOnWindowFocus: true });
  const updatePreferences = trpc.privateMessaging.updateNotificationPreferences.useMutation({
    onSuccess: async () => {
      await utils.privateMessaging.getNotificationPreferences.invalidate();
      toast.success(t({ fr: "Préférences de notification enregistrées.", en: "Notification preferences saved.", ar: "تم حفظ تفضيلات الإشعارات." }));
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
    <Button variant="outline" size="icon" className="relative shrink-0 rounded-full bg-white" aria-label={unreadCount ? t({ fr: `${unreadCount} messages privés non lus`, en: `${unreadCount} unread private messages`, ar: `${unreadCount} رسائل خاصة غير مقروءة` }) : t({ fr: "Centre de notifications privées", en: "Private notification center", ar: "مركز الإشعارات الخاصة" })} onClick={() => setOpen(true)}>
      <Bell className="h-4 w-4" />
      {unreadCount ? <Badge className="absolute -right-1 -top-1 min-w-5 rounded-full px-1 py-0 text-[10px]">{unreadCount > 99 ? "99+" : unreadCount}</Badge> : null}
    </Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t({ fr: "Notifications de messagerie", en: "Message notifications", ar: "إشعارات الرسائل" })}</DialogTitle>
          <DialogDescription>{t({ fr: "Les alertes indiquent uniquement un fil et son état. Le contenu des messages reste accessible après ouverture du fil.", en: "Alerts only identify a conversation and its status. Message content remains available after opening it.", ar: "تُظهر التنبيهات المحادثة وحالتها فقط. يبقى محتوى الرسائل متاحًا بعد فتحها." })}</DialogDescription>
        </DialogHeader>
        <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
          {notifications.map((item) => <button key={item.id} type="button" className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" onClick={() => { onOpenConversation?.(item.id); setOpen(false); }}><span className="min-w-0"><span className="block truncate text-sm font-medium text-slate-950">{item.subject}</span><span className="mt-0.5 block text-xs text-slate-500">{isAdmin ? item.learner?.name || item.learner?.email || t({ fr: "Apprenant", en: "Learner", ar: "متعلم" }) : t({ fr: "Équipe Neopolis", en: "Neopolis team", ar: "فريق نيوبوليس" })}</span></span><Badge>{item.unreadCount}</Badge></button>)}
          {!notifications.length && !notificationsQuery.isLoading ? <p className="py-6 text-center text-sm text-slate-500">{t({ fr: "Aucun message privé non lu.", en: "No unread private messages.", ar: "لا توجد رسائل خاصة غير مقروءة." })}</p> : null}
          {notificationsQuery.isLoading ? <p className="py-6 text-center text-sm text-slate-500">{t({ fr: "Chargement des notifications…", en: "Loading notifications…", ar: "جارٍ تحميل الإشعارات…" })}</p> : null}
        </div>
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <p className="text-sm font-semibold text-slate-950">{t({ fr: "Préférences personnelles", en: "Personal preferences", ar: "التفضيلات الشخصية" })}</p>
          <PreferenceRow id="private-notification-web" icon={<MonitorSpeaker className="h-4 w-4" />} label={t({ fr: "Alertes dans l’application", en: "In-app alerts", ar: "تنبيهات داخل التطبيق" })} description={t({ fr: "Mettre à jour le centre et les alertes live.", en: "Update the notification center and live alerts.", ar: "تحديث مركز الإشعارات والتنبيهات المباشرة." })} checked={preferences.webEnabled} disabled={updatePreferences.isPending} onCheckedChange={(checked) => update("webEnabled", checked)} />
          <PreferenceRow id="private-notification-email" icon={<Mail className="h-4 w-4" />} label={t({ fr: "E-mails de notification", en: "Email notifications", ar: "إشعارات البريد الإلكتروني" })} description={t({ fr: "E-mail minimal sans contenu de conversation.", en: "A minimal email without conversation content.", ar: "بريد إلكتروني مختصر بدون محتوى المحادثة." })} checked={preferences.emailEnabled} disabled={updatePreferences.isPending} onCheckedChange={(checked) => update("emailEnabled", checked)} />
          <PreferenceRow id="private-notification-sound" icon={<Volume2 className="h-4 w-4" />} label={t({ fr: "Signal sonore", en: "Sound alert", ar: "تنبيه صوتي" })} description={t({ fr: "Jouer un signal discret pour un message reçu lorsque l’application est active.", en: "Play a discreet sound when a message arrives while the app is active.", ar: "تشغيل صوت خافت عند وصول رسالة أثناء استخدام التطبيق." })} checked={preferences.soundEnabled} disabled={updatePreferences.isPending || !preferences.webEnabled} onCheckedChange={(checked) => update("soundEnabled", checked)} />
        </div>
      </DialogContent>
    </Dialog>
  </>;
}

function PreferenceRow({ id, icon, label, description, checked, disabled, onCheckedChange }: { id: string; icon: React.ReactNode; label: string; description: string; checked: boolean; disabled: boolean; onCheckedChange: (checked: boolean) => void }) {
  return <div className="flex items-start justify-between gap-4"><div className="flex min-w-0 gap-3"><span className="mt-0.5 text-primary" aria-hidden="true">{icon}</span><div><Label htmlFor={id} className="text-sm font-medium text-slate-900">{label}</Label><p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p></div></div><Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} /></div>;
}
