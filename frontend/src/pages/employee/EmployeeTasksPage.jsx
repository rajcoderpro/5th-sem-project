import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Eye,
  Flag,
  ListFilter,
  LogOut,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { apiGet, apiRequest } from "../../services/api.js";

const TASK_STATUSES = [
  { value: "ALL", label: "All tasks" },
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "IN_REVIEW", label: "In review" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const EMPLOYEE_UPDATE_STATUSES = [
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "BLOCKED", label: "Blocked" },
  { value: "IN_REVIEW", label: "Submit for review" },
];

const STATUS_STYLES = {
  TODO: "border-slate-400/20 bg-slate-400/10 text-slate-300",
  IN_PROGRESS: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  BLOCKED: "border-red-400/20 bg-red-400/10 text-red-300",
  IN_REVIEW: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  COMPLETED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  CANCELLED: "border-slate-500/20 bg-slate-500/10 text-slate-500",
};

const PRIORITY_STYLES = {
  LOW: "border-slate-400/20 bg-slate-400/10 text-slate-300",
  MEDIUM: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  HIGH: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  URGENT: "border-red-400/20 bg-red-400/10 text-red-300",
};

function formatLabel( value ) {
  return String( value || "UNKNOWN" ).replaceAll( "_", " " );
}

function formatDate( value ) {
  if ( !value ) return "—";
  const date = new Date( value );
  if ( Number.isNaN( date.getTime() ) ) return "—";

  return new Intl.DateTimeFormat( "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  } ).format( date );
}

function isOverdue( task ) {
  if ( !task?.dueDate || ["COMPLETED", "CANCELLED"].includes( task.status ) ) {
    return false;
  }

  const due = new Date( task.dueDate );
  const today = new Date();
  const istToday = new Intl.DateTimeFormat( "en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  } ).format( today );
  const istDue = new Intl.DateTimeFormat( "en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  } ).format( due );

  return istDue < istToday;
}

function StatusBadge( { status } ) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-semibold tracking-wide ${STATUS_STYLES[status] || "border-white/10 bg-white/5 text-slate-400"}`}>
      {formatLabel( status )}
    </span>
  );
}

function PriorityBadge( { priority } ) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-semibold tracking-wide ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.MEDIUM}`}>
      <Flag size={10} /> {priority || "MEDIUM"}
    </span>
  );
}

