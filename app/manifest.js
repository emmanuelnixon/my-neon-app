// app/manifest.ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PROJECT',
    short_name: 'makerpath',
    description: 'An app that lets you search,build and analyse your project',
    start_url: '/',
    display: 'standalone',
    background_color: 'black',
    theme_color: 'brown',
    icons: [
      {
        src: '/icon-192x192.png', // Path to your icon in the public folder
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png', // Path to your icon in the public folder
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
