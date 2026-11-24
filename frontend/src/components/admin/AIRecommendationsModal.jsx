import {
    AlertTriangle,
    BrainCircuit,
    CheckCircle2,
    Clock3,
    Gauge,
    LoaderCircle,
    Sparkles,
    Users,
    X,
} from "lucide-react";

function ScoreBar({ label, value, weight }) {
    const score = Math.max(0, Math.min(100, Number(value) || 0));

    return (
        <div>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px]">
                <span className="text-slate-400">{label} <span className="text-slate-600">({weight}%)</span></span>
                <span className="font-semibold tabular-nums text-slate-200">{score}/100</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[.07]">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}

export default function AIRecommendationsModal({
    task,
    result,
    loading = false,
    error = "",
    assigningEmployeeId = "",
    onClose,
    onAssign,
}) {
    if (!task) return null;

    const analysis = result?.analysis;
    const candidates = result?.candidates || [];
    const excluded = result?.excluded || [];

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-5"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !assigningEmployeeId) onClose();
            }}
        >
            <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-violet-400/20 bg-[#0b0e1c] shadow-[0_0_100px_rgba(124,58,237,.14)]">
                <div className="flex items-start justify-between gap-4 border-b border-white/[.07] px-5 py-5 sm:px-7">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-400/10 text-violet-300">
                            <BrainCircuit size={21} />
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold tracking-[.2em] text-violet-300">
                                GEMINI-POWERED ALLOCATION
                            </p>
                            <h2 className="mt-1 font-display text-xl font-semibold text-white sm:text-2xl">
                                Employee recommendations
                            </h2>
                            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                                {task.title} · AI analyses the task; the backend checks eligibility and calculates candidate scores.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={Boolean(assigningEmployeeId)}
                        aria-label="Close recommendations"
                        className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="max-h-[calc(92vh-84px)] space-y-5 overflow-y-auto p-5 sm:p-7">
                    {loading && (
                        <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/[.08] text-violet-300">
                                <LoaderCircle size={30} className="animate-spin" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-white">Analysing task and workforce</h3>
                                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                                    Gemini is extracting task requirements. The backend is preparing employee workload, capacity and leave checks.
                                </p>
                            </div>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[.06] p-5">
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={19} className="mt-0.5 shrink-0 text-amber-300" />
                                <div>
                                    <h3 className="text-sm font-semibold text-amber-200">Unable to generate recommendations</h3>
                                    <p className="mt-2 text-xs leading-5 text-slate-300">{error}</p>
                                    {error.toLowerCase().includes("gemini") && (
                                        <p className="mt-3 text-xs leading-5 text-slate-500">
                                            Add your Gemini key to <code className="rounded bg-black/30 px-1.5 py-0.5 text-violet-200">backend/.env</code> as <code className="rounded bg-black/30 px-1.5 py-0.5 text-violet-200">GEMINI_API_KEY</code>, then restart the backend.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {!loading && result && (
                        <>
                            <section className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Complexity</p>
                                    <p className="mt-2 text-lg font-semibold text-white">{analysis?.complexity || "—"}</p>
                                </div>
                                <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500">AI hour estimate</p>
                                    <p className="mt-2 text-lg font-semibold text-white">{analysis?.recommendedEstimatedHours ?? "—"} <span className="text-xs font-normal text-slate-500">hours</span></p>
                                    <p className="mt-1 text-[9px] text-slate-600">Saved task estimate remains unchanged.</p>
                                </div>
                                <div className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Eligible employees</p>
                                    <p className="mt-2 text-lg font-semibold text-white">{result.counts?.eligibleCandidates ?? candidates.length}</p>
                                    <p className="mt-1 text-[9px] text-slate-600">{result.counts?.excludedEmployees ?? excluded.length} excluded by eligibility checks</p>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-violet-400/15 bg-violet-400/[.045] p-4 sm:p-5">
                                <div className="mb-2 flex items-center gap-2 text-violet-200">
                                    <Sparkles size={16} />
                                    <h3 className="text-xs font-semibold">AI task analysis</h3>
                                </div>
                                <p className="text-xs leading-6 text-slate-300">{analysis?.summary}</p>
                                <p className="mt-3 text-[10px] leading-5 text-slate-500">{analysis?.allocationRationale}</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {(analysis?.requiredSkills || []).map((skill) => (
                                        <span key={`${skill.name}-${skill.minimumLevel}`} className="rounded-lg border border-violet-300/15 bg-violet-300/[.06] px-2.5 py-1.5 text-[10px] text-violet-200">
                                            {skill.name} · L{skill.minimumLevel} · {skill.importance.toLowerCase()}
                                        </span>
                                    ))}
                                    {!analysis?.requiredSkills?.length && (
                                        <span className="text-[10px] text-slate-500">No specific skills were identified.</span>
                                    )}
                                </div>
                            </section>

                            <section>
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-cyan-300" />
                                        <h3 className="text-sm font-semibold text-white">Ranked candidates</h3>
                                    </div>
                                    <p className="text-[9px] text-slate-600">Score = skills 40% + capacity 35% + workload balance 25%</p>
                                </div>

                                {candidates.length === 0 && (
                                    <div className="rounded-xl border border-white/[.07] bg-white/[.02] p-6 text-center">
                                        <p className="text-xs font-medium text-slate-300">No eligible employees found</p>
                                        <p className="mt-1 text-[10px] text-slate-500">Check the task department, dates, employee skills and capacity.</p>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {candidates.map((candidate, index) => (
                                        <article key={candidate.employee.id} className="rounded-2xl border border-white/[.07] bg-white/[.025] p-4 sm:p-5">
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[.07] text-sm font-semibold text-cyan-200">{index + 1}</div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-white">{candidate.employee.name}</h4>
                                                        <p className="mt-1 text-[10px] text-slate-500">{candidate.employee.employeeCode} · {candidate.employee.designation || "Employee"}</p>
                                                        <p className="mt-1 text-[10px] text-slate-600">{candidate.employee.department}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-4 sm:justify-end">
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-[9px] uppercase tracking-wider text-slate-500">Match score</p>
                                                        <p className="mt-0.5 text-2xl font-bold tabular-nums text-cyan-200">{candidate.score}<span className="text-xs text-slate-500">/100</span></p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => onAssign(candidate.employee.id)}
                                                        disabled={Boolean(assigningEmployeeId)}
                                                        className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-[10px] font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {assigningEmployeeId === candidate.employee.id ? "Assigning..." : "Approve & assign"}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                                <ScoreBar label="Skill compatibility" value={candidate.scoreBreakdown.skillCompatibility} weight={40} />
                                                <ScoreBar label="Available capacity" value={candidate.scoreBreakdown.availableCapacity} weight={35} />
                                                <ScoreBar label="Workload balance" value={candidate.scoreBreakdown.workloadBalance} weight={25} />
                                            </div>

                                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                    <Gauge size={13} className="text-violet-300" />
                                                    {candidate.workload.assignedHours}h already assigned · {candidate.workload.availableHours}h available
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                    <Clock3 size={13} className="text-cyan-300" />
                                                    {candidate.workload.activeTasks}/{candidate.workload.maxConcurrentTasks} concurrent tasks
                                                </div>
                                            </div>

                                            {candidate.reasons?.length > 0 && (
                                                <ul className="mt-3 space-y-1 border-t border-white/[.06] pt-3">
                                                    {candidate.reasons.map((reason, reasonIndex) => (
                                                        <li key={reasonIndex} className="flex gap-2 text-[10px] leading-5 text-slate-500">
                                                            <CheckCircle2 size={12} className="mt-1 shrink-0 text-emerald-400/70" />
                                                            {reason}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {candidate.warnings?.map((warning) => (
                                                <p key={warning} className="mt-2 flex items-start gap-2 text-[10px] leading-5 text-amber-300">
                                                    <AlertTriangle size={12} className="mt-1 shrink-0" />{warning}
                                                </p>
                                            ))}
                                        </article>
                                    ))}
                                </div>
                            </section>

                            {excluded.length > 0 && (
                                <details className="rounded-xl border border-white/[.07] bg-white/[.02] p-4">
                                    <summary className="cursor-pointer list-none text-xs font-semibold text-slate-400">
                                        View excluded employees ({excluded.length})
                                    </summary>
                                    <div className="mt-3 space-y-2">
                                        {excluded.map((item) => (
                                            <div key={item.employeeId} className="flex flex-col justify-between gap-1 border-t border-white/[.05] pt-2 sm:flex-row sm:gap-4">
                                                <span className="text-[10px] text-slate-300">{item.name} · {item.employeeCode}</span>
                                                <span className="text-[10px] text-slate-500 sm:text-right">{item.reason}</span>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            )}

                            <p className="text-[9px] leading-5 text-slate-600">
                                Model: {result.model}. Recommendations support the admin; they do not make automatic assignments. Assignment eligibility is checked again by the backend when you approve a candidate.
                            </p>
                        </>
                    )}

                    <div className="flex justify-end border-t border-white/[.06] pt-4">
                        <button type="button" onClick={onClose} disabled={Boolean(assigningEmployeeId)} className="rounded-xl border border-white/10 px-5 py-2.5 text-xs text-slate-300 transition hover:bg-white/5 disabled:opacity-40">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
