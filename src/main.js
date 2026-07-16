import './styles.css';

const body = document.body;
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.nav-toggle');
const navigation = document.querySelector('.site-nav');
const menuMedia = window.matchMedia('(max-width: 1039px)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const backToTop = document.querySelector('.back-to-top');

body.classList.add('js-ready');

function setMenuState(open) {
  if (!menuButton || !navigation) return;

  const shouldOpen = menuMedia.matches && open;
  menuButton.setAttribute('aria-expanded', String(shouldOpen));
  menuButton.setAttribute('aria-label', shouldOpen ? 'Fechar menu' : 'Abrir menu');
  navigation.toggleAttribute('inert', menuMedia.matches && !shouldOpen);

  if (menuMedia.matches) {
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
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    if (
      menuMedia.matches &&
      isOpen &&
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

function updateScrollState() {
  const isScrolled = window.scrollY > 24;
  header?.classList.toggle('is-scrolled', isScrolled);
  backToTop?.classList.toggle('is-visible', window.scrollY > 620);
}

updateScrollState();
window.addEventListener('scroll', updateScrollState, { passive: true });

for (const trigger of document.querySelectorAll('[data-scroll-top]')) {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
}

const menuItems = [
  {
    categories: ['destaques', 'carne'],
    name: 'Cozido à Portuguesa',
    description: 'Carnes selecionadas, enchidos, legumes e arroz, servidos à maneira tradicional.',
    price: '16,00 €',
    tag: 'Casa',
  },
  {
    categories: ['destaques', 'peixe'],
    name: 'Bacalhau à Sampaio',
    description: 'Lombo de bacalhau, batata assada, cebolada e azeite aromático.',
    price: '17,50 €',
    tag: 'Assinatura',
  },
  {
    categories: ['destaques', 'carne'],
    name: 'Vitela Assada no Forno',
    description: 'Vitela assada lentamente, batata dourada e legumes da época.',
    price: '16,50 €',
    tag: 'Clássico',
  },
  {
    categories: ['destaques', 'carne'],
    name: 'Francesinha Especial',
    description: 'Carnes grelhadas, queijo fundido, molho da casa e batata frita.',
    price: '13,50 €',
  },
  {
    categories: ['destaques', 'peixe'],
    name: 'Arroz de Tamboril',
    description: 'Arroz malandrinho de tamboril e camarão, finalizado com coentros.',
    price: '32,00 €',
    tag: '2 pessoas',
  },
  {
    categories: ['destaques', 'sobremesas'],
    name: 'Bolo de Bolacha',
    description: 'O clássico de café e bolacha, preparado na casa.',
    price: '4,20 €',
  },
  {
    categories: ['entradas'],
    name: 'Sopa do Dia',
    description: 'Preparada diariamente com legumes frescos.',
    price: '2,80 €',
  },
  {
    categories: ['entradas'],
    name: 'Tábua Regional',
    description: 'Seleção de queijo, presunto, enchidos e compota.',
    price: '9,50 €',
  },
  {
    categories: ['entradas'],
    name: 'Alheira Crocante',
    description: 'Alheira, grelos salteados e mostarda antiga.',
    price: '7,50 €',
  },
  {
    categories: ['entradas', 'vegetariano'],
    name: 'Pimentos Padrón',
    description: 'Salteados em azeite e terminados com flor de sal.',
    price: '5,50 €',
  },
  {
    categories: ['carne'],
    name: 'Bife à Sampaio',
    description: 'Bife da vazia, molho de vinho do Porto e batata rústica.',
    price: '18,00 €',
  },
  {
    categories: ['carne'],
    name: 'Feijoada à Transmontana',
    description: 'Feijão encarnado, carnes fumadas, couve e arroz branco.',
    price: '14,50 €',
  },
  {
    categories: ['peixe'],
    name: 'Polvo à Lagareiro',
    description: 'Polvo assado, batata a murro, alho e azeite virgem.',
    price: '18,50 €',
  },
  {
    categories: ['peixe'],
    name: 'Robalo Grelhado',
    description: 'Peixe grelhado, legumes salteados e batata cozida.',
    price: '16,00 €',
  },
  {
    categories: ['vegetariano'],
    name: 'Arroz Cremoso de Cogumelos',
    description: 'Cogumelos da época, queijo curado e ervas frescas.',
    price: '13,00 €',
  },
  {
    categories: ['vegetariano'],
    name: 'Legumes Assados no Forno',
    description: 'Legumes da estação, húmus, sementes tostadas e ervas.',
    price: '11,50 €',
  },
  {
    categories: ['vegetariano'],
    name: 'Salada Mediterrânica',
    description: 'Folhas verdes, tomate, queijo, azeitona, fruta e vinagrete.',
    price: '10,50 €',
  },
  {
    categories: ['sobremesas'],
    name: 'Pudim Abade de Priscos',
    description: 'Textura rica, caramelo e raspa de citrinos.',
    price: '4,50 €',
  },
  {
    categories: ['sobremesas'],
    name: 'Leite-Creme Queimado',
    description: 'Creme de limão e canela com açúcar queimado no momento.',
    price: '4,00 €',
  },
  {
    categories: ['sobremesas'],
    name: 'Fruta da Época',
    description: 'Seleção de fruta fresca preparada no momento.',
    price: '3,50 €',
  },
];

const menuList = document.querySelector('#menu-list');
const menuFilters = [...document.querySelectorAll('[data-menu-filter]')];

function renderMenu(category) {
  if (!menuList) return;

  const visibleItems = menuItems.filter((item) => item.categories.includes(category));
  menuList.innerHTML = visibleItems
    .map(
      (item, index) => `
        <article class="menu-item" style="animation-delay: ${index * 45}ms">
          <div>
            <h3>${item.name}${item.tag ? `<em class="menu-item-tag">${item.tag}</em>` : ''}</h3>
            <p>${item.description}</p>
          </div>
          <strong>${item.price}</strong>
        </article>`,
    )
    .join('');
}

if (menuList && menuFilters.length) {
  renderMenu('destaques');
  menuFilters.forEach((button) => {
    button.addEventListener('click', () => {
      menuFilters.forEach((filter) => filter.setAttribute('aria-pressed', 'false'));
      button.setAttribute('aria-pressed', 'true');
      renderMenu(button.dataset.menuFilter);
    });
  });
}

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
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
  );
  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('figure img');
const lightboxCaption = lightbox?.querySelector('figcaption');
const galleryButtons = [...document.querySelectorAll('[data-lightbox]')];
let activePhoto = 0;

function showPhoto(index) {
  if (!lightboxImage || !lightboxCaption || !galleryButtons.length) return;
  activePhoto = (index + galleryButtons.length) % galleryButtons.length;
  const button = galleryButtons[activePhoto];
  const thumbnail = button.querySelector('img');
  const caption = button.dataset.caption || thumbnail?.alt || '';
  lightboxImage.src = thumbnail?.currentSrc || thumbnail?.src || button.dataset.full;
  lightboxImage.alt = caption;
  lightboxCaption.textContent = caption;
}

function openLightbox(index) {
  if (!lightbox || typeof lightbox.showModal !== 'function') return;
  showPhoto(index);
  lightbox.showModal();
  body.classList.add('lightbox-open');
}

function closeLightbox() {
  if (!lightbox?.open) return;
  lightbox.close();
}

galleryButtons.forEach((button, index) => {
  button.addEventListener('click', () => openLightbox(index));
});

lightbox?.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
lightbox?.querySelector('.lightbox-prev')?.addEventListener('click', () => showPhoto(activePhoto - 1));
lightbox?.querySelector('.lightbox-next')?.addEventListener('click', () => showPhoto(activePhoto + 1));
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
lightbox?.addEventListener('close', () => body.classList.remove('lightbox-open'));
lightbox?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') showPhoto(activePhoto - 1);
  if (event.key === 'ArrowRight') showPhoto(activePhoto + 1);
});

for (const details of document.querySelectorAll('.faq details')) {
  details.addEventListener('toggle', () => {
    if (!details.open) return;
    document.querySelectorAll('.faq details[open]').forEach((other) => {
      if (other !== details) other.removeAttribute('open');
    });
  });
}

const year = document.querySelector('[data-current-year]');
if (year) year.textContent = String(new Date().getFullYear());
