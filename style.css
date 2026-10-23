/* --- Base Styles (Apple-style design: system font, materials, restraint) --- */
:root {
    color-scheme: dark light;

    /* Dark (default) */
    --player-theme-color: #0a84ff;
    --player-theme-hover: #409cff;
    --player-background-color: #000000;
    --container-background-color: rgba(44, 44, 46, 0.62);
    --input-background-color: rgba(118, 118, 128, 0.24);
    --text-color: #f5f5f7;
    --text-color-darker: #aeaeb2;
    --border-color: rgba(255, 255, 255, 0.10);
    --switch-off-color: rgba(120, 120, 128, 0.40);
    --recommendation-border-color: #30d158;
    --card-shadow: 0 1px 0 rgba(255, 255, 255, 0.06) inset, 0 12px 40px rgba(0, 0, 0, 0.45);

    --radius-lg: 1.25rem;
    --radius-md: 0.75rem;
    --ease-out: cubic-bezier(0.32, 0.72, 0, 1); /* gentle deceleration, no overshoot */
}

@media (prefers-color-scheme: light) {
    :root {
        --player-theme-color: #007aff;
        --player-theme-hover: #0062cc;
        --player-background-color: #f2f2f7;
        --container-background-color: rgba(255, 255, 255, 0.72);
        --input-background-color: rgba(118, 118, 128, 0.12);
        --text-color: #1d1d1f;
        --text-color-darker: #6e6e73;
        --border-color: rgba(0, 0, 0, 0.08);
        --switch-off-color: rgba(120, 120, 128, 0.32);
        --recommendation-border-color: #248a3d;
        --card-shadow: 0 1px 0 rgba(255, 255, 255, 0.8) inset, 0 8px 30px rgba(0, 0, 0, 0.08);
    }
}

* { -webkit-tap-highlight-color: transparent; }

body {
    background-color: var(--player-background-color);
    background-image:
        radial-gradient(60rem 40rem at 50% -10%, color-mix(in srgb, var(--player-theme-color) 18%, transparent), transparent 70%);
    background-repeat: no-repeat;
    color: var(--text-color);
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
    font-size: 1rem;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    font-optical-sizing: auto;
    margin: 0;
    padding: max(1.25rem, env(safe-area-inset-top)) max(1.25rem, env(safe-area-inset-right)) max(1.25rem, env(safe-area-inset-bottom)) max(1.25rem, env(safe-area-inset-left));
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    box-sizing: border-box;
}

.container {
    width: 100%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

/* --- Material cards (translucent layer, hairline edge, soft depth) --- */
.info-box, .footer-info, .input-area {
    background-color: var(--container-background-color);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    backdrop-filter: blur(24px) saturate(180%);
    box-shadow: 0 0 0 0.5px var(--border-color), var(--card-shadow);
    border-radius: var(--radius-lg);
}

.info-box, .footer-info {
    padding: 1rem 1.25rem;
    font-size: 0.9rem;
    line-height: 1.5;
    letter-spacing: 0.005em; /* small text: slightly positive tracking */
    color: var(--text-color-darker);
}

.info-box strong, .footer-info strong { color: var(--text-color); font-weight: 600; }

.info-box.recommendation {
    background-color: color-mix(in srgb, var(--recommendation-border-color) 12%, var(--container-background-color));
}
.info-box.recommendation strong { color: var(--recommendation-border-color); }

.info-box a { color: var(--player-theme-color); text-decoration: none; }
.info-box a:hover { text-decoration: underline; }

.info-box p, .footer-info p, .footer-info ul, .help ul {
    margin: 0.625rem 0;
}
.footer-info ul, .help ul {
    padding-left: 1.25rem;
    list-style: disc;
}
.footer-info li, .help li {
    margin-bottom: 0.3rem;
}

/* --- Help / supported list (grouped, inset-list feel) --- */
.support-list {
    margin: 0.625rem 0 1rem;
    border-radius: var(--radius-md);
    background-color: var(--input-background-color);
    overflow: hidden;
}
.support-list > div {
    display: grid;
    grid-template-columns: 6.5rem 1fr;
    gap: 0.75rem;
    padding: 0.625rem 0.875rem;
}
.support-list > div + div { box-shadow: 0 -0.5px 0 var(--border-color); }
.support-list dt { color: var(--text-color); font-weight: 600; }
.support-list dd { margin: 0; }

/* --- Input area --- */
.input-area {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.25rem;
}

input[type="url"] {
    background-color: var(--input-background-color);
    color: var(--text-color);
    border: none;
    padding: 0.8rem 1rem;
    border-radius: var(--radius-md);
    font: inherit;
    font-size: 1rem; /* 16px: stops iOS zoom on focus */
    outline: none;
    box-shadow: 0 0 0 0 transparent;
    transition: box-shadow 0.25s var(--ease-out);
}

input[type="url"]:focus {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--player-theme-color) 45%, transparent);
}

