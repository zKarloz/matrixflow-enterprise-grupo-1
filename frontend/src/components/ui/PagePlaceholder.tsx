interface PagePlaceholderProps {
  title: string
  description: string
}

function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {title}
        </h1>

        <p className="mt-2 text-slate-500">
          {description}
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">

        <p className="text-slate-500">
          Módulo en desarrollo
        </p>

      </div>

    </div>
  )
}

export default PagePlaceholder