import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    Clock3,
    LogOut,
    MapPin,
    ShieldCheck,
    UserRound,
    Users,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { apiGet } from "../../services/api.js";
import NotificationBell from "../../components/shared/NotificationBell.jsx";

function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata",
    }).format(date);
}

function humanize(value) {
    return String(value || "—").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function InfoItem({ label, value, icon: Icon }) {
    return (
        <div className="rounded-xl border border-white/[.06] bg-white/[.025] p-4">
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                {Icon && <Icon size={13} className="text-violet-300" />}
                {label}
            </div>
            <p className="mt-2 break-words text-sm font-medium text-slate-200">{value || "—"}</p>
        </div>
    );
}

export default function EmployeeProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await apiGet("/api/employees/me");
            setEmployee(data.employee || null);
        } catch (loadError) {
            setError(loadError.message || "Unable to load your profile.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadProfile(); }, [loadProfile]);

    const handleLogout = async () => {
        try { await logout(); } catch (logoutError) { console.error(logoutError); }
        navigate("/login", { replace: true });
    };

    const skills = Array.isArray(employee?.skills) ? employee.skills : [];
    const initials = (employee?.userId?.name || user?.name || "Employee")
        .split(" ").filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join("");

    return (
        <main className="min-h-screen bg-[#070914] text-white">
            <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between border-b border-white/[.07] bg-[#090b18]/90 px-5 backdrop-blur-xl sm:px-8">
                <Link to="/employee/dashboard" className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10"><UserRound size={19} className="text-violet-300" /></span>
                    <span className="font-display text-base font-bold">WorkForce<span className="text-violet-400"> AI</span><span className="mt-0.5 block text-[9px] font-normal tracking-[.2em] text-slate-500">EMPLOYEE PROFILE</span></span>
                </Link>
                <div className="flex items-center gap-2">
                    <NotificationBell />
                    <Link to="/employee/dashboard" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-300 transition hover:border-violet-400/30 hover:text-white"><ArrowLeft size={14} /> Dashboard</Link>
                    <button type="button" onClick={handleLogout} aria-label="Logout" className="rounded-xl border border-white/10 p-2.5 text-slate-400 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300"><LogOut size={15} /></button>
                </div>
            </header>

            <div className="mx-auto max-w-6xl space-y-7 px-5 py-8 sm:px-8 lg:py-10">
                <section className="flex flex-col justify-between gap-5 rounded-3xl border border-white/[.08] bg-gradient-to-br from-[#11152a] to-[#0b1020] p-6 sm:flex-row sm:items-center sm:p-8">
                    <div className="flex items-center gap-4">
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-violet-400/25 bg-violet-400/10 font-display text-xl font-bold text-violet-200">{initials}</span>
                        <div>
                            <p className="text-[10px] font-semibold tracking-[.2em] text-violet-300">MY PROFILE</p>
                            <h1 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{employee?.userId?.name || user?.name || "Employee"}</h1>
                            <p className="mt-1 text-xs text-slate-400">{employee?.designation || "Employee"} · {employee?.departmentId?.name || "Department not assigned"}</p>
                        </div>
                    </div>
                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[.07] px-3 py-2 text-[10px] font-semibold text-emerald-300"><ShieldCheck size={13} /> {humanize(employee?.employmentStatus)}</span>
                </section>

                {error && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/[.08] px-4 py-3 text-xs text-red-300">{error}</div>}
                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2"><div className="h-52 animate-pulse rounded-2xl bg-white/[.03]" /><div className="h-52 animate-pulse rounded-2xl bg-white/[.03]" /></div>
                ) : employee ? (
                    <>
                        <div className="grid gap-5 lg:grid-cols-2">
                            <section className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:p-6">
                                <div className="mb-5 flex items-center gap-2"><UserRound size={16} className="text-violet-300" /><h2 className="text-sm font-semibold">Personal information</h2></div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <InfoItem label="Full name" value={employee.userId?.name} />
                                    <InfoItem label="Email address" value={employee.userId?.email} />
                                    <InfoItem label="Employee code" value={employee.employeeCode} />
                                    <InfoItem label="Location" value={employee.profile?.location} icon={MapPin} />
                                </div>
                            </section>

                            <section className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:p-6">
                                <div className="mb-5 flex items-center gap-2"><BriefcaseBusiness size={16} className="text-cyan-300" /><h2 className="text-sm font-semibold">Employment details</h2></div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <InfoItem label="Designation" value={employee.designation} />
                                    <InfoItem label="Department" value={employee.departmentId?.name} />
                                    <InfoItem label="Department code" value={employee.departmentId?.code} />
                                    <InfoItem label="Employment type" value={humanize(employee.employmentType)} />
                                    <InfoItem label="Work mode" value={humanize(employee.workMode)} />
                                    <InfoItem label="Joining date" value={formatDate(employee.joiningDate)} icon={CalendarDays} />
                                    <InfoItem label="Reporting manager" value={employee.managerId?.employeeCode ? `${employee.managerId.employeeCode} · ${employee.managerId.designation}` : "Not assigned"} icon={Users} />
                                    <InfoItem label="Account role" value={humanize(user?.role)} icon={ShieldCheck} />
                                </div>
                            </section>
                        </div>

                        <section className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:p-6">
                            <div className="mb-5 flex items-center gap-2"><Clock3 size={16} className="text-cyan-300" /><h2 className="text-sm font-semibold">Work capacity</h2></div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <InfoItem label="Weekly capacity" value={`${Number(employee.capacity?.weeklyHours ?? 40)} hours`} />
                                <InfoItem label="Maximum concurrent tasks" value={employee.capacity?.maxConcurrentTasks ?? 5} />
                            </div>
                            {employee.profile?.bio && <p className="mt-4 whitespace-pre-wrap text-xs leading-6 text-slate-400">{employee.profile.bio}</p>}
                        </section>

                        <section className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:p-6">
                            <div className="mb-5 flex items-center justify-between gap-3">
                                <div><h2 className="text-sm font-semibold">Skills and proficiency</h2><p className="mt-1 text-[10px] text-slate-500">Information used by the future task recommendation engine.</p></div>
                                <span className="rounded-lg border border-violet-400/15 bg-violet-400/[.06] px-2.5 py-1.5 text-[10px] text-violet-200">{skills.length} skills</span>
                            </div>
                            {skills.length ? (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {skills.map((skill, index) => (
                                        <div key={`${skill.name}-${index}`} className="rounded-xl border border-white/[.06] bg-white/[.025] p-4">
                                            <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-slate-200">{skill.name}</p><span className="text-[10px] font-semibold text-violet-200">{skill.proficiencyLevel}/5</span></div>
                                            <div className="mt-3 flex gap-1">{[1, 2, 3, 4, 5].map((level) => <span key={level} className={`h-1.5 flex-1 rounded-full ${level <= skill.proficiencyLevel ? "bg-gradient-to-r from-violet-500 to-cyan-400" : "bg-white/[.08]"}`} />)}</div>
                                            <p className="mt-2 text-[10px] text-slate-600">{Number(skill.yearsOfExperience || 0)} years experience</p>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-xs text-slate-500">No skills have been added to your profile yet.</p>}
                        </section>
                        <p className="text-center text-[10px] text-slate-600">Profile details are maintained by your administrator. Contact your admin if any information needs correction.</p>
                    </>
                ) : (
                    <div className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 px-5 py-12 text-center text-xs text-slate-500">Your employee profile could not be found.</div>
                )}
            </div>
        </main>
    );
}
