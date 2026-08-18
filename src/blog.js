// Fetches recent posts from the Blogger JSON feed and renders them as themed
// teaser cards that link out to the full posts on Blogger.

const FEED_BASE = 'https://blog.polishallthethings.com/feeds/posts/default'
const MAX_RESULTS = 10

const container = document.getElementById('blog-posts')

// Only run on a page that actually has the blog container.
if (container) {
  loadPosts()
}

// Blogger's feed does not send CORS headers, so a normal fetch() is blocked by
// the browser. Instead we use JSONP: we append a <script> tag whose URL asks
// Blogger for "json-in-script" and names a callback. Blogger responds with
// JavaScript that calls our callback, passing the feed data in.
function loadPosts() {
  // The callback must be reachable by name from the global scope. This file is
  // an ES module, so its functions are NOT global by default — we attach the
  // callback to window explicitly so Blogger's returned script can find it.
  window.renderBloggerFeed = onFeedLoaded

  const script = document.createElement('script')
  script.src = `${FEED_BASE}?alt=json-in-script&callback=renderBloggerFeed&max-results=${MAX_RESULTS}`
  script.onerror = () =>
    showMessage(
      'Sorry, the blog posts could not be loaded right now. ' +
        'You can visit the blog directly at blog.polishallthethings.com.'
    )
  document.body.appendChild(script)
}

function onFeedLoaded(data) {
  const entries = (data && data.feed && data.feed.entry) || []
  renderPosts(entries)
}

function renderPosts(entries) {
  container.innerHTML = '' // clear the "Loading…" message
  if (entries.length === 0) {
    showMessage('No posts yet — check back soon!')
    return
  }
  for (const entry of entries) {
    container.appendChild(buildCard(entry))
  }
}

// Build one themed teaser card for a post.
function buildCard(entry) {
  const url = getPostUrl(entry)

  // Parse the post's HTML content once, in an inert document. Images in a
  // DOMParser document are NOT downloaded during parsing — so reading the
  // content here is cheap; only the one thumbnail we choose will actually load.
  const doc = new DOMParser().parseFromString(entry.content.$t, 'text/html')

  // The card is a horizontal row: small thumbnail on the left, text on the
  // right. On narrow screens it stacks (flex-col) so it stays readable.
  const card = document.createElement('article')
  card.className =
    'w-full max-w-3xl p-6 bg-white border border-black rounded-lg shadow-sm flex flex-col sm:flex-row gap-4'

  // Thumbnail on the left (small, fixed size), if the post has an image.
  const imgSrc = firstImageSrc(doc)
  if (imgSrc) {
    const thumb = document.createElement('img')
    thumb.src = imgSrc
    thumb.alt = entry.title.$t
    thumb.loading = 'lazy'
    // shrink-0 stops the image from being squeezed when the text is long.
    thumb.className = 'w-28 h-28 object-cover rounded-md shrink-0'
    card.appendChild(thumb)
  }

  // Everything else goes in a text column that fills the remaining width.
  const body = document.createElement('div')
  body.className = 'flex-1'

  // Title (links out to the full post on Blogger)
  const heading = document.createElement('h5')
  heading.className = 'mb-2'
  const titleLink = document.createElement('a')
  titleLink.href = url
  titleLink.target = '_blank'
  titleLink.rel = 'noopener'
  titleLink.className = 'text-2xl font-bold font-heading hover:text-secondary'
  titleLink.textContent = entry.title.$t
  heading.appendChild(titleLink)
  body.appendChild(heading)

  // Date
  const date = document.createElement('p')
  date.className = 'text-sm text-gray-500 mb-3'
  date.textContent = formatDate(entry.published.$t)
  body.appendChild(date)

  // Excerpt (plain text pulled from the post's HTML content)
  const excerpt = document.createElement('p')
  excerpt.className = 'font-normal mb-4'
  excerpt.textContent = makeExcerpt(doc, 200)
  body.appendChild(excerpt)

  // "Read more" link out to Blogger
  const more = document.createElement('a')
  more.href = url
  more.target = '_blank'
  more.rel = 'noopener'
  more.className = 'font-bold hover:text-secondary'
  more.textContent = 'Read more →'
  body.appendChild(more)

  card.appendChild(body)
  return card
}

// Find the public post URL (the "alternate" link) among the entry's links.
function getPostUrl(entry) {
  const link = (entry.link || []).find((l) => l.rel === 'alternate')
  return link ? link.href : '#'
}

// Grab the src of the first <img> in the parsed post content (or null).
function firstImageSrc(doc) {
  const img = doc.querySelector('img')
  return img ? img.getAttribute('src') : null
}

// Turn the parsed post content into a short plain-text excerpt.
function makeExcerpt(doc, maxLength) {
  const text = (doc.body.textContent || '').trim()
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

// Format an ISO date like "2026-07-03T..." into "July 3, 2026".
function formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Replace the container's contents with a single centered message.
function showMessage(text) {
  container.innerHTML = ''
  const p = document.createElement('p')
  p.className = 'text-text text-center max-w-2xl'
  p.textContent = text
  container.appendChild(p)
}
