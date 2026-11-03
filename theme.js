/* Theme controller: system is live, explicit choices persist. */
(() => {
  'use strict';
  const root = document.documentElement;
  const systemPreference = window.matchMedia('(prefers-color-scheme: light)');
  const choices = ['system', 'light', 'dark'];
  const colorMeta = document.querySelector('#themeColorMeta');
  const schemeMeta = document.querySelector('#colorSchemeMeta');
  const darkMeta = document.querySelector('#themeColorDark');
  const lightMeta = document.querySelector('#themeColorLight');
  const controls = () => Array.from(document.querySelectorAll('[data-theme-choice]'));
  let preference = choices.includes(root.dataset.themePreference) ? root.dataset.themePreference : 'system';

  const resolveTheme = () => preference === 'system'
    ? (systemPreference.matches ? 'light' : 'dark')
    : preference;

  function updateMeta(theme) {
    const color = theme === 'light' ? '#f2f2f5' : '#000000';
    if (colorMeta) colorMeta.content = color;
    if (schemeMeta) schemeMeta.content = theme;
    if (darkMeta) darkMeta.content = '#000000';
    if (lightMeta) lightMeta.content = '#f2f2f5';
  }

  function paint(theme, animate = true) {
    if (animate) {
      root.classList.add('theme-switching');
      requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('theme-switching')));
    }
    root.dataset.theme = theme;
    root.dataset.themePreference = preference;
    const appearanceIcon = document.querySelector('.theme-menu-label i');
    if (appearanceIcon) appearanceIcon.className = theme === 'light' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    updateMeta(theme);
    controls().forEach(button => {
      const selected = button.dataset.themeChoice === preference;
      button.setAttribute('aria-checked', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  }

  function choose(choice) {
    if (!choices.includes(choice)) return;
    preference = choice;
    try { localStorage.setItem('theme', choice); } catch (_) { /* Storage may be blocked. */ }
    paint(resolveTheme());
  }

  controls().forEach(button => button.addEventListener('click', () => choose(button.dataset.themeChoice)));
  const group = document.querySelector('.theme-segment');
  if (group) {
    group.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const buttons = controls();
      let index = buttons.indexOf(document.activeElement);
      if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = buttons.length - 1;
      else index = (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      buttons[index].focus();
      choose(buttons[index].dataset.themeChoice);
    });
  }

  const onSystemChange = () => {
    if (preference === 'system') paint(resolveTheme());
  };
  if (systemPreference.addEventListener) systemPreference.addEventListener('change', onSystemChange);
  else if (systemPreference.addListener) systemPreference.addListener(onSystemChange);
  paint(resolveTheme(), false);
})();
