// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxtjs/supabase'],
  supabase: {
    redirect: false // Disable redirect so we don't force login by default
  },
  app: {
    head: {
      title: 'ระบบนิเทศ ติดตามการเปิดภาคเรียนที่ 1 ปีการศึกษา 2569 สพป.นม. 2',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
        { name: 'theme-color', content: '#090d16' },
        { name: 'description', content: 'ระบบนิเทศ ติดตามการเปิดภาคเรียนที่ 1 ปีการศึกษา 2569 บูรณาการ 4 เรื่องหลัก สพป.นครราชสีมา เขต 2' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'นิเทศ สพป.นม.2' }
      ],
      link: [
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', href: '/favicon.png' }
      ]
    }
  }
})
