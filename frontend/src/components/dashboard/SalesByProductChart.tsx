function SalesByProductChart() {
  return (
    <div className="flex h-[320px] w-full flex-col items-center justify-center text-center">
      {/* Indicamos que todavía no existe una fuente de datos
          que relacione las ventas con sus productos. */}
      <p className="text-sm font-medium text-slate-600">
        Ventas por producto no disponibles
      </p>

      {/* Explicamos por qué no mostramos datos simulados. */}
      <p className="mt-2 max-w-md text-sm text-slate-400">
        El endpoint actual de ventas no incluye el detalle de productos
        asociado a cada venta.
      </p>
    </div>
  )
}

export default SalesByProductChart