export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie<string | null>('baifa_auth_token')

  const publicRoutes = ['/login', '/register', '/forgot-password']
  const isPublicRoute = publicRoutes.some((route) => to.path === route || to.path.startsWith(`${route}/`))

  // Si no está autenticado y la ruta no es pública, redirigir al login
  if (!token.value && !isPublicRoute) {
    return navigateTo('/login')
  }

  // Si ya está autenticado e intenta acceder al login o registro, redirigir al dashboard
  if (token.value && isPublicRoute) {
    return navigateTo('/')
  }

  // Si es un cliente autenticado e intenta acceder a rutas del personal administrativo, redirigir al portal de clientes
  const user = useCookie<any>('baifa_auth_user')
  if (token.value && user.value?.role === 'client' && to.path !== '/') {
    return navigateTo('/')
  }
})
