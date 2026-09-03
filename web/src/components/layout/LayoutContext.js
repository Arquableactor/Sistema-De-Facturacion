import { createContext, useContext } from 'react'

// Puente entre AppLayout (dueño del estado del drawer móvil) y el Topbar de cada página,
// que renderiza el botón hamburguesa. Así el botón vive junto al título de la página (donde
// el usuario lo espera) sin que AppLayout tenga que envolver cada página.
export const LayoutContext = createContext({ drawerOpen: false, openDrawer: () => {} })

export function useLayout() {
  return useContext(LayoutContext)
}
