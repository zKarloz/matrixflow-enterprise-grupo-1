interface CompanyInfoCardProps {
  label: string
  value: string
}

function CompanyInfoCard({
  label,
  value,
}: CompanyInfoCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-semibold text-slate-900">
        {value}
      </p>
    </div>
  )
}

export default CompanyInfoCard