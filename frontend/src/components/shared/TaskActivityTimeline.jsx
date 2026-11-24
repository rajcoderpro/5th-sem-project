import { useEffect, useState } from "react";
import { Activity, Clock3, LoaderCircle } from "lucide-react";
import { apiGet } from "../../services/api.js";

const actionStyles = {
    CREATED: "border-violet-400/20 bg-violet-400/10 text-violet-200",
    ASSIGNED: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
    REASSIGNED: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
    STATUS_CHANGED: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    DETAILS_UPDATED: "border-white/10 bg-white/[.04] text-slate-300",
    AI_ANALYZED: "border-violet-400/20 bg-violet-400/10 text-violet-200",
};

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "numeric", minute: "2-digit",
    }).format(date);
}

export default function TaskActivityTimeline({ taskId }) {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!taskId) return undefined;
        let active = true;
        setLoading(true);
        setError("");

        apiGet(`/api/tasks/${taskId}/activities`)
            .then((data) => {
                if (active) setActivities(data.activities || []);
            })
            .catch((loadError) => {
                if (active) setError(loadError.message || "Unable to load task history.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, [taskId]);

    return (
        <section className="mt-6 rounded-2xl border border-white/[.07] bg-[#090c19]/75 p-4 sm:p-5">
            <div className="flex items-center gap-2">
                <Activity size={15} className="text-violet-300" />
                <h3 className="text-xs font-semibold text-slate-200">Task activity</h3>
                <span className="ml-auto text-[9px] text-slate-600">Latest 50 events</span>
            </div>

            {loading ? (
                <div className="mt-5 flex items-center gap-2 text-xs text-slate-500"><LoaderCircle size={14} className="animate-spin" /> Loading activity...</div>
            ) : error ? (
                <p role="alert" className="mt-4 text-xs text-red-300">{error}</p>
            ) : activities.length ? (
                <ol className="mt-4 space-y-4">
                    {activities.map((item) => (
                        <li key={item._id} className="flex gap-3">
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[.07] bg-white/[.03]"><Clock3 size={13} className="text-slate-500" /></span>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className={`rounded-full border px-2 py-0.5 text-[8px] font-semibold tracking-wide ${actionStyles[item.action] || actionStyles.DETAILS_UPDATED}`}>{String(item.action || "UPDATE").replaceAll("_", " ")}</span>
                                    <span className="text-[9px] text-slate-600">{formatDate(item.createdAt)}</span>
                                </div>
                                <p className="mt-1.5 text-[11px] leading-5 text-slate-300">{item.message}</p>
                                <p className="mt-1 text-[9px] text-slate-600">By {item.actor?.name || "System user"}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="mt-4 text-xs text-slate-500">No activity has been recorded for this task yet.</p>
            )}
        </section>
    );
}
