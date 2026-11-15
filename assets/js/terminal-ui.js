/**
 * Terminal UI
 * - Retro theme picker in the status line, remembered in localStorage
 * - Keyboard shortcuts, with a help dialog on "?"
 *
 * Theme colours live in assets/css/themes.css; keep THEMES in sync with it.
 * The <head> of _layouts/default.html applies the saved theme before first paint.
 */
(function () {
  'use strict';

  var THEME_KEY = 'j47-theme';
  var CRT_KEY = 'j47-crt';

  var THEMES = [
    { id: 'auto',   desc: 'follow your OS (green / paper)' },
    { id: 'green',  desc: 'P1 phosphor, IBM 5151' },
    { id: 'amber',  desc: 'P3 phosphor, amber EGA clones' },
    { id: 'white',  desc: 'P4 phosphor, DEC VT100 / Rainbow' },
    { id: 'plasma', desc: 'gas plasma, Compaq Portable III' },
    { id: 'dos',    desc: 'VGA text mode, blue editors' },
    { id: 'lcd',    desc: 'reflective LCD, IBM PC Convertible' },
    { id: 'paper',  desc: 'line-printer paper (light)' }
  ];

  var root = document.documentElement;
  var darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ---------- storage (may be unavailable: private mode, blocked cookies) ----------
  function load(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function save(key, value) {
    try {
      if (value === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, value);
    } catch (e) { /* ignore */ }
  }

  // ---------- elements ----------
  var statusbar = document.querySelector('.statusbar');
  if (!statusbar) return;
  var themeButton = statusbar.querySelector('[data-action="theme"]');
  var themeName = statusbar.querySelector('.statusbar__theme-name');
  var helpButton = statusbar.querySelector('[data-action="help"]');
  var msg = statusbar.querySelector('.statusbar__msg');
  var menu = document.getElementById('theme-menu');
  var help = document.getElementById('help');
  var helpList = document.getElementById('help-list');

  // ---------- themes ----------
  function currentTheme() {
    return root.getAttribute('data-theme') || 'auto';
  }

  function effectiveTheme() {
    var t = currentTheme();
    if (t !== 'auto') return t;
    return darkQuery.matches ? 'green' : 'paper';
  }

  function applyTheme(id) {
    if (id === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', id);
    // "(green)" is its own span so a narrow status line can drop it
    themeName.innerHTML = id === 'auto'
      ? 'auto<span class="statusbar__theme-auto"> (' + effectiveTheme() + ')</span>'
      : id;
    queueFit(); // new font and label, new widths
  }

  function chooseTheme(id) {
    applyTheme(id);
    save(THEME_KEY, id === 'auto' ? null : id);
    flash('theme: ' + themeName.textContent);
    renderMenu();
  }

  function cycleTheme(step) {
    // cycle through the named themes (auto is reachable with 0 or the menu)
    var named = THEMES.slice(1);
    var i = named.findIndex(function (t) { return t.id === effectiveTheme(); });
    var next = named[(i + step + named.length) % named.length];
    chooseTheme(next.id);
  }

  darkQuery.addEventListener('change', function () { applyTheme(currentTheme()); });

  // ---------- status line message (tmux-style) ----------
  var flashTimer;
  function flash(text) {
    msg.textContent = text;
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { msg.textContent = ''; }, 2000);
  }

  // ---------- theme menu ----------
  var menuOptions = [];
  var themeBeforePreview = null;

  function buildMenu() {
    var list = menu.querySelector('.theme-menu__list');
    THEMES.forEach(function (t, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'theme-menu__option';
      b.setAttribute('role', 'option');
      b.dataset.theme = t.id;
      b.innerHTML =
        '<span class="theme-menu__mark" aria-hidden="true"></span>' +
        '<span class="theme-menu__key">' + i + '</span>' +
        '<span class="theme-menu__name">' + t.id + '</span>' +
        '<span class="theme-menu__desc">' + t.desc + '</span>';
      b.addEventListener('focus', function () { applyTheme(t.id); }); // live preview
      b.addEventListener('mouseenter', function () { b.focus(); });
      b.addEventListener('click', function () {
        themeBeforePreview = null;
        chooseTheme(t.id);
        closeMenu();
      });
      list.appendChild(b);
      menuOptions.push(b);
    });
  }

  function renderMenu() {
    var active = themeBeforePreview || currentTheme();
    menuOptions.forEach(function (b) {
      var on = b.dataset.theme === active;
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.querySelector('.theme-menu__mark').textContent = on ? '►' : '';
    });
  }

  function isMenuOpen() { return !menu.hidden; }

  function openMenu() {
    themeBeforePreview = currentTheme();
    renderMenu();
    menu.hidden = false;
    themeButton.setAttribute('aria-expanded', 'true');
    var active = menuOptions.find(function (b) { return b.dataset.theme === themeBeforePreview; });
    (active || menuOptions[0]).focus();
  }

  function closeMenu() {
    if (themeBeforePreview !== null) {
      applyTheme(themeBeforePreview); // cancelled: undo the preview
      themeBeforePreview = null;
    }
    menu.hidden = true;
    themeButton.setAttribute('aria-expanded', 'false');
    renderMenu();
    themeButton.focus();
  }

  themeButton.addEventListener('click', function () {
    if (isMenuOpen()) closeMenu(); else openMenu();
  });

  menu.addEventListener('keydown', function (e) {
    var i = menuOptions.indexOf(document.activeElement);
    var handled = true;
    if (e.key === 'ArrowDown') menuOptions[(i + 1) % menuOptions.length].focus();
    else if (e.key === 'ArrowUp') menuOptions[(i - 1 + menuOptions.length) % menuOptions.length].focus();
    else if (e.key === 'Home') menuOptions[0].focus();
    else if (e.key === 'End') menuOptions[menuOptions.length - 1].focus();
    else if (e.key === 'Escape') closeMenu();
    else if (e.key === 'Tab') closeMenu();
    else if (/^[0-9]$/.test(e.key) && menuOptions[+e.key]) menuOptions[+e.key].click();
    else handled = false;
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  });

  document.addEventListener('pointerdown', function (e) {
    if (isMenuOpen() && !statusbar.contains(e.target)) closeMenu();
  });

  // ---------- help dialog ----------
  var socialLinks = {};

  // Links come from the key bar (_data/social.yml); each carries its own key
  function collectSocialLinks() {
    statusbar.querySelectorAll('.keybar a[data-key]').forEach(function (a) {
      var key = a.dataset.key;
      if (key && !socialLinks[key]) {
        var label = a.querySelector('.keybar__label');
        socialLinks[key] = { label: (label ? label.textContent : key).trim().toLowerCase(), href: a.href };
      }
    });
  }

  // Keep the page's bottom padding equal to the footer's real height
  function syncFooterHeight() {
    root.style.setProperty('--statusbar-height', statusbar.offsetHeight + 'px');
  }

  // Keep the status line on one row: step through the compact levels in
  // terminal-ui.css ("ONE-ROW FIT") until nothing overflows. Widths depend
  // on the theme's font, so this re-runs on resize, theme change and font load.
  var statusLine = statusbar.querySelector('.statusbar__line');
  var MAX_FIT = 3;
  function fitStatusLine() {
    if (!statusLine) return;
    for (var level = 0; level <= MAX_FIT; level++) {
      statusbar.dataset.fit = level;
      if (statusLine.scrollWidth <= statusLine.clientWidth) break;
    }
  }

  var fitQueued = false;
  function queueFit() {
    if (fitQueued) return;
    fitQueued = true;
    requestAnimationFrame(function () { fitQueued = false; fitStatusLine(); });
  }

  function buildHelp() {
    var rows = [
      ['?', 'show / hide this help'],
      ['t / T', 'next / previous theme'],
      ['0–7', 'pick a theme (0 = auto)'],
      ['r', 'reboot (replay power-on)'],
      ['s', 'screen effects on / off'],
      ['j / k', 'scroll down / up']
    ];
    var html = rows.map(row).join('');
    var keys = Object.keys(socialLinks);
    if (keys.length) {
      html += '<div class="help__section">-- open --</div>';
      html += keys.map(function (k) { return row([k, socialLinks[k].label]); }).join('');
    }
    html += row(['esc', 'close']);
    helpList.innerHTML = html;

    function row(r) { return '<dt><kbd>' + r[0] + '</kbd></dt><dd>' + r[1] + '</dd>'; }
  }

  function toggleHelp() {
    if (help.open) help.close();
    else help.showModal();
  }

  helpButton.addEventListener('click', toggleHelp);
  help.addEventListener('click', function (e) {
    if (e.target === help || e.target.closest('[data-action="close-help"]')) help.close();
  });

  // ---------- other actions ----------
  function reboot() {
    if (reducedMotion.matches) return;
    document.getAnimations().forEach(function (a) {
      if (a.animationName && a.animationName.indexOf('crt-poweron') === 0) {
        a.cancel();
        a.play();
      }
    });
  }

  function toggleCrt() {
    var off = root.classList.toggle('no-crt');
    save(CRT_KEY, off ? 'off' : null);
    flash('screen effects: ' + (off ? 'off' : 'on'));
  }

  function openLink(link) {
    if (link.href.indexOf('mailto:') === 0) window.location.href = link.href;
    else window.open(link.href, '_blank', 'noopener');
  }

  // ---------- keyboard ----------
  document.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (isMenuOpen()) return;

    var k = e.key;
    if (help.open && k !== '?') return; // dialog handles esc itself

    if (k === '?') toggleHelp();
    else if (k === 't') cycleTheme(1);
    else if (k === 'T') cycleTheme(-1);
    else if (/^[0-7]$/.test(k)) chooseTheme(THEMES[+k].id);
    else if (k === 'r') reboot();
    else if (k === 's') toggleCrt();
    else if (k === 'j') window.scrollBy({ top: 80 });
    else if (k === 'k') window.scrollBy({ top: -80 });
    else if (socialLinks[k]) openLink(socialLinks[k]);
    else return;

    e.preventDefault();
  });

  // ---------- init ----------
  collectSocialLinks();
  fitStatusLine();
  syncFooterHeight();
  if (window.ResizeObserver) new ResizeObserver(syncFooterHeight).observe(statusbar);
  window.addEventListener('resize', queueFit);
  if (document.fonts) {
    document.fonts.addEventListener('loadingdone', queueFit);
    document.fonts.ready.then(queueFit);
  }
  buildMenu();
  buildHelp();
  applyTheme(currentTheme());
  renderMenu();
})();
