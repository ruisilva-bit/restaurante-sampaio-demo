import './styles.css';

const body = document.body;
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.nav-toggle');
const navigation = document.querySelector('.site-nav');
const menuMedia = window.matchMedia('(max-width: 859px)');

body.classList.add('js-ready');

function setMenuState(open) {
  if (!menuButton || !navigation) return;

  const isMobile = menuMedia.matches;
  const shouldOpen = isMobile && open;

  menuButton.setAttribute('aria-expanded', String(shouldOpen));
  menuButton.setAttribute('aria-label', shouldOpen ? 'Fechar menu' : 'Abrir menu');
  navigation.toggleAttribute('inert', isMobile && !shouldOpen);

  if (isMobile) {
    navigation.setAttribute('aria-hidden', String(!shouldOpen));
  } else {
    navigation.removeAttribute('aria-hidden');
  }

  body.classList.toggle('nav-open', shouldOpen);
}

if (menuButton && navigation) {
  setMenuState(false);

  menuButton.addEventListener('click', () => {
    setMenuState(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuState(false);
  });

  document.addEventListener('click', (event) => {
    if (
      menuMedia.matches &&
      menuButton.getAttribute('aria-expanded') === 'true' &&
      !navigation.contains(event.target) &&
      !menuButton.contains(event.target)
    ) {
      setMenuState(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenuState(false);
      menuButton.focus();
    }
  });

  menuMedia.addEventListener('change', () => setMenuState(false));
}

function updateHeader() {
  header?.classList.toggle('is-scrolled', window.scrollY > 24);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealElements = document.querySelectorAll('[data-reveal]');

if (!reduceMotion && 'IntersectionObserver' in window) {
  body.classList.add('reveal-ready');

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}
