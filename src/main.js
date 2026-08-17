import 'flowbite'

// Back to Top button: show it after scrolling down, smooth-scroll up on click
const backToTop = document.getElementById('back-to-top')

if (backToTop) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTop.classList.remove('hidden', 'opacity-0')
      backToTop.classList.add('opacity-100')
    } else {
      backToTop.classList.add('opacity-0')
      setTimeout(() => {
        if (window.scrollY <= 300) {
          backToTop.classList.add('hidden')
        }
      }, 300)
    }
  })

  // Smooth scroll to top
  backToTop.addEventListener('click', (e) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}