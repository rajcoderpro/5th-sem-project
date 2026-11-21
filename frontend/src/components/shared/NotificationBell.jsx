import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCheck, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext.jsx";
import { apiGet, apiRequest } from "../../services/api.js";

function getDestination(notification, role) {
    const prefix = role === "ADMIN" ? "/admin" : "/employee";
    if (notification.entityType === "TASK") return `${prefix}/tasks`;
    if (notification.entityType === "LEAVE") return `${prefix}/leaves`;
    return role === "ADMIN" ? `${prefix}/dashboard` : `${prefix}/dashboard`;
}

function formatTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
    }).format(date);
}

export default function NotificationBell() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiGet("/api/notifications?limit=8");
            setNotifications(data.notifications || []);
            setUnreadCount(Number(data.unreadCount || 0));
        } catch (error) {
            console.error("Unable to load notifications:", error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const markAllRead = async () => {
        try {
            await apiRequest("/api/notifications/read-all", { method: "PATCH" });
            setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Unable to mark notifications as read:", error.message);
        }
    };

    const openNotification = async (notification) => {
        if (!notification.isRead) {
            try {
                await apiRequest(`/api/notifications/${notification._id}/read`, { method: "PATCH" });
                setNotifications((current) => current.map((item) =>
                    item._id === notification._id ? { ...item, isRead: true } : item
                ));
                setUnreadCount((count) => Math.max(0, count - 1));
            } catch (error) {
                console.error("Unable to mark notification as read:", error.message);
            }
        }

        setOpen(false);
        navigate(getDestination(notification, user?.role));
    };

    const notificationsPath = user?.role === "ADMIN" ? "/admin/notifications" : "/employee/notifications";

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => {
                    const next = !open;
                    setOpen(next);
                    if (next) loadNotifications();
                }}
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
                aria-expanded={open}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[.025] text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-violet-200"
            >
                <Bell size={17} />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-[#090b18] bg-violet-500 px-1 text-[9px] font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <button type="button" aria-label="Close notifications" onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default" />
                    <section className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#101323] shadow-2xl shadow-black/50">
                        <div className="flex items-center justify-between border-b border-white/[.07] px-4 py-3">
                            <div>
                                <p className="text-sm font-semibold text-white">Notifications</p>
                                <p className="mt-0.5 text-[10px] text-slate-500">{unreadCount} unread</p>
                            </div>
                            <button type="button" onClick={markAllRead} disabled={!unreadCount} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] text-violet-300 transition hover:bg-violet-400/10 disabled:cursor-not-allowed disabled:opacity-40">
                                <CheckCheck size={13} /> Mark all read
                            </button>
                        </div>

                        <div className="max-h-[360px] overflow-y-auto">
                            {loading && notifications.length === 0 ? (
                                <div className="flex items-center justify-center gap-2 px-4 py-8 text-xs text-slate-500"><LoaderCircle size={15} className="animate-spin" /> Loading notifications</div>
                            ) : notifications.length ? notifications.map((item) => (
                                <button key={item._id} type="button" onClick={() => openNotification(item)} className={`block w-full border-b border-white/[.05] px-4 py-3 text-left transition hover:bg-white/[.04] ${item.isRead ? "opacity-70" : "bg-violet-400/[.035]"}`}>
                                    <div className="flex items-start gap-3">
                                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.isRead ? "bg-slate-700" : "bg-violet-400"}`} />
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-xs font-semibold text-slate-200">{item.title}</span>
                                            <span className="mt-1 block text-[11px] leading-5 text-slate-400">{item.message}</span>
                                            <span className="mt-1.5 block text-[9px] text-slate-600">{formatTime(item.createdAt)}</span>
                                        </span>
                                    </div>
                                </button>
                            )) : (
                                <div className="px-4 py-10 text-center text-xs text-slate-500">You're all caught up.</div>
                            )}
                        </div>

                        <button type="button" onClick={() => { setOpen(false); navigate(notificationsPath); }} className="w-full border-t border-white/[.07] px-4 py-3 text-center text-[11px] font-semibold text-violet-300 transition hover:bg-violet-400/[.06]">
                            View all notifications
                        </button>
                    </section>
                </>
            )}
        </div>
    );
}
