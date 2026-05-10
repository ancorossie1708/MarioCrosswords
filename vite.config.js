import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './', // הנתיב היחסי שסידרנו קודם
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      },
      manifest: {
        name: 'Bros Crosswords',
        short_name: 'Crosswords',
        description: 'משחק להצלת פיץ',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'fullscreen',
        icons: [
          {
            src: './assets/ui/game_icon.png', // <--- הנתיב המדויק לאייקון החדש שלך!
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: './assets/ui/game_icon.png', // <--- וגם פה
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})