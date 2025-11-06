import { createRouter, createWebHashHistory } from 'vue-router'

// Use hash mode for Cordova (no server routing needed)
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { title: 'BetterIslam Q&A' }
    },
    {
      path: '/import',
      name: 'import',
      component: () => import('@/views/ImportView.vue'),
      meta: { title: 'Import Data' }
    },
    {
      path: '/browse',
      name: 'browse',
      component: () => import('@/views/BrowseView.vue'),
      meta: { title: 'Browse Categories' }
    },
    {
      path: '/category/:id',
      name: 'category',
      component: () => import('@/views/CategoryView.vue'),
      meta: { title: 'Category' }
    },
    {
      path: '/question/:id',
      name: 'question',
      component: () => import('@/views/QuestionView.vue'),
      meta: { title: 'Question' }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/views/SearchView.vue'),
      meta: { title: 'Search' }
    },
    {
      path: '/bookmarks',
      name: 'bookmarks',
      component: () => import('@/views/FoldersView.vue'),
      meta: { title: 'My Bookmarks' }
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: () => import('@/views/QuizView.vue'),
      meta: { title: 'Quiz' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { title: 'Settings' }
    }
  ]
})

// Update document title on route change
router.afterEach((to) => {
  document.title = to.meta.title || 'BetterIslam Q&A'
})

export default router
