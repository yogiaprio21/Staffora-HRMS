import { Link } from "react-router-dom";
import { Bell, CheckCheck, CircleAlert, CircleCheck, Info, LogOut, Menu, UserCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { DropdownMenu } from "../ui/DropdownMenu";
import { formatRelativeTime, formatRole } from "../../lib/labels";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications
} from "../../features/notifications/notificationQueries";
import type { Employee } from "../../types";

export const Topbar = ({
  user,
  onLogout,
  onOpenSidebar
}: {
  user: Employee;
  onLogout: () => void;
  onOpenSidebar: () => void;
}) => {
  const notifications = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const items = notifications.data?.items || [];
  const unreadCount = notifications.data?.unreadCount || 0;
  const toneIcon = {
    success: CircleCheck,
    warning: CircleAlert,
    danger: CircleAlert,
    info: Info
  } as const;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-4 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur supports-[backdrop-filter]:bg-white/85 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Buka navigasi"
          onClick={onOpenSidebar}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <p className="text-sm text-slate-500">Selamat datang kembali</p>
          <p className="truncate text-lg font-semibold text-slate-900">
            {user.firstName} {user.lastName}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-sm text-slate-600 sm:gap-3">
        <DropdownMenu
          trigger={
            <button
              type="button"
              aria-label="Buka notifikasi"
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              <Bell size={18} />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-primary-600 px-1.5 text-xs font-semibold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </button>
          }
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2 py-1">
              <p className="font-semibold text-slate-900">Notifikasi</p>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:text-primary-800"
                  onClick={() => markAllRead.mutate()}
                >
                  <CheckCheck size={14} />
                  Tandai semua dibaca
                </button>
              ) : (
                <span className="text-xs text-slate-500">Tidak ada yang baru</span>
              )}
            </div>
            {items.length > 0 ? (
              items.map((item) => {
                const Icon = toneIcon[item.tone as keyof typeof toneIcon] || Info;
                return (
                  <div
                    key={item.id}
                    className={`rounded-xl px-3 py-3 ${item.readAt ? "bg-white" : "bg-primary-50/70"}`}
                  >
                    <div className="flex gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 ring-1 ring-slate-200">
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link to={item.href} className="block">
                          <p className="font-medium text-slate-900">{item.title}</p>
                          <p className="mt-0.5 text-xs leading-5 text-slate-500">{item.description}</p>
                          <p className="mt-1 text-[11px] font-medium text-slate-400">
                            {formatRelativeTime(item.createdAt)}
                          </p>
                        </Link>
                        {!item.readAt ? (
                          <button
                            type="button"
                            className="mt-2 text-xs font-medium text-primary-700 hover:text-primary-800"
                            onClick={() => markRead.mutate(item.id)}
                          >
                            Tandai dibaca
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="px-2 py-3 text-sm text-slate-500">Tidak ada notifikasi aktif.</p>
            )}
          </div>
        </DropdownMenu>
        <span className="hidden rounded-full bg-slate-100 px-3 py-1 font-medium sm:inline-flex">
          {formatRole(user.role)}
        </span>
        <DropdownMenu
          trigger={
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <UserCircle size={18} />
              <span className="hidden sm:inline">Akun</span>
            </button>
          }
        >
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="font-medium text-slate-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="mt-1 text-xs text-slate-500">{user.email}</p>
            </div>
            <Link to="/profile" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              Lihat profil
            </Link>
            <Button variant="ghost" type="button" onClick={onLogout} className="w-full justify-start">
              <LogOut size={16} />
              Keluar
            </Button>
          </div>
        </DropdownMenu>
      </div>
    </header>
  );
};
