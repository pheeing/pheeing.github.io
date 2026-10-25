/* 다크모드: 시스템 설정을 기본값으로 사용. 클릭 시 localStorage에 명시적으로 저장 */
(() => {
  const button = document.querySelector('[data-theme-toggle]');
  if (!button) return;
  const sync = () => {
    const dark = document.documentElement.classList.contains('dark');
    button.setAttribute('aria-pressed', String(dark));
    const icon = button.querySelector('[data-theme-icon]');
    if (icon) icon.textContent = dark ? '☀' : '☾';
  };
  button.addEventListener('click', () => {
    const dark = document.documentElement.classList.toggle('dark');
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (_) {}
    sync();
  });
  sync();
})();
