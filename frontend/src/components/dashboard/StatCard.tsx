import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: React.ReactNode
  description: string
  icon: LucideIcon
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}

export default StatCard