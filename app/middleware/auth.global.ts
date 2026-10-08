export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie<string | null>('baifa_auth_token')

  // Rutas exclusivas de invitados (si el usuario ya inició sesión, redirigir al dashboard)
  const guestOnlyRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
  const isGuestOnlyRoute = guestOnlyRoutes.some((route) => to.path === route || to.path.startsWith(`${route}/`))

  // Rutas públicas híbridas (accesibles tanto para invitados como para usuarios con sesión activa)
  const isHybridPublicRoute = to.path === '/tracking' || to.path.startsWith('/tracking/')

  // Si no está autenticado y la ruta no es de invitados ni pública híbrida, redirigir al login con redirect
  if (!token.value && !isGuestOnlyRoute && !isHybridPublicRoute) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // Si ya está autenticado e intenta acceder a rutas exclusivas de invitados, redirigir al dashboard
  if (token.value && isGuestOnlyRoute) {
    return navigateTo('/')
  }

  // Si es un cliente autenticado e intenta acceder a rutas exclusivas del personal administrativo, redirigir al dashboard
  const user = useCookie<any>('baifa_auth_user')
  const staffOnlyRoutes = ['/clients', '/users', '/reports']
  const isStaffRoute = staffOnlyRoutes.some((route) => to.path === route || to.path.startsWith(`${route}/`))

  if (token.value && user.value?.role === 'client' && isStaffRoute) {
    return navigateTo('/')
  }

  // Si un usuario no administrador intenta acceder a la gestión de usuarios, redirigir al inicio
  if (token.value && user.value?.role !== 'admin' && (to.path === '/users' || to.path.startsWith('/users/'))) {
    return navigateTo('/')
  }
})
