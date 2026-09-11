/**
 * Source unique des règles visuelles du menu public.
 * Ce CSS est injecté par le composant React et le rendu HTML serveur des
 * formations afin d'éviter toute divergence entre les deux surfaces.
 */
export const PUBLIC_CHROME_STYLES = `
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
  .public-chrome-header {
    position: sticky;
    top: 0;
    z-index: 50;
    border-bottom: 1px solid rgba(226, 232, 240, .9);
    background: rgba(255, 255, 255, .95);
    color: #020617;
    backdrop-filter: blur(12px);
  }
  .public-chrome-shell {
    width: min(1440px, calc(100% - 32px));
    min-height: 64px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .public-chrome-brand { display: flex; flex: 0 0 auto; align-items: center; }
  .public-chrome-logo { display: block; width: 120px; height: 42px; flex: 0 0 120px; object-fit: contain; image-rendering: auto; }
  .public-chrome-nav { display: none; min-width: 0; margin-inline: auto; align-items: center; gap: 2px; }
  .public-chrome-nav-link {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    border-radius: 6px;
    padding: 8px 12px;
    color: #475569;
    font-size: 12.5px;
    font-weight: 500;
    line-height: 1.25;
    text-decoration: none;
  }
  .public-chrome-nav-link:hover { background: #f8fafc; color: #0f172a; }
  .public-chrome-nav-link[aria-current="page"] { background: transparent; color: #475569; }
  .public-chrome-signin {
    display: inline-flex;
    align-items: center;
    margin-inline-start: 4px;
    border-radius: 999px;
    padding: 6px 14px;
    background: #1e3a6e;
    color: #fff;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.25;
    text-decoration: none;
  }
  .public-chrome-signin:hover { background: #17335f; box-shadow: 0 4px 12px rgba(30, 58, 110, .18); }
  .public-chrome-search { position: relative; display: inline-flex; flex: 0 0 184px; width: 184px; min-width: 0; align-items: center; margin-inline: 6px 2px; border: 1px solid #d9e2ef; border-radius: 8px; background: #fff; color: #334155; }
  .public-chrome-search:focus-within { border-color: #6d94c7; box-shadow: 0 0 0 3px rgba(36, 89, 156, .12); }
  .public-chrome-search-icon { position: absolute; inset-inline-start: 9px; pointer-events: none; color: #64748b; }
  .public-chrome-search input { width: 100%; min-width: 0; height: 34px; border: 0; outline: 0; background: transparent; padding: 0 34px 0 30px; color: #172033; font: inherit; font-size: 12px; }
  .public-chrome-search input::placeholder { color: #94a3b8; }
  .public-chrome-search button { position: absolute; inset-inline-end: 3px; display: inline-grid; width: 28px; height: 28px; place-items: center; border: 0; border-radius: 6px; background: #eef4fb; color: #1e4d89; cursor: pointer; }
  .public-chrome-search button:hover { background: #dceafa; }
  .public-chrome-actions { display: flex; flex: 0 0 auto; align-items: center; gap: 8px; margin-inline-start: auto; }
  .public-chrome-language { display: flex; flex: 0 0 auto; align-items: center; gap: 2px; direction: ltr; }
  .public-chrome-language-link {
    display: inline-flex;
    align-items: center;
    border-radius: 6px;
    padding: 8px 10px;
    color: #475569;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: .02em;
    text-decoration: none;
  }
  .public-chrome-language-link:hover { background: #f8fafc; color: #0f172a; }
  .public-chrome-language-link[aria-current="page"] { background: #f1f5f9; color: #173b73; }
  .public-chrome-apply {
    display: inline-flex;
    min-height: 40px;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border-radius: 8px;
    padding: 0 16px;
    background: #0f172a;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    line-height: 1.25;
    text-decoration: none;
  }
  .public-chrome-apply:hover { background: #1e293b; box-shadow: 0 4px 12px rgba(15, 23, 42, .16); }
  .public-chrome-apply-chevron { font-size: 16px; line-height: 1; }
  .public-chrome-locale-desktop { display: none; }
  .public-chrome-mobile { position: relative; display: block; }
  .public-chrome-mobile-trigger,
  .public-chrome-mobile summary {
    display: inline-flex;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    border: 0;
    border-radius: 8px;
    padding: 0;
    background: #f1f5f9;
    color: #334155;
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    list-style: none;
  }
  .public-chrome-mobile summary::-webkit-details-marker { display: none; }
  .public-chrome-mobile-panel {
    position: absolute;
    inset-inline-end: 0;
    top: 44px;
    z-index: 60;
    width: min(352px, calc(100vw - 24px));
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px;
    background: #fff;
    box-shadow: 0 20px 36px rgba(15, 23, 42, .16);
  }
  .public-chrome-mobile-panel .public-chrome-nav { display: flex; flex-direction: column; align-items: stretch; margin: 0; gap: 4px; }
  .public-chrome-mobile-panel .public-chrome-nav-link { justify-content: flex-start; padding: 9px 12px; font-size: 14px; }
  .public-chrome-mobile-panel .public-chrome-search { flex-basis: auto; width: 100%; margin: 4px 0 8px; }
  .public-chrome-mobile-panel .public-chrome-search input { height: 38px; font-size: 14px; }
  .public-chrome-mobile-panel .public-chrome-signin,
  .public-chrome-mobile-panel .public-chrome-apply { justify-content: center; margin: 8px 0 0; min-height: 40px; }
  .public-chrome-mobile-panel .public-chrome-language { margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  @media (min-width: 640px) {
    .public-chrome-locale-desktop { display: block; }
  }
  @media (min-width: 1024px) {
    .public-chrome-nav { display: flex; }
    .public-chrome-mobile { display: none; }
    .public-chrome-actions { margin-inline-start: 0; }
  }
  @media (max-width: 1360px) and (min-width: 1024px) {
    .public-chrome-nav-link:nth-child(-n+3) { display: none; }
    .public-chrome-search { flex-basis: 170px; width: 170px; }
  }
  @media (max-width: 639px) {
    .public-chrome-shell { width: min(100% - 24px, 1440px); gap: 8px; }
    .public-chrome-logo { width: 100px; height: 35px; flex-basis: 100px; }
    .public-chrome-apply { min-height: 36px; padding: 0 11px; font-size: 12px; }
  }
`;
