const STORAGE_KEYS = {
  theme: 'daniel-threads-theme',
  cart: 'daniel-threads-cart',
  wishlist: 'daniel-threads-wishlist',
  budget: 'daniel-threads-budget'
};

function safeJSONParse(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : safeJSONParse(raw, fallback);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage write failures in restricted browsing modes
  }
}

function showToast(message) {
  const toast = document.querySelector('.toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function applyTheme(theme) {
  const root = document.documentElement;
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  root.setAttribute('data-theme', resolvedTheme);
  writeStorage(STORAGE_KEYS.theme, resolvedTheme);
}

function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const savedTheme = readStorage(STORAGE_KEYS.theme, 'light');
  applyTheme(savedTheme);

  toggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    showToast(nextTheme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled');
  });
}

function initLoader() {
  const loader = document.querySelector('.page-loader');
  if (!loader) return;

  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hide'), 180);
  });
}

function initRevealObserver() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 });

  revealEls.forEach((el) => observer.observe(el));
}

function initScrollProgress() {
  const progress = document.querySelector('.scroll-progress');
  if (!progress) return;

  const updateProgress = () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? (scrolled / total) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  };

  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
}

function initHeaderShadow() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const update = () => {
    header.classList.toggle('scrolled', window.scrollY > 12);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initWishlistButtons() {
  document.querySelectorAll('.wish-btn').forEach((button) => {
    button.addEventListener('click', () => {
      button.classList.toggle('active');
      showToast(button.classList.contains('active') ? 'Saved to wishlist' : 'Removed from wishlist');
    });
  });
}

function initCartButtons() {
  const cartToggle = document.getElementById('cartToggle');
  const cartDrawer = document.querySelector('.cart-drawer');
  const overlay = document.querySelector('.overlay-scrim');

  if (!cartToggle || !cartDrawer) return;

  const closeCart = () => {
    cartDrawer.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
  };

  cartToggle.addEventListener('click', () => {
    cartDrawer.classList.add('open');
    if (overlay) overlay.classList.add('show');
  });

  if (overlay) {
    overlay.addEventListener('click', closeCart);
  }

  const closeButtons = document.querySelectorAll('[data-close-cart]');
  closeButtons.forEach((button) => button.addEventListener('click', closeCart));
}

function initModals() {
  const modalOverlay = document.querySelector('.modal-overlay');
  if (!modalOverlay) return;

  const openers = document.querySelectorAll('[data-open-modal]');
  const closers = document.querySelectorAll('[data-close-modal]');

  openers.forEach((opener) => {
    opener.addEventListener('click', () => modalOverlay.classList.add('show'));
  });

  closers.forEach((closer) => {
    closer.addEventListener('click', () => modalOverlay.classList.remove('show'));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initLoader();
  initRevealObserver();
  initScrollProgress();
  initHeaderShadow();
  initWishlistButtons();
  initCartButtons();
  initModals();
});
