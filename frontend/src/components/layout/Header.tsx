function Header() {
  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-20 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-8">

        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Panel empresarial
          </h2>

          <p className="text-sm text-slate-500">
            Análisis de ventas e indicadores
          </p>
        </div>

        <div className="flex items-center gap-4">

          <span className="text-lg">
            🔍
          </span>

          <span className="text-lg">
            🔔
          </span>

          <div className="flex items-center gap-3 border-l border-slate-200 pl-5">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
              JD
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Usuario
              </p>

              <p className="text-xs text-slate-500">
                Administrador
              </p>
            </div>

          </div>

        </div>

      </div>
    </header>
  )
}

export default Header