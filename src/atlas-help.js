/**
 * <atlas-help> Web Component
 * In-app metric lookup for the Turner SPO Production Monitor.
 *
 * Usage:
 *   <script type="module" src="./src/atlas-help.js"></script>
 *   <atlas-help></atlas-help>
 *
 * Attributes:
 *   page  — pre-filter to a report page on load, e.g. page="p1"
 *   theme — "light" (default) | "dark"
 */

import { METRICS, PAGES } from './data/metrics.js';

const CSS = `
  :host {
    --atlas-accent:   #1B6CA8;
    --atlas-accent-h: #155a8a;
    --atlas-bg:       #ffffff;
    --atlas-surface:  #f4f6f9;
    --atlas-border:   #dde3ec;
    --atlas-text:     #1a2332;
    --atlas-muted:    #6b7a90;
    --atlas-positive: #1a7a4a;
    --atlas-negative: #b91c1c;
    --atlas-tag-bg:   #e8f0fa;
    --atlas-tag-text: #1B6CA8;
    --atlas-shadow:   0 8px 32px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.08);
    --atlas-radius:   12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: var(--atlas-text);
  }

  :host([theme="dark"]) {
    --atlas-accent:   #4d9fd6;
    --atlas-accent-h: #66b2e0;
    --atlas-bg:       #1e2533;
    --atlas-surface:  #252d3d;
    --atlas-border:   #333d52;
    --atlas-text:     #e8ecf3;
    --atlas-muted:    #8b96a8;
    --atlas-positive: #34d07a;
    --atlas-negative: #f87171;
    --atlas-tag-bg:   #1e3a5f;
    --atlas-tag-text: #4d9fd6;
    --atlas-shadow:   0 8px 32px rgba(0,0,0,0.4);
  }

  /* ── Trigger button ── */
  #trigger {
    position: fixed;
    bottom: 28px;
    right: 28px;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--atlas-accent);
    color: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(27,108,168,0.35);
    transition: background 0.15s, transform 0.15s, box-shadow 0.15s;
    z-index: 9998;
    flex-shrink: 0;
  }
  #trigger:hover {
    background: var(--atlas-accent-h);
    transform: scale(1.07);
    box-shadow: 0 6px 20px rgba(27,108,168,0.45);
  }
  #trigger svg { pointer-events: none; }

  /* ── Panel ── */
  #panel {
    position: fixed;
    bottom: 92px;
    right: 28px;
    width: 420px;
    max-height: calc(100vh - 120px);
    background: var(--atlas-bg);
    border: 1px solid var(--atlas-border);
    border-radius: var(--atlas-radius);
    box-shadow: var(--atlas-shadow);
    display: flex;
    flex-direction: column;
    z-index: 9999;
    overflow: hidden;
    transform-origin: bottom right;
    transition: opacity 0.18s ease, transform 0.18s ease;
  }
  #panel.hidden {
    opacity: 0;
    transform: scale(0.92) translateY(12px);
    pointer-events: none;
  }

  /* ── Panel header ── */
  .panel-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px 18px 12px;
    border-bottom: 1px solid var(--atlas-border);
    flex-shrink: 0;
  }
  .panel-header .logo {
    font-size: 20px;
    line-height: 1;
  }
  .panel-title {
    flex: 1;
    font-weight: 700;
    font-size: 15px;
    color: var(--atlas-text);
  }
  .panel-subtitle {
    font-size: 11px;
    color: var(--atlas-muted);
    font-weight: 400;
  }
  #close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--atlas-muted);
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    transition: color 0.1s, background 0.1s;
  }
  #close-btn:hover { color: var(--atlas-text); background: var(--atlas-surface); }

  /* ── Search ── */
  .search-wrap {
    padding: 12px 18px 8px;
    flex-shrink: 0;
  }
  .search-inner {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--atlas-surface);
    border: 1px solid var(--atlas-border);
    border-radius: 8px;
    padding: 7px 12px;
    transition: border-color 0.15s;
  }
  .search-inner:focus-within { border-color: var(--atlas-accent); }
  .search-inner svg { color: var(--atlas-muted); flex-shrink: 0; }
  #search {
    border: none;
    background: transparent;
    outline: none;
    flex: 1;
    font-size: 14px;
    color: var(--atlas-text);
  }
  #search::placeholder { color: var(--atlas-muted); }
  #clear-search {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--atlas-muted);
    padding: 0;
    display: none;
    align-items: center;
  }
  #clear-search.visible { display: flex; }
  #clear-search:hover { color: var(--atlas-text); }

  /* ── Page filter ── */
  .page-filter {
    display: flex;
    gap: 6px;
    padding: 0 18px 12px;
    overflow-x: auto;
    flex-shrink: 0;
    scrollbar-width: none;
  }
  .page-filter::-webkit-scrollbar { display: none; }
  .page-pill {
    background: var(--atlas-surface);
    border: 1px solid var(--atlas-border);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 500;
    color: var(--atlas-muted);
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.12s;
    flex-shrink: 0;
  }
  .page-pill:hover { border-color: var(--atlas-accent); color: var(--atlas-accent); }
  .page-pill.active {
    background: var(--atlas-accent);
    border-color: var(--atlas-accent);
    color: #fff;
  }

  /* ── Results count ── */
  .results-info {
    padding: 0 18px 6px;
    font-size: 11px;
    color: var(--atlas-muted);
    flex-shrink: 0;
  }

  /* ── Metric list ── */
  #list {
    flex: 1;
    overflow-y: auto;
    padding: 4px 10px 12px;
    scrollbar-width: thin;
    scrollbar-color: var(--atlas-border) transparent;
  }
  #list::-webkit-scrollbar { width: 4px; }
  #list::-webkit-scrollbar-track { background: transparent; }
  #list::-webkit-scrollbar-thumb { background: var(--atlas-border); border-radius: 4px; }

  .section-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--atlas-muted);
    padding: 10px 8px 4px;
  }

  .metric-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.1s;
    border: 1px solid transparent;
  }
  .metric-row:hover { background: var(--atlas-surface); }
  .metric-row.active {
    background: var(--atlas-tag-bg);
    border-color: var(--atlas-accent);
  }
  .metric-row-name {
    flex: 1;
    font-weight: 500;
    font-size: 13.5px;
    color: var(--atlas-text);
  }
  .metric-row-page {
    font-size: 11px;
    color: var(--atlas-muted);
    background: var(--atlas-surface);
    border: 1px solid var(--atlas-border);
    border-radius: 4px;
    padding: 1px 6px;
    white-space: nowrap;
  }
  .metric-row-chevron { color: var(--atlas-muted); flex-shrink: 0; }

  .no-results {
    text-align: center;
    padding: 40px 20px;
    color: var(--atlas-muted);
  }
  .no-results svg { margin-bottom: 12px; opacity: 0.4; }
  .no-results p { margin: 0; font-size: 13px; }

  /* ── Detail view ── */
  #detail {
    display: none;
    flex-direction: column;
    height: 100%;
  }
  #detail.visible { display: flex; }

  .detail-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 18px;
    border-bottom: 1px solid var(--atlas-border);
    flex-shrink: 0;
  }
  #back-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--atlas-accent);
    padding: 4px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 500;
    transition: background 0.1s;
  }
  #back-btn:hover { background: var(--atlas-surface); }

  .detail-name {
    flex: 1;
    font-weight: 700;
    font-size: 15px;
  }

  .detail-body {
    flex: 1;
    overflow-y: auto;
    padding: 18px;
    scrollbar-width: thin;
    scrollbar-color: var(--atlas-border) transparent;
  }
  .detail-body::-webkit-scrollbar { width: 4px; }
  .detail-body::-webkit-scrollbar-thumb { background: var(--atlas-border); border-radius: 4px; }

  .detail-page-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 16px;
  }
  .detail-page-tag {
    font-size: 11px;
    font-weight: 600;
    color: var(--atlas-tag-text);
    background: var(--atlas-tag-bg);
    border-radius: 4px;
    padding: 2px 8px;
  }
  .detail-section-tag {
    font-size: 11px;
    color: var(--atlas-muted);
    background: var(--atlas-surface);
    border: 1px solid var(--atlas-border);
    border-radius: 4px;
    padding: 2px 8px;
  }

  .detail-card {
    background: var(--atlas-surface);
    border: 1px solid var(--atlas-border);
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 10px;
  }
  .detail-card-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--atlas-accent);
    margin-bottom: 7px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .detail-card-body {
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--atlas-text);
    white-space: pre-line;
  }

  .calc-formula {
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
    font-size: 12.5px;
    background: var(--atlas-bg);
    border: 1px solid var(--atlas-border);
    border-radius: 6px;
    padding: 10px 12px;
    margin-top: 8px;
    line-height: 1.7;
    color: var(--atlas-text);
    white-space: pre-wrap;
  }

  .interpret-card {
    border-left: 3px solid var(--atlas-accent);
  }

  /* ── Highlight match ── */
  mark {
    background: rgba(27,108,168,0.15);
    color: inherit;
    border-radius: 2px;
    padding: 0 1px;
  }
`;

