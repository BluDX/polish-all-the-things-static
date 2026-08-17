import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import handlebars from 'vite-plugin-handlebars'

// Shared footer year (build-time). Single source of truth for the © date.
const year = new Date().getFullYear()

// Per-page context for the shared navbar/footer partials.
//  - home:   prefix for in-page anchors. '' on the homepage (#about), 'index.html'
//            on subpages so links point back home (index.html#about).
//  - isHome: whether to render the Home nav link in its "current page" active state.
const pageContext = {
  'index.html':                { home: '',           isHome: true,  year },
  'care-of-jewelry.html':      { home: 'index.html', isHome: false, year },
  'decal-application.html':    { home: 'index.html', isHome: false, year },
  'press-on-application.html': { home: 'index.html', isHome: false, year },
  'press-on-guide.html':       { home: 'index.html', isHome: false, year },
}

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: fileURLToPath(new URL('./src/partials', import.meta.url)),
      context: (pagePath) =>
        pageContext[pagePath.replace(/^\//, '')] ?? { home: 'index.html', isHome: false, year },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        care: 'care-of-jewelry.html',
        decal: 'decal-application.html',
        presson: 'press-on-application.html',
        guide: 'press-on-guide.html'
      }
    }
  }
})
