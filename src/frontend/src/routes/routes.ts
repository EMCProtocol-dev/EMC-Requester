export const routes = [
  {
    path: '/',
    redirect: { path: '/info' },
  },
  {
    name: 'home',
    path: '/home',
    component: () => import('@/pages/home/home.vue'),
  },
  {
    name: 'info',
    path: '/info',
    component: () => import('@/pages/info/info.vue'),
  },
  {
    name: 'echo',
    path: '/echo',
    component: () => import('@/pages/echo/echo.vue'),
  },
  {
    name: 'idl',
    path: '/idl',
    component: () => import('@/pages/idl/idl.vue'),
  },
  {
    name: 'api',
    path: '/api/:key',
    component: () => import('@/pages/api/api.vue'),
  },
  {
    name: 'not-found',
    path: '/:pathMatch(.*)*',
    component: () => import('@/pages/not-found/not-found.vue'),
  },
];