function MetricCard( { icon: Icon, label, value, detail, tone } ) {
  return (
    <article className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 transition hover:-translate-y-1 hover:border-violet-400/25">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold tabular-nums text-white">{value}</p>
          <p className="mt-2 text-[10px] text-slate-600">{detail}</p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[.06] ${tone}`}>
          <Icon size={19} />
        </span>
      </div>
    </article>
  );
}

function TaskDetailsModal( { task, onClose, onUpdate } ) {
  if ( !task ) return null;

  const progress = Math.max( 0, Math.min( 100, Number( task.progressPercentage || 0 ) ) );
  const closed = ["COMPLETED", "CANCELLED"].includes( task.status );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={( event ) => {
        if ( event.target === event.currentTarget ) onClose();
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="task-details-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#101323] p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[.18em] text-violet-300">TASK DETAILS</p>
            <h2 id="task-details-title" className="mt-2 break-words font-display text-xl font-semibold text-white">{task.title}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              {isOverdue( task ) && <span className="rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-[9px] font-semibold text-red-300">OVERDUE</span>}
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close task details" className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/[.07] bg-[#090c19]/80 p-4">
          <p className="text-[10px] font-semibold tracking-wide text-slate-500">DESCRIPTION</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{task.description || "No description provided."}</p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <DetailItem label="Department" value={task.departmentId?.name || "—"} />
          <DetailItem label="Created by" value={task.createdBy?.name || "—"} />
          <DetailItem label="Start date" value={formatDate( task.startDate )} />
          <DetailItem label="Due date" value={formatDate( task.dueDate )} />
          <DetailItem label="Estimated effort" value={`${Number( task.estimatedHours || 0 )} hours`} />
          <DetailItem label="Recorded effort" value={`${Number( task.actualHours || 0 )} hours`} />
        </div>

        <div className="mt-4 rounded-2xl border border-white/[.07] bg-[#090c19]/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-slate-300">Progress</p>
            <p className="font-display text-sm font-semibold tabular-nums text-white">{progress}%</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[.07]">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {Array.isArray( task.skillsRequired ) && task.skillsRequired.length > 0 && (
          <div className="mt-5">
            <p className="text-[10px] font-semibold tracking-wide text-slate-500">REQUIRED SKILLS</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {task.skillsRequired.map( ( skill ) => (
                <span key={`${skill.name}-${skill.minimumLevel}`} className="rounded-lg border border-violet-400/15 bg-violet-400/[.06] px-3 py-2 text-[10px] text-violet-200">
                  {skill.name} · Level {skill.minimumLevel || 1}/5
                </span>
              ) )}
            </div>
          </div>
        )}

        {Array.isArray( task.tags ) && task.tags.length > 0 && (
          <div className="mt-5">
            <p className="text-[10px] font-semibold tracking-wide text-slate-500">TAGS</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {task.tags.map( ( tag ) => <span key={tag} className="rounded-lg border border-white/[.07] bg-white/[.03] px-2.5 py-1.5 text-[10px] text-slate-400">{tag}</span> )}
            </div>
          </div>
        )}

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 px-5 py-3 text-xs font-semibold text-slate-300 transition hover:bg-white/5">Close</button>
          {!closed && (
            <button type="button" onClick={() => onUpdate( task )} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-xs font-semibold text-white transition hover:-translate-y-0.5">
              <Activity size={14} /> Update progress
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function DetailItem( { label, value } ) {
  return (
    <div className="rounded-xl border border-white/[.06] bg-white/[.025] p-3.5">
      <p className="text-[10px] text-slate-600">{label}</p>
      <p className="mt-1.5 break-words text-xs font-medium text-slate-300">{value}</p>
    </div>
  );
}

function UpdateTaskModal( { task, onClose, onSubmit, submitting } ) {
  const [status, setStatus] = useState( task?.status === "BLOCKED" ? "BLOCKED" : "IN_PROGRESS" );
  const [progress, setProgress] = useState( Number( task?.progressPercentage || 0 ) );
  const [error, setError] = useState( "" );

  useEffect( () => {
    if ( !task ) return;
    setStatus( task.status === "BLOCKED" ? "BLOCKED" : "IN_PROGRESS" );
    setProgress( Number( task.progressPercentage || 0 ) );
    setError( "" );
  }, [task] );

  if ( !task ) return null;

  const handleSubmit = async ( event ) => {
    event.preventDefault();
    setError( "" );

    try {
      await onSubmit( {
        status,
        progressPercentage: status === "IN_REVIEW" ? 100 : Number( progress ),
      } );
    } catch ( submitError ) {
      setError( submitError.message || "Unable to update this task." );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={( event ) => {
        if ( event.target === event.currentTarget && !submitting ) onClose();
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="update-task-title" className="w-full max-w-lg rounded-3xl border border-violet-400/20 bg-[#101323] p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[.18em] text-violet-300">TASK PROGRESS</p>
            <h2 id="update-task-title" className="mt-2 font-display text-xl font-semibold text-white">Update your task</h2>
            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">{task.title}</p>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} aria-label="Close" className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="employee-task-status" className="text-xs font-medium text-slate-300">New status</label>
            <select id="employee-task-status" value={status} onChange={( event ) => setStatus( event.target.value )} className="mt-2 w-full rounded-xl border border-white/10 bg-[#090c19] px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-violet-400/50">
              {EMPLOYEE_UPDATE_STATUSES.map( ( option ) => <option key={option.value} value={option.value}>{option.label}</option> )}
            </select>
          </div>

          {status === "IN_REVIEW" ? (
            <div className="rounded-xl border border-amber-400/15 bg-amber-400/[.06] p-4">
              <div className="flex items-center gap-2 text-amber-200"><CheckCircle2 size={16} /><p className="text-xs font-semibold">Ready for review</p></div>
              <p className="mt-2 text-[11px] leading-5 text-slate-400">Submitting for review sets progress to 100%. An administrator can review and mark the task completed.</p>
            </div>
          ) : (
            <div className="rounded-xl border border-white/[.07] bg-[#090c19]/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="employee-task-progress" className="text-xs font-medium text-slate-300">Completion progress</label>
                <span className="font-display text-sm font-semibold tabular-nums text-cyan-300">{progress}%</span>
              </div>
              <input id="employee-task-progress" type="range" min="0" max="95" step="5" value={Math.min( 95, progress )} onChange={( event ) => setProgress( Number( event.target.value ) )} className="mt-4 w-full accent-violet-500" />
              <div className="mt-2 flex justify-between text-[10px] text-slate-600"><span>0%</span><span>50%</span><span>95%</span></div>
              <p className="mt-3 text-[10px] leading-5 text-slate-500">Use In Review when your work is ready for administrator approval.</p>
            </div>
          )}

          {error && <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs text-red-300">{error}</p>}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} disabled={submitting} className="rounded-xl border border-white/10 px-5 py-3 text-xs font-semibold text-slate-300 transition hover:bg-white/5 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-xs font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
              <CheckCircle2 size={14} /> {submitting ? "Saving..." : "Save progress"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function EmployeeTasksPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState( [] );
  const [pagination, setPagination] = useState( { total: 0, totalPages: 1 } );
  const [loading, setLoading] = useState( true );
  const [refreshing, setRefreshing] = useState( false );
  const [updating, setUpdating] = useState( false );
  const [error, setError] = useState( "" );
  const [notice, setNotice] = useState( "" );
  const [search, setSearch] = useState( "" );
  const [statusFilter, setStatusFilter] = useState( "ALL" );
  const [priorityFilter, setPriorityFilter] = useState( "ALL" );
  const [selectedTask, setSelectedTask] = useState( null );
  const [editingTask, setEditingTask] = useState( null );

  const loadTasks = useCallback( async ( isRefresh = false ) => {
    if ( isRefresh ) setRefreshing( true );
    else setLoading( true );

    setError( "" );

    try {
      const response = await apiGet( "/api/tasks/me?page=1&limit=100" );
      setTasks( Array.isArray( response.tasks ) ? response.tasks : [] );
      setPagination( {
        total: Number( response.pagination?.total || 0 ),
        totalPages: Number( response.pagination?.totalPages || 1 ),
      } );
    } catch ( loadError ) {
      setError( loadError.message || "Unable to load your assigned tasks." );
      setTasks( [] );
    } finally {
      setLoading( false );
      setRefreshing( false );
    }
  }, [] );

  useEffect( () => {
    loadTasks();
  }, [loadTasks] );

  const counts = useMemo( () => {
    const active = tasks.filter( ( task ) => !["COMPLETED", "CANCELLED"].includes( task.status ) );
    const inProgress = tasks.filter( ( task ) => task.status === "IN_PROGRESS" ).length;
    const inReview = tasks.filter( ( task ) => task.status === "IN_REVIEW" ).length;
    const completed = tasks.filter( ( task ) => task.status === "COMPLETED" ).length;
    const overdue = active.filter( isOverdue ).length;

    return { active: active.length, inProgress, inReview, completed, overdue };
  }, [tasks] );

  const filteredTasks = useMemo( () => {
    const query = search.trim().toLowerCase();

    return [...tasks]
      .filter( ( task ) => statusFilter === "ALL" || task.status === statusFilter )
      .filter( ( task ) => priorityFilter === "ALL" || task.priority === priorityFilter )
      .filter( ( task ) => {
        if ( !query ) return true;
        const searchable = [
          task.title,
          task.description,
          task.departmentId?.name,
          ...( task.tags || [] ),
          ...( task.skillsRequired || [] ).map( ( skill ) => skill.name ),
        ].filter( Boolean ).join( " " ).toLowerCase();
        return searchable.includes( query );
      } )
      .sort( ( a, b ) => {
        const aClosed = ["COMPLETED", "CANCELLED"].includes( a.status );
        const bClosed = ["COMPLETED", "CANCELLED"].includes( b.status );
        if ( aClosed !== bClosed ) return aClosed ? 1 : -1;
        return new Date( a.dueDate || 0 ) - new Date( b.dueDate || 0 );
      } );
  }, [tasks, statusFilter, priorityFilter, search] );

  const handleUpdateTask = async ( { status, progressPercentage } ) => {
    if ( !editingTask ) return;
    setUpdating( true );

    try {
      const response = await apiRequest( `/api/tasks/${editingTask._id}/status`, {
        method: "PATCH",
        body: JSON.stringify( { status, progressPercentage } ),
      } );

      if ( response.task?._id ) {
        setTasks( ( current ) => current.map( ( task ) => task._id === response.task._id ? response.task : task ) );
      } else {
        await loadTasks( true );
      }

      setNotice( response.message || "Task progress updated successfully." );
      setEditingTask( null );
      setSelectedTask( null );
    } finally {
      setUpdating( false );
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch ( logoutError ) {
      console.error( "Logout request failed:", logoutError );
    } finally {
      navigate( "/login", { replace: true } );
    }
  };

  const employeeName = user?.name || "Employee";

  if ( loading ) {
    return (
      <main className="min-h-screen bg-[#070914] px-5 py-8 text-white sm:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-20 animate-pulse rounded-2xl bg-white/[.04]" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map( ( item ) => <div key={item} className="h-32 animate-pulse rounded-2xl bg-white/[.04]" /> )}</div>
          <div className="h-96 animate-pulse rounded-2xl bg-white/[.04]" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070914] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-violet-700/[.09] blur-[130px]" />
        <div className="absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-cyan-600/[.06] blur-[130px]" />
        <div className="grid-overlay absolute inset-0 opacity-[.10]" />
      </div>

      <header className="relative z-10 flex min-h-[76px] items-center justify-between border-b border-white/[.07] bg-[#090b18]/85 px-5 backdrop-blur-xl sm:px-8">
        <Link to="/employee/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10"><Sparkles className="h-5 w-5 text-violet-300" /></span>
          <span className="font-display text-base font-bold">WorkForce<span className="text-violet-400"> AI</span><span className="mt-0.5 block text-[9px] font-normal tracking-[.2em] text-slate-500">EMPLOYEE WORKSPACE</span></span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-xs text-slate-500 md:block">{employeeName}</span>
          <Link to="/employee/dashboard" className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-300 transition hover:border-violet-400/30 hover:text-white sm:inline-flex"><ArrowLeft size={14} /> Dashboard</Link>
          <Link to="/employee/attendance" className="hidden items-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/[.05] px-3 py-2.5 text-xs text-cyan-200 transition hover:bg-cyan-400/[.1] sm:inline-flex"><Clock3 size={14} /> Attendance</Link>
          <button type="button" onClick={() => loadTasks( true )} disabled={refreshing} aria-label="Refresh tasks" className="rounded-xl border border-white/10 p-2.5 text-slate-400 transition hover:border-violet-400/30 hover:text-violet-200 disabled:opacity-50"><RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /></button>
          <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs text-slate-400 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300"><LogOut size={14} /><span className="hidden sm:inline">Logout</span></button>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl space-y-7 px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[.2em] text-violet-300">EMPLOYEE / MY TASKS</p>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Your work, <span className="text-violet-300">in focus.</span></h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Review assignments, keep progress up to date, and submit completed work for review.</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/[.08] bg-white/[.03] px-4 py-3 text-xs text-slate-400"><ClipboardList size={15} className="text-violet-300" /> {pagination.total} assigned task{pagination.total === 1 ? "" : "s"}</div>
        </section>

        {error && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/[.08] px-4 py-3 text-xs text-red-300">{error}</div>}
        {notice && <div role="status" className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[.08] px-4 py-3 text-xs text-emerald-300"><span>{notice}</span><button type="button" onClick={() => setNotice( "" )} aria-label="Dismiss notification"><X size={14} /></button></div>}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={ClipboardList} label="Active tasks" value={counts.active} detail="Assigned and still open" tone="bg-violet-400/10 text-violet-300" />
          <MetricCard icon={Activity} label="In progress" value={counts.inProgress} detail="Currently being worked on" tone="bg-blue-400/10 text-blue-300" />
          <MetricCard icon={Eye} label="In review" value={counts.inReview} detail="Waiting for administrator review" tone="bg-amber-400/10 text-amber-300" />
          <MetricCard icon={Target} label="Overdue" value={counts.overdue} detail="Open tasks past their due date" tone="bg-red-400/10 text-red-300" />
        </section>

        <section className="rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-[10px] font-semibold tracking-[.18em] text-violet-300">ASSIGNED WORK</p>
              <h2 className="mt-1 font-display text-lg font-semibold text-white">Task list</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="relative block sm:min-w-64">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="search" value={search} onChange={( event ) => setSearch( event.target.value )} placeholder="Search tasks, skills, tags..." className="w-full rounded-xl border border-white/10 bg-[#090c19] py-2.5 pl-9 pr-3 text-xs text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-violet-400/40" />
              </label>
              <label className="relative flex items-center rounded-xl border border-white/10 bg-[#090c19] px-3">
                <ListFilter size={14} className="mr-2 shrink-0 text-slate-500" />
                <select
                  aria-label="Filter by priority"
                  value={priorityFilter}
                  onChange={( event ) => setPriorityFilter( event.target.value )}
                  className="w-full bg-transparent py-2.5 pr-5 text-xs text-slate-300 outline-none [color-scheme:dark]"
                >
                  <option className="bg-[#090c19] text-slate-200" value="ALL">
                    All priorities
                  </option>
                  <option className="bg-[#090c19] text-slate-200" value="URGENT">
                    Urgent
                  </option>
                  <option className="bg-[#090c19] text-slate-200" value="HIGH">
                    High
                  </option>
                  <option className="bg-[#090c19] text-slate-200" value="MEDIUM">
                    Medium
                  </option>
                  <option className="bg-[#090c19] text-slate-200" value="LOW">
                    Low
                  </option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {TASK_STATUSES.map( ( status ) => {
              const count = status.value === "ALL" ? tasks.length : tasks.filter( ( task ) => task.status === status.value ).length;
              const active = statusFilter === status.value;
              return (
                <button key={status.value} type="button" onClick={() => setStatusFilter( status.value )} className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-semibold transition ${active ? "border-violet-400/30 bg-violet-400/[.12] text-violet-200" : "border-white/[.07] bg-white/[.02] text-slate-500 hover:border-white/15 hover:text-slate-300"}`}>
                  {status.label}<span className={`rounded-md px-1.5 py-0.5 text-[9px] tabular-nums ${active ? "bg-violet-400/15 text-violet-200" : "bg-white/[.05] text-slate-600"}`}>{count}</span>
                </button>
              );
            } )}
          </div>

          <div className="mt-3 space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-5 py-14 text-center">
                <ClipboardList size={28} className="mx-auto text-slate-600" />
                <p className="mt-4 text-sm font-semibold text-slate-300">{tasks.length === 0 ? "No tasks assigned yet" : "No matching tasks"}</p>
                <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-600">{tasks.length === 0 ? "When an administrator assigns work to you, it will appear here." : "Try another status, priority, or search term."}</p>
                {( search || priorityFilter !== "ALL" || statusFilter !== "ALL" ) && <button type="button" onClick={() => { setSearch( "" ); setPriorityFilter( "ALL" ); setStatusFilter( "ALL" ); }} className="mt-4 text-xs font-semibold text-violet-300 hover:text-violet-200">Clear filters</button>}
              </div>
            ) : filteredTasks.map( ( task ) => {
              const progress = Math.max( 0, Math.min( 100, Number( task.progressPercentage || 0 ) ) );
              const closed = ["COMPLETED", "CANCELLED"].includes( task.status );
              const overdue = isOverdue( task );

              return (
                <article key={task._id} className="rounded-2xl border border-white/[.07] bg-[#090c19]/65 p-4 transition hover:border-violet-400/20 sm:p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words text-sm font-semibold text-slate-200">{task.title}</h3>
                        {overdue && <span className="rounded-full border border-red-400/20 bg-red-400/10 px-2 py-0.5 text-[8px] font-bold tracking-wide text-red-300">OVERDUE</span>}
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">{task.description || "No description provided."}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                        {task.departmentId?.name && <span className="rounded-full border border-white/[.07] bg-white/[.025] px-2.5 py-1 text-[9px] text-slate-500">{task.departmentId.name}</span>}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                      <button type="button" onClick={() => setSelectedTask( task )} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3.5 py-2.5 text-[10px] font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"><Eye size={13} /> Details</button>
                      {!closed && <button type="button" onClick={() => setEditingTask( task )} className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/[.08] px-3.5 py-2.5 text-[10px] font-semibold text-violet-200 transition hover:bg-violet-400/[.14]"><Activity size={13} /> Update progress</button>}
                      {closed && <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/[.07] px-3.5 py-2.5 text-[10px] text-slate-500"><CheckCircle2 size={13} /> Closed</span>}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                    <div>
                      <div className="flex items-center justify-between gap-3 text-[10px]">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-semibold tabular-nums text-slate-300">{progress}%</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all" style={{ width: `${progress}%` }} /></div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500"><CalendarDays size={13} className={overdue ? "text-red-300" : "text-slate-600"} /><span>Due {formatDate( task.dueDate )}</span></div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500"><Clock3 size={13} className="text-slate-600" /><span>{Number( task.estimatedHours || 0 )}h estimated</span></div>
                  </div>
                </article>
              );
            } )}
          </div>

          <div className="mt-5 flex flex-col gap-2 border-t border-white/[.06] pt-4 text-[10px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>Showing {tasks.length} loaded task{tasks.length === 1 ? "" : "s"}{pagination.total > tasks.length ? ` of ${pagination.total}` : ""}.</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-400/70" /> Only assigned tasks are visible to you.</span>
          </div>
        </section>

        <footer className="flex flex-col items-center justify-between gap-2 border-t border-white/[.06] pt-5 text-[10px] text-slate-600 sm:flex-row">
          <span>WorkForce AI · Employee workspace</span>
          <Link to="/employee/dashboard" className="inline-flex items-center gap-1.5 text-violet-300 transition hover:text-violet-200">Back to overview <ArrowRight size={12} /></Link>
        </footer>
      </div>

      <TaskDetailsModal
        task={selectedTask}
        onClose={() => setSelectedTask( null )}
        onUpdate={( task ) => { setSelectedTask( null ); setEditingTask( task ); }}
      />
      <UpdateTaskModal
        key={editingTask?._id || "no-task"}
        task={editingTask}
        onClose={() => setEditingTask( null )}
        onSubmit={handleUpdateTask}
        submitting={updating}
      />
    </main>
  );
}
