import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CheckCheck, CircleAlert, CircleCheck, Info } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ErrorState } from "../components/ui/ErrorState";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Seo } from "../components/seo/Seo";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications
} from "../features/notifications/notificationQueries";
import { usePreviewGuard } from "../features/preview/previewMode";
import { getErrorMessage } from "../lib/errors";
import { formatRelativeTime, notificationToneLabel } from "../lib/labels";
import type { NotificationItem } from "../types";

type NotificationFilter = "ALL" | "UNREAD" | "READ";

const toneIcon = {
  success: CircleCheck,
  warning: CircleAlert,
  danger: CircleAlert,
  info: Info
} as const;

const toneVariant: Record<NotificationItem["tone"], "success" | "warning" | "danger" | "neutral"> = {
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "neutral"
};

export const NotificationsPage = () => {
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const { isPreviewMode, guardPreviewAction } = usePreviewGuard();
  const [filter, setFilter] = useState<NotificationFilter>("ALL");

  const items = useMemo(() => notifications.data?.items || [], [notifications.data?.items]);
  const unreadCount = notifications.data?.unreadCount || 0;
  const filteredItems = useMemo(() => {
    if (filter === "UNREAD") {
      return items.filter((item) => !item.readAt);
    }
    if (filter === "READ") {
      return items.filter((item) => item.readAt);
    }
    return items;
  }, [filter, items]);

  const handleMarkRead = (id: string) => {
    if (guardPreviewAction("Mode demo menampilkan contoh notifikasi tanpa mengubah status baca.")) {
      return;
    }
    markRead.mutate(id);
  };

  const handleMarkAllRead = () => {
    if (guardPreviewAction("Mode demo menampilkan contoh notifikasi tanpa mengubah status baca.")) {
      return;
    }
    markAllRead.mutate();
  };

  return (
    <div className="space-y-6">
      <Seo title="Notifikasi" description="Pantau pembaruan cuti, data karyawan, dan aktivitas penting Staffora." />
      <PageHeader
        title="Notifikasi"
        eyebrow="Pusat Informasi"
        description="Ikuti pembaruan pengajuan cuti, perubahan data karyawan, dan aktivitas penting tanpa kehilangan konteks."
        meta={
          <>
            <Badge label={`${unreadCount} belum dibaca`} variant={unreadCount > 0 ? "warning" : "success"} />
            {isPreviewMode ? <Badge label="Mode demo lihat saja" variant="neutral" /> : null}
          </>
        }
        actions={
          <Button
            variant="secondary"
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markAllRead.isPending || isPreviewMode}
          >
            <CheckCheck size={16} />
            Tandai semua dibaca
          </Button>
        }
      />

      <Card className="space-y-4">
        <SectionHeader
          title="Daftar Notifikasi"
          description="Filter status baca untuk memprioritaskan informasi yang masih perlu ditindaklanjuti."
          icon={<Bell className="h-5 w-5 text-slate-500" />}
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { label: "Semua", value: "ALL" },
            { label: "Belum dibaca", value: "UNREAD" },
            { label: "Sudah dibaca", value: "READ" }
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`min-h-10 rounded-full px-4 text-sm font-semibold transition ${
                filter === tab.value
                  ? "bg-slate-950 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
              onClick={() => setFilter(tab.value as NotificationFilter)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {notifications.isLoading ? (
          <LoadingState label="Memuat notifikasi..." />
        ) : notifications.error ? (
          <ErrorState message={getErrorMessage(notifications.error, "Gagal memuat notifikasi")} />
        ) : filteredItems.length > 0 ? (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
            {filteredItems.map((item) => {
              const Icon = toneIcon[item.tone] || Info;
              return (
                <div key={item.id} className={`p-4 ${item.readAt ? "" : "bg-primary-50/60"}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <Link to={item.href} className="group flex min-w-0 gap-3">
                      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 ring-1 ring-slate-200">
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-slate-900 group-hover:text-primary-700">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-slate-600">{item.description}</span>
                        <span className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge label={notificationToneLabel[item.tone] || "Informasi"} variant={toneVariant[item.tone]} />
                          <span className="text-xs font-medium text-slate-400">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </span>
                      </span>
                    </Link>
                    {!item.readAt ? (
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => handleMarkRead(item.id)}
                        disabled={markRead.isPending || isPreviewMode}
                      >
                        Tandai dibaca
                      </Button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 p-8 text-center">
            <p className="font-semibold text-slate-900">Tidak ada notifikasi pada filter ini.</p>
            <p className="mt-2 text-sm text-slate-500">Coba lihat semua notifikasi atau tunggu pembaruan berikutnya.</p>
          </div>
        )}
      </Card>
    </div>
  );
};