const PAGE_LABEL = Object.fromEntries(PAGES.map(p => [p.id, p.label]));

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function highlight(text, query) {
  if (!query) return escapeHtml(text);
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return escapeHtml(text).replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}

function pageShortLabel(pageId) {
  const labels = {
    p1: 'P1', p2: 'P2', p3: 'P3', p4: 'P4', p5: 'P5', p6: 'P6', glossary: 'Glossary',
  };
  return labels[pageId] || pageId;
}

class AtlasHelp extends HTMLElement {
  constructor() {
    super();
    this._open = false;
    this._page = 'all';
    this._query = '';
    this._active = null; // selected metric id
    this._attachShadow();
  }

  static get observedAttributes() { return ['page', 'theme']; }

  attributeChangedCallback(name, _old, val) {
    if (name === 'page' && PAGES.find(p => p.id === val)) {
      this._page = val;
      this._renderList();
      this._updatePills();
    }
  }

  _attachShadow() {
    const shadow = this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = CSS;

    shadow.innerHTML = '';
    shadow.appendChild(style);

    // Trigger button
    const trigger = document.createElement('button');
    trigger.id = 'trigger';
    trigger.setAttribute('aria-label', 'Open metric help');
    trigger.setAttribute('title', 'Metric Help');
    trigger.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    trigger.addEventListener('click', () => this._toggle());
    shadow.appendChild(trigger);

    // Panel
    const panel = document.createElement('div');
    panel.id = 'panel';
    panel.className = 'hidden';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'SPO Metric Help');
    panel.innerHTML = this._panelTemplate();
    shadow.appendChild(panel);

