
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import gsap from "gsap";

import {
    ClipboardList,
    CircleDot,
    CheckCircle2,
    AlertTriangle,
    RefreshCw,
    Plus,
    Search,
    SlidersHorizontal,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { apiGet, apiRequest } from "../../services/api.js";

import TaskFormModal from "../../components/admin/TaskFormModal.jsx";
import TaskAssignmentModal from "../../components/admin/TaskAssignmentModal.jsx";
import TaskStatusModal from "../../components/admin/TaskStatusModal.jsx";
import TaskTable from "../../components/admin/TaskTable.jsx";

const LIMIT = 10;

const STATUSES = [
    "TODO",
    "IN_PROGRESS",
    "BLOCKED",
    "IN_REVIEW",
    "COMPLETED",
    "CANCELLED",
];

function StatCard( { icon: Icon, title, value, color } ) {
    return (
        <div className="task-reveal group relative overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/25">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-violet-500/[.05] blur-2xl transition group-hover:bg-violet-500/[.10]" />

            <div className="relative flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500">{title}</p>

                    <h3 className="mt-3 font-display text-3xl font-semibold tabular-nums">
                        {value}
                    </h3>
                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/[.06] ${color}`}
                >
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
}

export default function TasksPage() {
    const rootRef = useRef( null );

    // Main data
    const [tasks, setTasks] = useState( [] );
    const [employees, setEmployees] = useState( [] );
    const [departments, setDepartments] = useState( [] );

    // Statistics
    const [taskCounts, setTaskCounts] = useState( {} );
    const [urgentCount, setUrgentCount] = useState( 0 );

    // Loading states
    const [loading, setLoading] = useState( true );
    const hasLoadedRef = useRef( false );
    const [refreshing, setRefreshing] = useState( false );

    // Feedback
    const [error, setError] = useState( "" );
    const [notice, setNotice] = useState( "" );

    // Search and filters
    const [search, setSearch] = useState( "" );

    const [filters, setFilters] = useState( {
        status: "ALL",
        priority: "ALL",
        departmentId: "ALL",
        assignedTo: "ALL",
    } );

    // Pagination
    const [page, setPage] = useState( 1 );
    const [pagination, setPagination] = useState( {
        page: 1,
        total: 0,
        totalPages: 1,
    } );

    // Modal states
    const [formOpen, setFormOpen] = useState( false );
    const [editingTask, setEditingTask] = useState( null );

    const [assignmentTask, setAssignmentTask] = useState( null );
    const [statusTask, setStatusTask] = useState( null );

    // Load tasks using backend filters and pagination.
    const loadTasks = useCallback( async () => {
        if (!hasLoadedRef.current) {
        setLoading(true);
        } else {
        setRefreshing(true);
        }

        try {
            const params = new URLSearchParams( {
                page: String( page ),
                limit: String( LIMIT ),
            } );

            if ( filters.status !== "ALL" ) {
                params.set( "status", filters.status );
            }

            if ( filters.priority !== "ALL" ) {
                params.set( "priority", filters.priority );
            }

            if ( filters.departmentId !== "ALL" ) {
                params.set( "departmentId", filters.departmentId );
            }

            if ( filters.assignedTo !== "ALL" ) {
                params.set( "assignedTo", filters.assignedTo );
            }

            const response = await apiGet(
                `/api/tasks?${params.toString()}`
            );

            setTasks( response.tasks || [] );

            setPagination( {
                page: response.pagination?.page || page,
                total: response.pagination?.total || 0,
                totalPages: Math.max(
                    1,
                    response.pagination?.totalPages || 1
                ),
            } );
        } catch ( err ) {
            console.error( "Task loading error:", err );

            setError(
                err.message || "Unable to load tasks."
            );

            setTasks( [] );
        } finally {
            setLoading( false );
            setRefreshing( false );
            hasLoadedRef.current = true;
        }
    }, [page, filters] );

    // Load employee and department references.
    const loadReferences = useCallback( async () => {
        try {
            const [employeeResponse, departmentResponse] =
                await Promise.all( [
                    apiGet( "/api/employees" ),
                    apiGet( "/api/departments" ),
                ] );

            setEmployees( employeeResponse.employees || [] );
            setDepartments( departmentResponse.departments || [] );
        } catch ( err ) {
            console.error( "Task reference loading error:", err );

            setError(
                err.message || "Unable to load employee and department data."
            );
        }
    }, [] );

    // Load counts from server pagination metadata.
    const loadStats = useCallback( async () => {
        try {
            const results = await Promise.all( [
                ...STATUSES.map( ( status ) =>
                    apiGet(
                        `/api/tasks?status=${status}&page=1&limit=1`
                    )
                ),

                apiGet( "/api/tasks?priority=URGENT&page=1&limit=1" ),
            ] );

            const counts = {};

            STATUSES.forEach( ( status, index ) => {
                counts[status] = Number(
                    results[index]?.pagination?.total || 0
                );
            } );

            setTaskCounts( counts );

            setUrgentCount(
                Number(
                    results[STATUSES.length]?.pagination?.total || 0
                )
            );
        } catch ( err ) {
            console.error( "Task statistics error:", err );
        }
    }, [] );

    // Initial reference data and stats.
    useEffect( () => {
        loadReferences();
        loadStats();
    }, [loadReferences, loadStats] );

    // Refresh tasks when pagination or server filters change.
    useEffect( () => {
        loadTasks();
    }, [loadTasks] );

    // GSAP page animation.
    useEffect( () => {
        if ( loading || !rootRef.current ) return;

        const context = gsap.context( () => {
            const reducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

            if ( reducedMotion ) return;

            gsap.fromTo(
                ".task-intro",
                { autoAlpha: 0, y: 16 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.55,
                    ease: "power3.out",
                }
            );

            gsap.fromTo(
                ".task-reveal",
                { autoAlpha: 0, y: 18 },
                {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.45,
                    stagger: 0.07,
                    ease: "power2.out",
                    delay: 0.1,
                }
            );
        }, rootRef );

        return () => context.revert();
    }, [loading] );

    // Search is applied to tasks currently fetched from the server.
    const filteredTasks = useMemo( () => {
        const query = search.trim().toLowerCase();

        if ( !query ) return tasks;

        return tasks.filter( ( task ) => {
            const employeeName =
                task.assignedTo?.userId?.name || "";

            const departmentName =
                task.departmentId?.name || "";

            return [
                task.title,
                task.description,
                employeeName,
                departmentName,
                task.priority,
                task.status,
            ].some( ( value ) =>
                String( value || "" ).toLowerCase().includes( query )
            );
        } );
    }, [tasks, search] );

    const totalTasks = STATUSES.reduce(
        ( sum, status ) => sum + ( taskCounts[status] || 0 ),
        0
    );

    const completedTasks = taskCounts.COMPLETED || 0;

    const openTasks =
        totalTasks -
        completedTasks -
        ( taskCounts.CANCELLED || 0 );

    const stats = [
        {
            title: "Total tasks",
            value: totalTasks,
            icon: ClipboardList,
            color: "bg-violet-400/10 text-violet-300",
        },
        {
            title: "Open tasks",
            value: openTasks,
            icon: CircleDot,
            color: "bg-cyan-400/10 text-cyan-300",
        },
        {
            title: "Completed tasks",
            value: completedTasks,
            icon: CheckCircle2,
            color: "bg-emerald-400/10 text-emerald-300",
        },
        {
            title: "Urgent tasks",
            value: urgentCount,
            icon: AlertTriangle,
            color: "bg-red-400/10 text-red-300",
        },
    ];

    const updateFilter = ( name, value ) => {
        setFilters( ( previous ) => ( {
            ...previous,
            [name]: value,
        } ) );

        setPage( 1 );
    };

    const refreshAll = async () => {
        await Promise.all( [
            loadTasks(),
            loadReferences(),
            loadStats(),
        ] );
    };

    // Open create task form.
    const openCreateModal = () => {
        setEditingTask( null );
        setFormOpen( true );
    };

    // Open edit task form.
    const openEditModal = ( task ) => {
        setEditingTask( task );
        setFormOpen( true );
    };

    const closeForm = () => {
        setFormOpen( false );
        setEditingTask( null );
    };

    // Create or update task details.
    const handleSaveTask = async ( payload ) => {
        const isEdit = Boolean( editingTask );

        const endpoint = isEdit
            ? `/api/tasks/${editingTask._id}`
            : "/api/tasks";

        const response = await apiRequest( endpoint, {
            method: isEdit ? "PUT" : "POST",
            body: JSON.stringify( payload ),
        } );

        closeForm();

        setNotice(
            response.message ||
            ( isEdit
                ? "Task updated successfully."
                : "Task created successfully. You can now assign an employee." )
        );

        setSearch( "" );

        if ( page !== 1 ) {
            setPage( 1 );
        } else {
            await loadTasks();
        }

        await loadStats();
    };

    // Assign or reassign task.
    const handleAssignment = async ( employeeId ) => {
        if ( !assignmentTask ) return;

        const response = await apiRequest(
            `/api/tasks/${assignmentTask._id}/assign`,
            {
                method: "PATCH",
                body: JSON.stringify( { employeeId } ),
            }
        );

        setAssignmentTask( null );

        setNotice(
            response.message || "Employee assigned successfully."
        );

        await loadTasks();
        await loadStats();
    };

    // Update status and progress.
    const handleStatusUpdate = async ( payload ) => {
        if ( !statusTask ) return;

        const response = await apiRequest(
            `/api/tasks/${statusTask._id}/status`,
            {
                method: "PATCH",
                body: JSON.stringify( payload ),
            }
        );

        setStatusTask( null );

        setNotice(
            response.message || "Task status updated successfully."
        );

        await loadTasks();
        await loadStats();
    };

    const clearFilters = () => {
        setSearch( "" );

        setFilters( {
            status: "ALL",
            priority: "ALL",
            departmentId: "ALL",
            assignedTo: "ALL",
        } );

        setPage( 1 );
    };

    if ( loading && !hasLoadedRef.current ) {
        return (
            <div className="space-y-7">
                <div className="h-24 animate-pulse rounded-2xl bg-white/[.025]" />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map( ( item ) => (
                        <div
                            key={item}
                            className="h-28 animate-pulse rounded-2xl bg-white/[.025]"
                        />
                    ) )}
                </div>

                <div className="h-96 animate-pulse rounded-2xl bg-white/[.025]" />
            </div>
        );
    }

    return (
        <div ref={rootRef} className="space-y-7">
            {/* Heading */}
            <div className="task-intro flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-300">
                        WORKFORCE / OPERATIONS
                    </p>

                    <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                        Task <span className="text-violet-300">management.</span>
                    </h1>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                        Create work, assign ownership, track priorities and
                        monitor progress across your organization.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={refreshAll}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-xs font-medium text-slate-300 transition hover:border-violet-400/30 hover:bg-violet-400/10 hover:text-white disabled:opacity-50"
                    >
                        <RefreshCw
                            size={15}
                            className={refreshing ? "animate-spin" : ""}
                        />

                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 text-xs font-semibold text-white shadow-[0_0_25px_rgba(124,58,237,.22)] transition hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(124,58,237,.35)]"
                    >
                        <Plus size={16} />
                        Create task
                    </button>
                </div>
            </div>

            {/* Notifications */}
            {notice && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[.07] px-4 py-3 text-xs text-emerald-300">
                    <span>{notice}</span>

                    <button
                        type="button"
                        onClick={() => setNotice( "" )}
                        className="text-emerald-200/70 hover:text-white"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {error && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-red-400/20 bg-red-400/[.07] px-4 py-3 text-xs text-red-300">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError( "" )}
                        className="text-red-200/70 hover:text-white"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Statistics */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map( ( stat ) => (
                    <StatCard key={stat.title} {...stat} />
                ) )}
            </div>

            {/* Filters */}
            <section className="task-reveal rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                    <SlidersHorizontal
                        size={16}
                        className="text-violet-300"
                    />

                    <h2 className="text-sm font-semibold">
                        Find and filter tasks
                    </h2>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <div className="relative xl:col-span-1">
                        <Search
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={( event ) => setSearch( event.target.value )}
                            placeholder="Search current page..."
                            className="w-full rounded-xl border border-white/10 bg-[#090c19] py-3 pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-600 focus:border-violet-400/50"
                        />
                    </div>

                    <select
                        value={filters.status}
                        onChange={( event ) =>
                            updateFilter( "status", event.target.value )
                        }
                        className="rounded-xl border border-white/10 bg-[#090c19] px-3 py-3 text-xs text-slate-300 outline-none focus:border-violet-400/50"
                    >
                        <option value="ALL">All statuses</option>
                        <option value="TODO">To do</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="IN_REVIEW">In review</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>

                    <select
                        value={filters.priority}
                        onChange={( event ) =>
                            updateFilter( "priority", event.target.value )
                        }
                        className="rounded-xl border border-white/10 bg-[#090c19] px-3 py-3 text-xs text-slate-300 outline-none focus:border-violet-400/50"
                    >
                        <option value="ALL">All priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                    </select>

                    <select
                        value={filters.departmentId}
                        onChange={( event ) =>
                            updateFilter( "departmentId", event.target.value )
                        }
                        className="rounded-xl border border-white/10 bg-[#090c19] px-3 py-3 text-xs text-slate-300 outline-none focus:border-violet-400/50"
                    >
                        <option value="ALL">All departments</option>

                        {departments.map( ( department ) => (
                            <option
                                key={department._id}
                                value={department._id}
                                className="bg-[#090c19]"
                            >
                                {department.name}
                            </option>
                        ) )}
                    </select>

                    <select
                        value={filters.assignedTo}
                        onChange={( event ) =>
                            updateFilter( "assignedTo", event.target.value )
                        }
                        className="rounded-xl border border-white/10 bg-[#090c19] px-3 py-3 text-xs text-slate-300 outline-none focus:border-violet-400/50"
                    >
                        <option value="ALL">All assignees</option>


                        {employees.map( ( employee ) => (
                            <option
                                key={employee._id}
                                value={employee._id}
                                className="bg-[#090c19]"
                            >
                                {employee.userId?.name || employee.employeeCode}
                            </option>
                        ) )}
                    </select>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
                    <span>
                        Showing {filteredTasks.length} matching records on this page
                        {" · "}
                        {pagination.total} total matching the server filters
                    </span>

                    <button
                        type="button"
                        onClick={clearFilters}
                        className="text-violet-300 transition hover:text-white"
                    >
                        Clear filters
                    </button>
                </div>
            </section>

            {/* Table */}
            <div className="task-reveal">
                <TaskTable
                    tasks={filteredTasks}
                    onEdit={openEditModal}
                    onAssign={setAssignmentTask}
                    onUpdateProgress={setStatusTask}
                />
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 rounded-2xl border border-white/[.07] bg-[#0d1020]/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-xs text-slate-500">
                    Page <span className="font-semibold text-slate-300">{page}</span>
                    {" "}of{" "}
                    <span className="font-semibold text-slate-300">
                        {pagination.totalPages}
                    </span>
                    {" · "}
                    {pagination.total} tasks
                </p>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={page <= 1 || refreshing}
                        onClick={() => setPage( ( value ) => Math.max( 1, value - 1 ) )}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        <ChevronLeft size={15} />
                        Previous
                    </button>

                    <button
                        type="button"
                        disabled={
                            page >= pagination.totalPages || refreshing
                        }
                        onClick={() =>
                            setPage( ( value ) =>
                                Math.min( pagination.totalPages, value + 1 )
                            )
                        }
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                        Next
                        <ChevronRight size={15} />
                    </button>
                </div>
            </div>

            <div className="border-t border-white/[.06] pt-5 text-center">
                <p className="text-[10px] tracking-wider text-slate-600">
                    WORKFORCE AI · TASK WORKSPACE
                </p>
            </div>

            {/* Create/Edit modal */}
            <TaskFormModal
                open={formOpen}
                task={editingTask}
                departments={departments}
                onClose={() => {
                    setFormOpen( false );
                    setEditingTask( null );
                }}
                onSubmit={handleSaveTask}
            />

            {/* Assignment modal */}
            <TaskAssignmentModal
                open={Boolean( assignmentTask )}
                task={assignmentTask}
                employees={employees}
                onClose={() => setAssignmentTask( null )}
                onSubmit={handleAssignment}
            />

            {/* Status modal */}
            <TaskStatusModal
                open={Boolean( statusTask )}
                task={statusTask}
                onClose={() => setStatusTask( null )}
                onSubmit={handleStatusUpdate}
            />
        </div>
    );
}
