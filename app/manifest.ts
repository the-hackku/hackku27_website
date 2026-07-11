import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'HackKU Dashboard',
    short_name: 'HackKU',
    description: 'The official HackKU dashboard for hackers and volunteers to manage their HackKU experience.',
    start_url: '/profile',
    display: 'standalone',
    background_color: '#fff',
    theme_color: '#fff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}