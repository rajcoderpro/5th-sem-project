import { History, X } from "lucide-react";
import TaskActivityTimeline from "./TaskActivityTimeline.jsx";

export default function TaskActivityModal({ task, onClose }) {
    if (!task) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="task-history-title" className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#101323] p-5 shadow-2xl sm:p-7">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[.18em] text-violet-300"><History size={13} /> AUDIT HISTORY</p>
                        <h2 id="task-history-title" className="mt-2 font-display text-lg font-semibold text-white">{task.title}</h2>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close activity history" className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"><X size={17} /></button>
                </div>
                <TaskActivityTimeline taskId={task._id} />
            </section>
        </div>
    );
}
