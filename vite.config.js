import {defineConfig} from "vite"
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
	plugins: [
		VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'ithamar.png'],
            manifest: {
                name: 'Ithamar Grocery List',
                short_name: 'Ithamar',
                description: 'A simple grocery list app that can be installed.',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                icons: [
                    {
                        src: 'android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
        })
	]
})