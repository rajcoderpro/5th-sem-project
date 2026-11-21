import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, CheckCheck, ClipboardList, RefreshCw } from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { apiGet, apiRequest } from "../../services/api.js";

function getDestination(notification, role) {
    const prefix = role === "ADMIN" ? "/admin" : "/employee";
    if (notification.entityType === "TASK") return `${prefix}/tasks`;
    if (notification.entityType === "LEAVE") return `${prefix}/leaves`;
    return `${prefix}/dashboard`;
}

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "numeric", minute: "2-digit",
    }).format(date);
}

export default function NotificationsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === "ADMIN";
    const homePath = isAdmin ? "/admin/dashboard" : "/employee/dashboard";
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadNotifications = useCallback(async (refresh = false) => {
        if (refresh) setRefreshing(true);
        else setLoading(true);
        setError("");
        try {
            const data = await apiGet("/api/notifications?limit=50&page=1");
            setNotifications(data.notifications || []);
            setUnreadCount(Number(data.unreadCount || 0));
        } catch (loadError) {
            setError(loadError.message || "Unable to load notifications.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { loadNotifications(); }, [loadNotifications]);

    const markRead = async (item) => {
        if (!item.isRead) {
            try {
                await apiRequest(`/api/notifications/${item._id}/read`, { method: "PATCH" });
                setNotifications((current) => current.map((entry) => entry._id === item._id ? { ...entry, isRead: true } : entry));
                setUnreadCount((count) => Math.max(0, count - 1));
            } catch (markError) {
                setError(markError.message || "Unable to update notification.");
                return;
            }
        }
        navigate(getDestination(item, user?.role));
    };

    const markAllRead = async () => {
        try {
            await apiRequest("/api/notifications/read-all", { method: "PATCH" });
            setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
            setUnreadCount(0);
        } catch (markError) {
            setError(markError.message || "Unable to mark notifications as read.");
        }
    };

    return (
        <main className="min-h-screen bg-[#070914] text-white">
            <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between border-b border-white/[.07] bg-[#090b18]/90 px-5 backdrop-blur-xl sm:px-8">
                <div>
                    <p className="text-[10px] font-semibold tracking-[.2em] text-violet-300">WORKFORCE AI</p>
                    <h1 className="mt-1 font-display text-lg font-semibold">Notifications</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => loadNotifications(true)} disabled={refreshing} aria-label="Refresh notifications" className="rounded-xl border border-white/10 p-2.5 text-slate-400 hover:border-violet-400/30 hover:text-violet-200 disabled:opacity-50"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /></button>
                    <Link to={homePath} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-300 transition hover:border-violet-400/30 hover:text-white"><ArrowLeft size={14} /> Dashboard</Link>
                </div>
            </header>

            <div className="mx-auto max-w-4xl space-y-6 px-5 py-8 sm:px-8 lg:py-10">
                <section className="flex flex-col justify-between gap-4 rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:flex-row sm:items-center sm:p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-200"><Bell size={19} /></span>
                        <div>
                            <p className="text-sm font-semibold">Your activity updates</p>
                            <p className="mt-1 text-xs text-slate-500">{unreadCount} unread · {notifications.length} recent notifications loaded</p>
                        </div>
                    </div>
                    <button type="button" onClick={markAllRead} disabled={!unreadCount} className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/[.07] px-4 py-2.5 text-xs font-semibold text-violet-200 transition hover:bg-violet-400/[.12] disabled:cursor-not-allowed disabled:opacity-40"><CheckCheck size={14} /> Mark all as read</button>
                </section>

                {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/[.08] px-4 py-3 text-xs text-red-300">{error}</p>}

                <section className="overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1020]/90">
                    {loading ? (
                        <div className="p-12 text-center text-xs text-slate-500">Loading notifications...</div>
                    ) : notifications.length ? (
                        notifications.map((item) => (
                            <button key={item._id} type="button" onClick={() => markRead(item)} className={`flex w-full items-start gap-4 border-b border-white/[.05] px-5 py-5 text-left transition last:border-0 hover:bg-white/[.035] sm:px-6 ${item.isRead ? "opacity-65" : "bg-violet-400/[.025]"}`}>
                                <span className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${item.isRead ? "border-white/10 bg-white/[.03] text-slate-500" : "border-violet-400/20 bg-violet-400/10 text-violet-200"}`}><ClipboardList size={16} /></span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-200">{item.title}{!item.isRead && <span className="rounded-full bg-violet-400/15 px-2 py-0.5 text-[9px] text-violet-200">NEW</span>}</span>
                                    <span className="mt-1.5 block text-xs leading-5 text-slate-400">{item.message}</span>
                                    <span className="mt-2 block text-[10px] text-slate-600">{formatDate(item.createdAt)}</span>
                                </span>
                                <span className="pt-1 text-[10px] text-violet-300">Open</span>
                            </button>
                        ))
                    ) : (
                        <div className="px-5 py-16 text-center">
                            <Bell size={25} className="mx-auto text-slate-600" />
                            <p className="mt-4 text-sm font-semibold text-slate-300">You're all caught up</p>
                            <p className="mt-1 text-xs text-slate-500">New task and leave updates will appear here.</p>
                        </div>
                    )}
                </section>

                <footer className="border-t border-white/[.06] pt-5 text-center text-[10px] text-slate-600">WorkForce AI · {isAdmin ? "Admin" : "Employee"} workspace</footer>
            </div>
        </main>
    );
}
