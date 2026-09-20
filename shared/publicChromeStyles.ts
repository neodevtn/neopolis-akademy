/**
 * Source unique des règles visuelles du menu public.
 * Ce CSS est injecté par le composant React et le rendu HTML serveur des
 * formations afin d'éviter toute divergence entre les deux surfaces.
 */
export const PUBLIC_CHROME_STYLES = `
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
  .public-chrome-header { position: sticky; top: 0; z-index: 50; border-bottom: 1px solid rgba(226, 232, 240, .9); background: rgba(255, 255, 255, .95); color: #020617; backdrop-filter: blur(12px); }
  .public-chrome-shell { width: min(1440px, calc(100% - 32px)); min-height: 64px; margin: 0 auto; display: flex; flex-wrap: nowrap; align-items: center; gap: 8px; }
  .public-chrome-brand { display: flex; flex: 0 0 auto; align-items: center; }
  .public-chrome-logo { display: block; width: 120px; height: 42px; flex: 0 0 120px; object-fit: contain; image-rendering: auto; }
  .public-chrome-nav { display: none; min-width: 0; margin-inline: auto; align-items: center; flex-wrap: nowrap; gap: 2px; }
  .public-chrome-menu-group { position: relative; display: inline-flex; flex: 0 0 auto; align-items: center; }
  .public-chrome-nav-link, .public-chrome-menu-trigger { display: inline-flex; align-items: center; justify-content: center; white-space: nowrap; border: 0; border-radius: 6px; padding: 8px 9px; color: #475569; background: transparent; font: inherit; font-size: 12.5px; font-weight: 600; line-height: 1.25; text-decoration: none; cursor: pointer; }
  .public-chrome-menu-trigger { margin-inline-start: -5px; padding-inline: 5px; color: #64748b; list-style: none; }
  .public-chrome-menu-trigger::-webkit-details-marker { display: none; }
  .public-chrome-nav-link:hover, .public-chrome-menu-trigger:hover, .public-chrome-menu-details[open] > .public-chrome-menu-trigger { background: #f1f5f9; color: #0f172a; }
  .public-chrome-nav-link[aria-current="page"] { color: #173b73; background: #eef4fb; }
  .public-chrome-menu-panel { position: absolute; inset-inline-start: 0; top: calc(100% + 8px); z-index: 70; display: grid; width: max-content; min-width: 220px; max-width: min(420px, calc(100vw - 24px)); gap: 2px; padding: 8px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; box-shadow: 0 20px 36px rgba(15, 23, 42, .16); }
  .public-chrome-training-panel { min-width: 344px; }
  .public-chrome-menu-link { display: block; border-radius: 7px; padding: 8px 10px; color: #334155; font-size: 13px; font-weight: 600; line-height: 1.3; text-decoration: none; }
  .public-chrome-menu-link:hover, .public-chrome-menu-link:focus-visible { color: #173b73; background: #f1f5f9; outline: none; }
  .public-chrome-menu-link-emphasis { color: #153e75; background: #eef5ff; }
  .public-chrome-menu-heading { margin: 6px 10px 2px; padding-top: 8px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
  .public-chrome-domain-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2px; }
  .public-chrome-domain-grid .public-chrome-menu-link { font-size: 12px; }
  .public-chrome-search { position: relative; display: inline-flex; flex: 0 1 168px; width: 168px; min-width: 128px; align-items: center; margin-inline: 3px 1px; border: 1px solid #d9e2ef; border-radius: 8px; background: #fff; color: #334155; }
  .public-chrome-search:focus-within { border-color: #6d94c7; box-shadow: 0 0 0 3px rgba(36, 89, 156, .12); }
  .public-chrome-search-icon { position: absolute; inset-inline-start: 9px; pointer-events: none; color: #64748b; }
  .public-chrome-search input { width: 100%; min-width: 0; height: 34px; border: 0; outline: 0; background: transparent; padding: 0 34px 0 30px; color: #172033; font: inherit; font-size: 12px; }
  .public-chrome-search input::placeholder { color: #94a3b8; }
  .public-chrome-search button { position: absolute; inset-inline-end: 3px; display: inline-grid; width: 28px; height: 28px; place-items: center; border: 0; border-radius: 6px; background: #eef4fb; color: #1e4d89; cursor: pointer; }
  .public-chrome-search button:hover { background: #dceafa; }
  .public-chrome-actions, .public-chrome-session-actions { display: flex; flex: 0 0 auto; align-items: center; flex-wrap: nowrap; gap: 6px; margin-inline-start: auto; }
  .public-chrome-language { display: flex; flex: 0 0 auto; align-items: center; gap: 2px; direction: ltr; }
  .public-chrome-language-link { display: inline-flex; align-items: center; border-radius: 6px; padding: 8px 8px; color: #475569; font-size: 11px; font-weight: 700; line-height: 1.25; letter-spacing: .02em; text-decoration: none; }
  .public-chrome-language-link:hover { background: #f8fafc; color: #0f172a; }
  .public-chrome-language-link[aria-current="page"] { background: #f1f5f9; color: #173b73; }
  .public-chrome-apply, .public-chrome-admin-link, .public-chrome-signin, .public-chrome-signout, .public-chrome-session-pending { display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 0; border-radius: 8px; text-decoration: none; font: inherit; white-space: nowrap; }
  .public-chrome-apply { min-height: 38px; padding: 0 13px; background: #0f172a; color: #fff; font-size: 13px; font-weight: 650; }
  .public-chrome-apply:hover { background: #1e293b; box-shadow: 0 4px 12px rgba(15, 23, 42, .16); }
  .public-chrome-admin-link { min-height: 34px; padding: 0 9px; color: #173b73; background: #eef4fb; font-size: 12px; font-weight: 700; }
  .public-chrome-admin-link:hover { background: #dceafa; }
  .public-chrome-signin { min-height: 34px; padding: 0 11px; background: #1e3a6e; color: #fff; font-size: 12px; font-weight: 650; }
  .public-chrome-signin:hover { background: #17335f; box-shadow: 0 4px 12px rgba(30, 58, 110, .18); }
  .public-chrome-signout { min-height: 32px; padding: 0 8px; color: #c2414c; background: #fff; border: 1px solid #fecdd3; font-size: 11px; font-weight: 650; cursor: pointer; }
  .public-chrome-signout:hover { color: #9f1239; background: #fff1f2; }
  .public-chrome-session-pending { min-height: 34px; padding: 0 10px; color: #64748b; background: #f8fafc; font-size: 11px; font-weight: 650; }
  .public-chrome-locale-desktop { display: none; }
  .public-chrome-mobile { position: relative; display: block; }
  .public-chrome-mobile-trigger { display: inline-flex; width: 36px; height: 36px; align-items: center; justify-content: center; border: 0; border-radius: 8px; padding: 0; background: #f1f5f9; color: #334155; cursor: pointer; }
  .public-chrome-mobile-panel { position: absolute; inset-inline-end: 0; top: 44px; z-index: 60; width: min(360px, calc(100vw - 24px)); max-height: min(75vh, 640px); overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; background: #fff; box-shadow: 0 20px 36px rgba(15, 23, 42, .16); }
  .public-chrome-mobile-panel .public-chrome-nav { display: grid; grid-template-columns: 1fr; align-items: stretch; margin: 0; gap: 4px; }
  .public-chrome-mobile-panel .public-chrome-menu-group { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; border-radius: 8px; background: #f8fafc; }
  .public-chrome-mobile-panel .public-chrome-nav-link { justify-content: flex-start; padding: 10px 12px; font-size: 14px; }
  .public-chrome-mobile-panel .public-chrome-menu-trigger { margin: 0; padding: 10px 12px; }
  .public-chrome-mobile-panel .public-chrome-menu-panel { position: static; grid-column: 1 / -1; width: auto; min-width: 0; max-width: none; margin: 0 6px 6px; border-radius: 8px; box-shadow: none; }
  .public-chrome-mobile-panel .public-chrome-training-panel { min-width: 0; }
  .public-chrome-mobile-panel .public-chrome-domain-grid { grid-template-columns: 1fr; }
  .public-chrome-mobile-panel .public-chrome-search { display: inline-flex; flex-basis: auto; width: 100%; margin: 10px 0 2px; }
  .public-chrome-mobile-panel .public-chrome-search input { height: 38px; font-size: 14px; }
  .public-chrome-mobile-panel .public-chrome-apply, .public-chrome-mobile-panel .public-chrome-signin, .public-chrome-mobile-panel .public-chrome-session-pending { width: 100%; margin-top: 8px; min-height: 40px; }
  .public-chrome-session-actions-mobile { display: grid; grid-template-columns: 1fr auto; margin-top: 8px; }
  .public-chrome-session-actions-mobile .public-chrome-apply { width: 100%; margin: 0; }
  .public-chrome-session-actions-mobile .public-chrome-admin-link { grid-column: 1 / -1; width: 100%; min-height: 38px; margin-bottom: 5px; }
  .public-chrome-session-actions-mobile .public-chrome-signout { min-height: 40px; }
  .public-chrome-mobile-panel .public-chrome-language { margin-top: 10px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
  @media (min-width: 640px) { .public-chrome-locale-desktop { display: block; } }
  @media (min-width: 1100px) { .public-chrome-nav { display: flex; } .public-chrome-mobile { display: none; } .public-chrome-actions { margin-inline-start: 0; } }
  @media (max-width: 1099px) and (min-width: 640px) { .public-chrome-actions { margin-inline-start: auto; } }
  @media (max-width: 639px) { .public-chrome-shell { width: min(100% - 24px, 1440px); gap: 8px; } .public-chrome-logo { width: 100px; height: 35px; flex-basis: 100px; } .public-chrome-apply { min-height: 36px; padding: 0 10px; font-size: 12px; } .public-chrome-session-actions:not(.public-chrome-session-actions-mobile) .public-chrome-signout, .public-chrome-session-actions:not(.public-chrome-session-actions-mobile) .public-chrome-admin-link { display: none; } .public-chrome-session-actions:not(.public-chrome-session-actions-mobile) .public-chrome-apply { max-width: 110px; overflow: hidden; text-overflow: ellipsis; } }
`;