input[type="url"]::placeholder {
    color: var(--text-color-darker);
    opacity: 0.8;
}

input[type="file"] {
    color: var(--text-color-darker);
    font: inherit;
    font-size: 0.9rem;
}
input[type="file"]::file-selector-button {
    background-color: var(--input-background-color);
    color: var(--player-theme-color);
    border: none;
    border-radius: 999px;
    padding: 0.45rem 0.95rem;
    margin-right: 0.75rem;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
}

/* Primary button: feedback lands instantly on press, releases with a soft ease */
#load-video-button {
    background-color: var(--player-theme-color);
    color: #ffffff;
    border: none;
    padding: 0.85rem 1.25rem;
    border-radius: 999px;
    font: inherit;
    font-size: 1.0625rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.35s var(--ease-out);
    touch-action: manipulation;
}

#load-video-button:hover { background-color: var(--player-theme-hover); }

#load-video-button:active {
    transform: scale(0.97);
    transition: transform 0.1s ease-out;
}

#load-video-button:focus-visible,
.slider:focus-visible {
    outline: 3px solid color-mix(in srgb, var(--player-theme-color) 55%, transparent);
    outline-offset: 2px;
}

.subtitle-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    color: var(--text-color);
    font-size: 0.95rem;
}

/* iOS-style toggle switch */
.switch { position: relative; display: inline-block; width: 51px; height: 31px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; inset: 0; background-color: var(--switch-off-color); transition: background-color 0.3s var(--ease-out); }
.slider:before {
    position: absolute; content: ""; height: 27px; width: 27px; left: 2px; top: 2px;
    background-color: #ffffff;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15), 0 1px 1px rgba(0, 0, 0, 0.16);
    transition: transform 0.35s var(--ease-out), width 0.2s ease-out;
}
.switch:active .slider:before { width: 33px; }
input:checked + .slider { background-color: #30d158; }
input:checked + .slider:before { transform: translateX(20px); }
input:checked:active + .slider:before { transform: translateX(14px); }
.slider.round { border-radius: 31px; }
.slider.round:before { border-radius: 27px; }

#subtitle-url {
    transition: all 0.3s var(--ease-out);
}

/* --- Player --- */
.player-container {
    width: 100%;
    background-color: #000000;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: 0 0 0 0.5px var(--border-color), 0 20px 60px rgba(0, 0, 0, 0.45);
}

#videoPlayer {
    display: block;
    width: 100%;
    aspect-ratio: 16 / 9;
    border: none;
    --movi-primary-color: var(--player-theme-color);
    --movi-progress-color: var(--player-theme-color);
}

/* --- Accessibility: honor system settings --- */
@media (prefers-reduced-motion: reduce) {
    #load-video-button, .slider, .slider:before, input[type="url"] { transition: opacity 0.2s ease, background-color 0.2s ease; }
    #load-video-button:active { transform: none; opacity: 0.8; }
    .switch:active .slider:before { width: 27px; }
}

@media (prefers-reduced-transparency: reduce) {
    .info-box, .footer-info, .input-area {
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
        background-color: var(--player-background-color);
    }
    .support-list { background-color: var(--container-background-color); }
}

@media (prefers-contrast: more) {
    :root { --border-color: currentColor; }
    .info-box, .footer-info, .input-area { box-shadow: 0 0 0 1px var(--text-color-darker); }
}

@media (max-width: 480px) {
    .support-list > div { grid-template-columns: 1fr; gap: 0.1rem; }
}
