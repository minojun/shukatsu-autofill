// shared/theme.js — ライト/ダークモードの共通切り替え（popup・設定ページ共用）
(function () {
  const KEY = 'theme';
  const root = document.documentElement;

  const systemDark = () =>
    !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  function syncButtons(theme) {
    document.querySelectorAll('.theme-toggle').forEach((b) => {
      b.textContent = theme === 'dark' ? '☀️' : '🌙';
      b.title = theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え';
      b.setAttribute('aria-label', b.title);
    });
  }

  function apply(theme) {
    root.dataset.theme = theme;
    syncButtons(theme);
  }

  // チラつき防止：パース時点でまず推定テーマを当てる（ボタンはまだ無くてOK）
  root.dataset.theme = systemDark() ? 'dark' : 'light';

  function init() {
    chrome.storage.local.get(KEY, (data) => {
      apply(data[KEY] || (systemDark() ? 'dark' : 'light'));
    });
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.theme-toggle')) return;
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(next);
      chrome.storage.local.set({ [KEY]: next });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