    this._shadow = shadow;
    this._bindEvents();
  }

  _panelTemplate() {
    const pillsHtml = PAGES.map(p =>
      `<button class="page-pill${p.id === this._page ? ' active' : ''}" data-page="${p.id}">${p.label}</button>`
    ).join('');

    return `
      <!-- List view -->
      <div id="list-view">
        <div class="panel-header">
          <span class="logo">🗺️</span>
          <div style="flex:1">
            <div class="panel-title">Atlas Metric Help</div>
            <div class="panel-subtitle">SPO Production Monitor</div>
          </div>
          <button id="close-btn" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="search-wrap">
          <div class="search-inner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input id="search" type="text" placeholder="Search metrics…" autocomplete="off" spellcheck="false" />
            <button id="clear-search" aria-label="Clear search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div class="page-filter">${pillsHtml}</div>
        <div class="results-info" id="results-info"></div>
        <div id="list"></div>
      </div>

      <!-- Detail view -->
      <div id="detail">
        <div class="detail-header">
          <button id="back-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <span class="detail-name" id="detail-name"></span>
        </div>
        <div class="detail-body" id="detail-body"></div>
      </div>
    `;
  }

  _bindEvents() {
    const s = this._shadow;

    s.getElementById('close-btn').addEventListener('click', () => this._toggle(false));
    s.getElementById('back-btn').addEventListener('click', () => this._showList());

    const searchEl = s.getElementById('search');
    searchEl.addEventListener('input', e => {
      this._query = e.target.value.trim();
      s.getElementById('clear-search').classList.toggle('visible', this._query.length > 0);
      this._renderList();
    });

    s.getElementById('clear-search').addEventListener('click', () => {
      searchEl.value = '';
      this._query = '';
      s.getElementById('clear-search').classList.remove('visible');
      this._renderList();
      searchEl.focus();
    });

    s.querySelector('.page-filter').addEventListener('click', e => {
      const pill = e.target.closest('.page-pill');
      if (!pill) return;
      this._page = pill.dataset.page;
      this._updatePills();
      this._renderList();
    });

    s.getElementById('list').addEventListener('click', e => {
      const row = e.target.closest('.metric-row');
      if (!row) return;
      this._showDetail(row.dataset.id);
    });

    // Close on outside click
    document.addEventListener('click', e => {
      if (this._open && !this.contains(e.target) && !e.composedPath().includes(this._shadow.host)) {
        // only close if clicked outside the host element
      }
    });
  }

  _toggle(force) {
    this._open = force !== undefined ? force : !this._open;
    const panel = this._shadow.getElementById('panel');
    panel.classList.toggle('hidden', !this._open);
    if (this._open) {
      this._renderList();
      setTimeout(() => this._shadow.getElementById('search').focus(), 120);
    }
  }

  _updatePills() {
    this._shadow.querySelectorAll('.page-pill').forEach(p => {
      p.classList.toggle('active', p.dataset.page === this._page);
    });
  }

  _filteredMetrics() {
    const q = this._query.toLowerCase();
    return METRICS.filter(m => {
      const pageMatch = this._page === 'all' || m.page.includes(this._page);
      if (!pageMatch) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.meaning.toLowerCase().includes(q) ||
        (m.calculation || '').toLowerCase().includes(q) ||
        (m.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (m.section || '').toLowerCase().includes(q)
      );
    });
  }

  _renderList() {
    const list = this._shadow.getElementById('list');
    const info = this._shadow.getElementById('results-info');
    const metrics = this._filteredMetrics();

    if (metrics.length === 0) {
      list.innerHTML = `
        <div class="no-results">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <p>No metrics found for "<strong>${escapeHtml(this._query)}</strong>"</p>
        </div>`;
      info.textContent = '';
      return;
    }

    info.textContent = `${metrics.length} metric${metrics.length !== 1 ? 's' : ''}`;

    // Group by section
    const sections = {};
    metrics.forEach(m => {
      const sec = m.section || 'Other';
      if (!sections[sec]) sections[sec] = [];
      sections[sec].push(m);
    });

    const q = this._query;
    list.innerHTML = Object.entries(sections).map(([sec, items]) => `
      <div class="section-label">${escapeHtml(sec)}</div>
      ${items.map(m => `
        <div class="metric-row${this._active === m.id ? ' active' : ''}" data-id="${m.id}" role="button" tabindex="0">
          <span class="metric-row-name">${highlight(m.name, q)}</span>
          ${m.page.slice(0, 2).map(p => `<span class="metric-row-page">${pageShortLabel(p)}</span>`).join('')}
          <svg class="metric-row-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      `).join('')}
    `).join('');
  }

  _showDetail(id) {
    const metric = METRICS.find(m => m.id === id);
    if (!metric) return;
    this._active = id;

    const listView = this._shadow.getElementById('list-view');
    const detail = this._shadow.getElementById('detail');

    listView.style.display = 'none';
    detail.classList.add('visible');

    this._shadow.getElementById('detail-name').textContent = metric.name;

    const pageTags = metric.page.map(p =>
      `<span class="detail-page-tag">${PAGE_LABEL[p] || p}</span>`
    ).join('');
    const sectionTag = metric.section
      ? `<span class="detail-section-tag">${escapeHtml(metric.section)}</span>`
      : '';

    const meaningCard = `
      <div class="detail-card">
        <div class="detail-card-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          What it means
        </div>
        <div class="detail-card-body">${escapeHtml(metric.meaning)}</div>
      </div>`;

    const calcCard = metric.calculation ? `
      <div class="detail-card">
        <div class="detail-card-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>
          How it's calculated
        </div>
        <div class="calc-formula">${escapeHtml(metric.calculation)}</div>
      </div>` : '';

    const interpretCard = metric.interpret ? `
      <div class="detail-card interpret-card">
        <div class="detail-card-label">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          How to interpret it
        </div>
        <div class="detail-card-body">${escapeHtml(metric.interpret)}</div>
      </div>` : '';

    this._shadow.getElementById('detail-body').innerHTML = `
      <div class="detail-page-tags">${pageTags}${sectionTag}</div>
      ${meaningCard}
      ${calcCard}
      ${interpretCard}
    `;
  }

  _showList() {
    this._active = null;
    const listView = this._shadow.getElementById('list-view');
    const detail = this._shadow.getElementById('detail');
    listView.style.display = '';
    detail.classList.remove('visible');
    this._renderList();
  }
}

customElements.define('atlas-help', AtlasHelp);
