'use client'

import { Suspense, useEffect, useLayoutEffect } from "react"
import { Analytics } from "@vercel/analytics/next"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Usamos useLayoutEffect para limpiar el atributo antes de la hidratación
  useLayoutEffect(() => {
    // Verificamos si estamos en el cliente
    if (typeof window !== 'undefined') {
      // Eliminamos el atributo ap-style si existe
      if (document.body.hasAttribute('ap-style')) {
        document.body.removeAttribute('ap-style')
      }
    }
  }, [])
  
  return (
    <>
      <Suspense fallback={null}>{children}</Suspense>
      <Analytics />
    </>
  )
}
