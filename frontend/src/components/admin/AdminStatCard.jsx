
import { motion } from "framer-motion";

export default function AdminStatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  iconBackground,
  index = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group relative overflow-hidden rounded-2xl border border-white/[.08] bg-[#0d1020]/90 p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:shadow-[0_12px_45px_rgba(0,0,0,.2)] sm:p-6"
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-500/[.04] blur-2xl transition group-hover:bg-violet-500/[.10]" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-400 sm:text-sm">
            {title}
          </p>

          <h3 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {value}
          </h3>

          <p className="mt-2 text-[10px] text-slate-500 sm:text-xs">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[.06] ${iconBackground}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </motion.div>
  );
}
