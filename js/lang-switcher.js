/**
 * Dropdown behaviour for .lang-switcher (navbar + static markup).
 */
(function () {
  'use strict';

  function closeSwitcher(root) {
    const trigger = root.querySelector('.lang-switcher__trigger');
    const menu = root.querySelector('.lang-switcher__menu');
    if (!trigger || !menu) return;
    root.classList.remove('lang-switcher--open');
    trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
  }

  function openSwitcher(root) {
    const trigger = root.querySelector('.lang-switcher__trigger');
    const menu = root.querySelector('.lang-switcher__menu');
    if (!trigger || !menu) return;
    document.querySelectorAll('.lang-switcher--open').forEach((el) => {
      if (el !== root) closeSwitcher(el);
    });
    root.classList.add('lang-switcher--open');
    trigger.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
  }

  function initLangSwitcher(root) {
    if (root.dataset.langSwitcherInit === 'true') return;
    const trigger = root.querySelector('.lang-switcher__trigger');
    const menu = root.querySelector('.lang-switcher__menu');
    if (!trigger || !menu) return;

    root.dataset.langSwitcherInit = 'true';

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (root.classList.contains('lang-switcher--open')) closeSwitcher(root);
      else openSwitcher(root);
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSwitcher(root);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!root.classList.contains('lang-switcher--open')) openSwitcher(root);
        menu.querySelector('.lang-switcher__option')?.focus();
      }
    });

    menu.querySelectorAll('.lang-switcher__option').forEach((link) => {
      link.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeSwitcher(root);
          trigger.focus();
        }
      });
    });
  }

  function initAll() {
    document.querySelectorAll('.lang-switcher').forEach(initLangSwitcher);
  }

  document.addEventListener('click', (e) => {
    document.querySelectorAll('.lang-switcher--open').forEach((root) => {
      if (!root.contains(e.target)) closeSwitcher(root);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.lang-switcher--open').forEach(closeSwitcher);
    }
  });

  function observeNavbar() {
    const placeholder = document.getElementById('navbar-placeholder');
    if (!placeholder) return;
    const obs = new MutationObserver(() => initAll());
    obs.observe(placeholder, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initAll();
      observeNavbar();
    });
  } else {
    initAll();
    observeNavbar();
  }
})();
