import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Building2, CalendarCheck, ClipboardList, RefreshCw, Users } from "lucide-react";

import { apiGet } from "../../services/api.js";

const TASK_STATUSES = ["TODO", "IN_PROGRESS", "BLOCKED", "IN_REVIEW", "COMPLETED", "CANCELLED"];
const LEAVE_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

function StatCard({ icon: Icon, label, value, note, tone }) {
    return (
        <article className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 transition hover:-translate-y-1 hover:border-violet-400/20">
            <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs text-slate-500">{label}</p><p className="mt-3 font-display text-3xl font-semibold tabular-nums text-white">{value}</p><p className="mt-2 text-[10px] text-slate-600">{note}</p></div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/[.06] ${tone}`}><Icon size={19} /></span>
            </div>
        </article>
    );
}

function BarRow({ label, value, total, color = "from-violet-500 to-cyan-400" }) {
    const percent = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3 text-xs"><span className="text-slate-400">{label}</span><span className="font-semibold tabular-nums text-slate-200">{value} <span className="text-[10px] font-normal text-slate-600">({percent}%)</span></span></div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[.06]"><div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${percent}%` }} /></div>
        </div>
    );
}

export default function AnalyticsPage() {
    const [data, setData] = useState({ employees: [], departments: [], taskCounts: {}, leaveCounts: {}, attendance: {} });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadAnalytics = useCallback(async (refresh = false) => {
        if (refresh) setRefreshing(true);
        else setLoading(true);
        setError("");

        try {
            const [employeeResult, departmentResult, taskResults, leaveResults, attendanceResult] = await Promise.all([
                apiGet("/api/employees"),
                apiGet("/api/departments"),
                Promise.all(TASK_STATUSES.map((status) => apiGet(`/api/tasks?status=${status}&page=1&limit=1`))),
                Promise.all(LEAVE_STATUSES.map((status) => apiGet(`/api/leaves?status=${status}&page=1&limit=1`))),
                apiGet("/api/attendance/summary"),
            ]);

            const taskCounts = {};
            TASK_STATUSES.forEach((status, index) => { taskCounts[status] = Number(taskResults[index]?.pagination?.total || 0); });
            const leaveCounts = {};
            LEAVE_STATUSES.forEach((status, index) => { leaveCounts[status] = Number(leaveResults[index]?.pagination?.total || 0); });

            setData({
                employees: employeeResult.employees || [],
                departments: departmentResult.departments || [],
                taskCounts,
                leaveCounts,
                attendance: attendanceResult.summary || {},
                attendanceDate: attendanceResult.date,
            });
        } catch (loadError) {
            setError(loadError.message || "Unable to load analytics.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

    const totalTasks = useMemo(() => Object.values(data.taskCounts).reduce((sum, value) => sum + value, 0), [data.taskCounts]);
    const totalLeaves = useMemo(() => Object.values(data.leaveCounts).reduce((sum, value) => sum + value, 0), [data.leaveCounts]);
    const activeEmployees = data.employees.filter((employee) => employee.employmentStatus === "ACTIVE").length;
    const completedShare = totalTasks ? Math.round(((data.taskCounts.COMPLETED || 0) / totalTasks) * 100) : 0;

    const departmentRows = data.departments.map((department) => ({
        name: department.name,
        count: data.employees.filter((employee) => String(employee.departmentId?._id || employee.departmentId) === String(department._id)).length,
    })).sort((a, b) => b.count - a.count);
    const employeeTotal = Math.max(1, data.employees.length);

    return (
        <div className="space-y-7">
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div><p className="text-xs font-semibold tracking-[.2em] text-violet-300">ADMIN / INSIGHTS</p><h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">Workforce <span className="text-violet-300">analytics.</span></h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">A live snapshot of employees, tasks, leave requests and today's attendance.</p></div>
                <button type="button" onClick={() => loadAnalytics(true)} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-xs font-medium text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-400/10 disabled:opacity-50"><RefreshCw size={15} className={refreshing ? "animate-spin" : ""} /> Refresh data</button>
            </section>

            {error && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/[.08] px-4 py-3 text-xs text-red-300">{error}</div>}
            {loading ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white/[.03]" />)}</div> : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <StatCard icon={Users} label="Employee profiles" value={data.employees.length} note={`${activeEmployees} currently active`} tone="bg-violet-400/10 text-violet-300" />
                        <StatCard icon={ClipboardList} label="Total tasks" value={totalTasks} note={`${completedShare}% completed`} tone="bg-cyan-400/10 text-cyan-300" />
                        <StatCard icon={CalendarCheck} label="Pending leave requests" value={data.leaveCounts.PENDING || 0} note={`${totalLeaves} total requests`} tone="bg-amber-400/10 text-amber-300" />
                        <StatCard icon={Activity} label="Present / late today" value={data.attendance.present || 0} note={`${data.attendance.late || 0} late check-ins · ${data.attendance.halfDay || 0} half-day`} tone="bg-emerald-400/10 text-emerald-300" />
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                        <section className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:p-6">
                            <div className="mb-6 flex items-center gap-2"><ClipboardList size={16} className="text-violet-300" /><div><h2 className="text-sm font-semibold">Task status distribution</h2><p className="mt-1 text-[10px] text-slate-600">Counts across all task records.</p></div></div>
                            <div className="space-y-5">{TASK_STATUSES.map((status) => <BarRow key={status} label={status.replaceAll("_", " ")} value={data.taskCounts[status] || 0} total={totalTasks} color={status === "COMPLETED" ? "from-emerald-500 to-cyan-400" : status === "BLOCKED" ? "from-red-500 to-orange-400" : "from-violet-500 to-cyan-400"} />)}</div>
                        </section>

                        <section className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:p-6">
                            <div className="mb-6 flex items-center gap-2"><Building2 size={16} className="text-cyan-300" /><div><h2 className="text-sm font-semibold">Employees by department</h2><p className="mt-1 text-[10px] text-slate-600">Distribution of employee profiles.</p></div></div>
                            {departmentRows.length ? <div className="space-y-5">{departmentRows.map((department) => <BarRow key={department.name} label={department.name} value={department.count} total={employeeTotal} />)}</div> : <p className="text-xs text-slate-500">No departments found.</p>}
                        </section>

                        <section className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:p-6">
                            <div className="mb-6 flex items-center gap-2"><CalendarCheck size={16} className="text-amber-300" /><div><h2 className="text-sm font-semibold">Today's attendance</h2><p className="mt-1 text-[10px] text-slate-600">{data.attendanceDate || "Current attendance day"}</p></div></div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {[ ["Present", data.attendance.present], ["Late", data.attendance.late], ["Half day", data.attendance.halfDay], ["Absent", data.attendance.absent], ["On leave", data.attendance.onLeave], ["Not marked", data.attendance.notMarked] ].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[.06] bg-white/[.025] p-4"><p className="text-[10px] text-slate-500">{label}</p><p className="mt-2 font-display text-2xl font-semibold tabular-nums text-white">{value || 0}</p></div>)}</div>
                        </section>

                        <section className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:p-6">
                            <div className="mb-6 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-300" /><div><h2 className="text-sm font-semibold">Leave request status</h2><p className="mt-1 text-[10px] text-slate-600">All leave requests recorded in the system.</p></div></div>
                            <div className="space-y-5">{LEAVE_STATUSES.map((status) => <BarRow key={status} label={status} value={data.leaveCounts[status] || 0} total={totalLeaves} color={status === "APPROVED" ? "from-emerald-500 to-cyan-400" : status === "REJECTED" ? "from-red-500 to-orange-400" : "from-amber-500 to-violet-400"} />)}</div>
                        </section>
                    </div>
                    <p className="text-center text-[10px] text-slate-600">Analytics are calculated from current database records. Attendance is a snapshot for the current IST date.</p>
                </>
            )}
        </div>
    );
}
