
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Cross-function references (module-scoped, not on window) so
     things like the global Escape-key handler can close panels
     that are wired up inside other functions further down. */
  let closeCartRef = null;
  let openCartRef = null;
  let closeSearchRef = null;
  let closeExitRef = null;
  let quickViewTrap = null;
  let checkoutTrap = null;
  let confirmTrap = null;
  let mobileNavTrap = null;
  let adminDetailTrap = null;

  function formatNaira(n) {
    return "₦" + Math.max(0, Math.round(n)).toLocaleString("en-US");
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function debounce(fn, wait) {
    let t;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
  function showToast(msg) {
    const toast = $("#toast");
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2600);
  }
  /* ---------------------------------------------------
     OVERLAY COLLISION GUARD
     Welcome/exit popups fire on a timer with no awareness
     of what else is on screen. Without this, one can pop up
     over an already-open cart/checkout/search/quick-view and
     silently swallow the user's next click (it sits at a
     higher z-index than the drawer/modal underneath it).
  --------------------------------------------------- */
  function isAnyOverlayOpen() {
    if (location.hash === "#admin") return true;
    const chatPanel = document.getElementById("chatPanel");
    if (chatPanel && !chatPanel.hidden) return true;
    return ["cartDrawer", "searchOverlay", "quickViewModal", "checkoutModal", "confirmModal", "mobileNav", "exitModal", "welcomeModal", "adminDetail", "adminConfirmDelete"].some((id) => {
      const el = document.getElementById(id);
      return el && (el.classList.contains("open") || el.classList.contains("show"));
    });
  }

  function initImageLoaders(root) {
    $$("img", root).forEach((img) => {
      const mark = () => img.parentElement && img.parentElement.classList.add("img-loaded");
      if (img.complete && img.naturalWidth > 0) mark();
      else {
        img.addEventListener("load", mark, { once: true });
        img.addEventListener("error", mark, { once: true });
      }
    });
  }

  /* ---------------------------------------------------
     FOCUS TRAP
     Keeps keyboard focus inside an open modal/drawer/overlay
     (Tab cycles within it, Shift+Tab too) and restores focus to
     whatever opened it once it closes. Needed because
     aria-modal="true" alone doesn't guarantee this in every
     browser/screen-reader combination.
  --------------------------------------------------- */
  const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  function createFocusTrap(container) {
    let lastFocused = null;
    function getFocusable() {
      return $$(FOCUSABLE_SELECTOR, container).filter((el) => el.offsetParent !== null);
    }
    function handleKeydown(e) {
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    return {
      activate() {
        lastFocused = document.activeElement;
        container.addEventListener("keydown", handleKeydown);
        const focusable = getFocusable();
        if (focusable.length) focusable[0].focus();
      },
      deactivate() {
        container.removeEventListener("keydown", handleKeydown);
        if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
        lastFocused = null;
      }
    };
      }
