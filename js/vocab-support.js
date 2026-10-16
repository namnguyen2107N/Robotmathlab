/**
 * ROBOT MATH LAB - VOCABULARY SUPPORT SYSTEM
 * Interactive English-Vietnamese dictionary for bilingual elementary STEM learning.
 * Features:
 * - In-text interactive vocabulary chips with tooltip popovers
 * - Phonetic guide & native browser speech synthesis pronunciation
 * - Mini Dictionary drawer with real-time search
 * - Automatic logging of vocabulary interactions to LogEngine
 */

class VocabSupport {
  constructor() {
    this.vocabData = {};
    this.isLoaded = false;
    this.activePopover = null;
<<<<<<< HEAD
    this.activePopoverTarget = null;
    this.activeDictionaryCategory = 'all';
    this.dictionaryQuery = '';
    this.previousFocus = null;
    this.previousBodyOverflow = '';
    this.wordCategories = {
      measurement: new Set(['speed', 'distance', 'time', 'second', 'meter', 'kilometer', 'minute']),
      robotics: new Set(['robot', 'move', 'travel', 'reach', 'destination', 'run', 'target'])
    };
    this.setupGlobalEvents();
=======
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
    this.init();
  }

  async init() {
    try {
      const response = await fetch('data/vocab.json');
<<<<<<< HEAD
      if (!response.ok) throw new Error(`Vocabulary request failed (${response.status})`);
      const vocabData = await response.json();
      if (!vocabData || typeof vocabData !== 'object' || Array.isArray(vocabData)) {
        throw new Error('Vocabulary data has an invalid format');
      }
      this.vocabData = vocabData;
      this.isLoaded = true;
=======
      if (response.ok) {
        this.vocabData = await response.json();
        this.isLoaded = true;
      }
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
    } catch (e) {
      console.warn('Could not load data/vocab.json, using fallback vocab:', e);
      this.vocabData = this.getFallbackVocab();
      this.isLoaded = true;
    }

<<<<<<< HEAD
    const modal = document.getElementById('vocab-dict-modal');
    if (modal?.classList.contains('active')) this.renderDictList(this.dictionaryQuery);
=======
    this.setupGlobalEvents();
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
  }

  getFallbackVocab() {
    return {
      "speed": { "vi": "vận tốc", "explain": "Quãng đường đi được trong một đơn vị thời gian", "phonetic": "/spiːd/" },
      "distance": { "vi": "quãng đường", "explain": "Độ dài đoạn đường từ điểm này đến điểm kia", "phonetic": "/ˈdɪstəns/" },
      "time": { "vi": "thời gian", "explain": "Khoảng thời gian để hoàn thành một hành động", "phonetic": "/taɪm/" },
      "destination": { "vi": "đích đến", "explain": "Nơi mà robot cần đến", "phonetic": "/ˌdestɪˈneɪʃn/" },
      "robot": { "vi": "rô-bốt", "explain": "Máy móc có thể thực hiện lệnh tự động", "phonetic": "/ˈroʊbɑːt/" },
      "move": { "vi": "di chuyển", "explain": "Thay đổi vị trí từ chỗ này sang chỗ khác", "phonetic": "/muːv/" },
      "travel": { "vi": "đi / di chuyển", "explain": "Di chuyển từ nơi này đến nơi khác", "phonetic": "/ˈtrævl/" },
      "reach": { "vi": "đến / tới", "explain": "Đi đến được một vị trí nào đó", "phonetic": "/riːtʃ/" },
      "second": { "vi": "giây", "explain": "Đơn vị đo thời gian (1 phút = 60 giây)", "phonetic": "/ˈsekənd/" },
      "meter": { "vi": "mét", "explain": "Đơn vị đo chiều dài", "phonetic": "/ˈmiːtər/" },
      "formula": { "vi": "công thức", "explain": "Quy tắc tính toán bằng ký hiệu toán học", "phonetic": "/ˈfɔːrmjələ/" },
      "calculate": { "vi": "tính toán", "explain": "Dùng phép tính để tìm ra kết quả", "phonetic": "/ˈkælkjuleɪt/" },
      "result": { "vi": "kết quả", "explain": "Đáp án / số liệu thu được sau khi tính", "phonetic": "/rɪˈzʌlt/" },
      "check": { "vi": "kiểm tra", "explain": "Xem xét lại xem đúng hay sai", "phonetic": "/tʃek/" },
      "change": { "vi": "thay đổi", "explain": "Làm cho khác đi so với ban đầu", "phonetic": "/tʃeɪndʒ/" },
      "plan": { "vi": "kế hoạch", "explain": "Dự kiến những bước cần làm trước khi thực hiện", "phonetic": "/plæn/" },
      "problem": { "vi": "bài toán / vấn đề", "explain": "Câu hỏi cần giải quyết", "phonetic": "/ˈprɑːbləm/" },
      "solve": { "vi": "giải", "explain": "Tìm ra đáp án cho bài toán", "phonetic": "/sɑːlv/" },
      "target": { "vi": "mục tiêu", "explain": "Điều cần đạt được", "phonetic": "/ˈtɑːrɡɪt/" },
      "actual": { "vi": "thực tế", "explain": "Kết quả xảy ra trên thực tế", "phonetic": "/ˈæktʃuəl/" },
      "required": { "vi": "yêu cầu", "explain": "Điều cần phải đạt được", "phonetic": "/rɪˈkwaɪərd/" },
      "run": { "vi": "chạy", "explain": "Cho robot bắt đầu di chuyển", "phonetic": "/rʌn/" },
      "condition": { "vi": "điều kiện", "explain": "Thông tin hoặc yêu cầu đã cho", "phonetic": "/kənˈdɪʃn/" },
      "different": { "vi": "khác nhau", "explain": "Không giống nhau", "phonetic": "/ˈdɪfrənt/" }
    };
  }

  /**
   * Replaces bracketed words like [speed] or [distance] with interactive markup
   */
  decorateText(text) {
    if (!text) return '';
<<<<<<< HEAD
    const escapeHtml = (value) => String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
    const isVi = window.I18N ? window.I18N.isVietnamese() : false;
    return text.replace(/\[([a-zA-Z\s]+)\]\*?/g, (match, word) => {
      const key = word.trim().toLowerCase();
      const label = isVi ? `Nhấn để xem nghĩa tiếng Việt của ${word}` : `View the Vietnamese meaning of ${word}`;
      return `<span class="vocab-term" data-vocab-word="${escapeHtml(key)}" tabindex="0" role="button" aria-haspopup="dialog" aria-expanded="false" title="${escapeHtml(label)}">${escapeHtml(word)}</span>`;
=======
    return text.replace(/\[([a-zA-Z\s]+)\]\*?/g, (match, word) => {
      const key = word.trim().toLowerCase();
      const hasDef = this.vocabData[key];
      return `<span class="vocab-term" data-vocab-word="${key}" tabindex="0" role="button" aria-haspopup="dialog" title="Nhấn để xem nghĩa Tiếng Việt của '${word}'">${word}</span>`;
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
    });
  }

  setupGlobalEvents() {
    // Delegated click on vocab terms
    document.addEventListener('click', (e) => {
      const termEl = e.target.closest('.vocab-term');
      if (termEl) {
        e.stopPropagation();
        const wordKey = termEl.getAttribute('data-vocab-word');
        this.showTooltip(termEl, wordKey);
        return;
      }

      // Close popover on outside click
      if (this.activePopover && !e.target.closest('.vocab-popover')) {
        this.closePopover();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
<<<<<<< HEAD
      const vocabTerm = e.target.closest?.('.vocab-term');
      if (vocabTerm && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        this.showTooltip(vocabTerm, vocabTerm.getAttribute('data-vocab-word'));
        return;
      }
=======
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
      if (e.key === 'Escape') {
        this.closePopover();
        this.closeDictionaryModal();
      }
    });
  }

  showTooltip(targetEl, wordKey) {
    if (window.SoundFX) window.SoundFX.playPop();
    this.closePopover();

    const data = this.vocabData[wordKey] || {
      vi: wordKey,
      explain: "Từ vựng chuyên môn",
      phonetic: ""
    };
<<<<<<< HEAD
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
    const t = (key) => window.I18N ? window.I18N.t(key) : key;
=======
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a

    // Log the lookup event
    if (window.LogEngine) {
      window.LogEngine.logVocabLookup(wordKey, data);
    }

    const popover = document.createElement('div');
    popover.className = 'vocab-popover animate-fade-in';
    popover.setAttribute('role', 'dialog');
<<<<<<< HEAD
    popover.setAttribute('aria-label', `${wordKey} ${data.vi || ''}`);
    popover.id = 'vocab-word-popover';
    popover.innerHTML = `
      <div class="vocab-popover-header">
        <div class="vocab-popover-title-row">
          <span class="vocab-word-en">${escapeHtml(wordKey)}</span>
          ${data.phonetic ? `<span class="vocab-phonetic">${escapeHtml(data.phonetic)}</span>` : ''}
          <button type="button" class="btn-audio-pronounce" title="${escapeHtml(t('dict_listen'))}" aria-label="${escapeHtml(t('dict_listen'))}: ${escapeHtml(wordKey)}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/></svg>
          </button>
        </div>
        <button type="button" class="vocab-popover-close" aria-label="${escapeHtml(t('dict_close'))}">&times;</button>
      </div>
      <div class="vocab-popover-body">
        <div class="vocab-meaning-vi">
          <span class="vocab-vi-badge">${escapeHtml(t('dict_meaning_label'))}:</span>
          <strong>${escapeHtml(data.vi)}</strong>
        </div>
        <p class="vocab-explain">${escapeHtml(data.explain)}</p>
=======
    popover.innerHTML = `
      <div class="vocab-popover-header">
        <div class="vocab-popover-title-row">
          <span class="vocab-word-en">${wordKey}</span>
          ${data.phonetic ? `<span class="vocab-phonetic">${data.phonetic}</span>` : ''}
          <button type="button" class="btn-audio-pronounce" title="Phát âm tiếng Anh" aria-label="Phát âm ${wordKey}">🔊</button>
        </div>
        <button type="button" class="vocab-popover-close" aria-label="Đóng">&times;</button>
      </div>
      <div class="vocab-popover-body">
        <div class="vocab-meaning-vi">
          <span class="vocab-vi-badge">Nghĩa:</span>
          <strong>${data.vi}</strong>
        </div>
        <p class="vocab-explain">${data.explain}</p>
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
      </div>
    `;

    document.body.appendChild(popover);
    this.activePopover = popover;

    // Positioning
    const rect = targetEl.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    let top = rect.bottom + window.scrollY + 8;
    let left = rect.left + window.scrollX + (rect.width / 2) - (popoverRect.width / 2);

    // Viewport edge collision protection
    if (left < 16) left = 16;
    if (left + popoverRect.width > window.innerWidth - 16) {
      left = window.innerWidth - popoverRect.width - 16;
    }
    if (rect.bottom + popoverRect.height + 20 > window.innerHeight) {
      top = rect.top + window.scrollY - popoverRect.height - 8;
    }
<<<<<<< HEAD
    targetEl.setAttribute('aria-expanded', 'true');
    targetEl.setAttribute('aria-controls', popover.id);
    this.activePopoverTarget = targetEl;
=======
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;

    // Event handlers inside popover
    popover.querySelector('.vocab-popover-close').onclick = (e) => {
      e.stopPropagation();
      this.closePopover();
    };

    const pronounceBtn = popover.querySelector('.btn-audio-pronounce');
    if (pronounceBtn) {
      pronounceBtn.onclick = (e) => {
        e.stopPropagation();
        this.speakWord(wordKey);
      };
    }
  }

  speakWord(word) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.85; // slightly slower for young learners
      window.speechSynthesis.speak(utterance);
    }
  }

  closePopover() {
    if (this.activePopover) {
      this.activePopover.remove();
      this.activePopover = null;
    }
<<<<<<< HEAD
    if (this.activePopoverTarget) {
      this.activePopoverTarget.setAttribute('aria-expanded', 'false');
      this.activePopoverTarget.removeAttribute('aria-controls');
      this.activePopoverTarget = null;
    }
  }

  /** Open the searchable bilingual dictionary. */
=======
  }

  /**
   * Open the full interactive Dictionary Modal
   */
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
  openDictionaryModal() {
    if (window.SoundFX) window.SoundFX.playPop();
    this.closePopover();
    let modal = document.getElementById('vocab-dict-modal');
<<<<<<< HEAD
    const t = (key) => window.I18N ? window.I18N.t(key) : key;
=======
    const t = (k, p) => window.I18N ? window.I18N.t(k, p) : k;
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a

    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'vocab-dict-modal';
<<<<<<< HEAD
      modal.className = 'modal-backdrop vocab-dict-backdrop';
      document.body.appendChild(modal);
    }

    if (!modal.classList.contains('active')) {
      this.previousFocus = document.activeElement;
      this.previousBodyOverflow = document.body.style.overflow;
    }
    this.activeDictionaryCategory = 'all';
    this.dictionaryQuery = '';

    modal.innerHTML = `
      <section class="modal-card vocab-dict-card" role="dialog" aria-modal="true" aria-labelledby="dict-dialog-title">
        <header class="vocab-dict-header">
          <div class="vocab-dict-heading">
            <span class="vocab-dict-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 6.2C9.8 4.7 6.8 4.2 3.5 5v13.2c3.3-.8 6.3-.3 8.5 1.2m0-13.2c2.2-1.5 5.2-2 8.5-1.2v13.2c-3.3-.8-6.3-.3-8.5 1.2m0-13.2v13.2"/></svg>
            </span>
            <div>
              <span class="vocab-dict-eyebrow">${t('dict_eyebrow')}</span>
              <h2 id="dict-dialog-title">${t('dict_title')}</h2>
              <p>${t('dict_subtitle')}</p>
            </div>
          </div>
          <button type="button" class="vocab-dict-close" id="btn-close-dict" aria-label="${t('dict_close')}" title="${t('dict_close')}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </header>

        <div class="vocab-dict-toolbar">
          <div class="vocab-dict-search">
            <label class="dict-visually-hidden" for="dict-search-input">${t('dict_search_label')}</label>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>
            <input type="search" id="dict-search-input" class="dict-search-input" placeholder="${t('dict_search_placeholder')}" autocomplete="off" />
          </div>
          <div class="vocab-dict-filter-row">
            <div class="vocab-dict-categories" role="group" aria-label="${t('dict_filters_label')}">
              ${['all', 'measurement', 'robotics', 'reasoning'].map(category => `
                <button type="button" class="dict-category-chip ${category === 'all' ? 'active' : ''}"
                  data-dict-category="${category}" aria-pressed="${category === 'all'}">
                  ${t(`dict_category_${category}`)}
                </button>
              `).join('')}
            </div>
            <p class="vocab-dict-count" id="dict-result-count" role="status" aria-live="polite"></p>
          </div>
        </div>

        <div class="vocab-dict-list" id="dict-vocab-list" role="list" aria-label="${t('dict_title')}"></div>
      </section>
    `;

    modal.querySelector('#btn-close-dict').onclick = () => this.closeDictionaryModal();
    modal.onclick = (event) => {
      if (event.target === modal) this.closeDictionaryModal();
    };

    const searchInput = modal.querySelector('#dict-search-input');
    searchInput.oninput = () => this.renderDictList(searchInput.value);
    modal.querySelectorAll('[data-dict-category]').forEach(button => {
      button.onclick = () => {
        this.activeDictionaryCategory = button.dataset.dictCategory;
        modal.querySelectorAll('[data-dict-category]').forEach(chip => {
          const active = chip === button;
          chip.classList.toggle('active', active);
          chip.setAttribute('aria-pressed', String(active));
        });
        this.renderDictList(searchInput.value);
      };
    });

    const dialog = modal.querySelector('[role="dialog"]');
    dialog.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialog.querySelectorAll('button:not([disabled]), input:not([disabled])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.renderDictList('');
    setTimeout(() => searchInput.focus(), 0);
  }

  getCategoryForWord(word) {
    if (this.wordCategories.measurement.has(word)) return 'measurement';
    if (this.wordCategories.robotics.has(word)) return 'robotics';
    return 'reasoning';
  }

  renderDictList(filterQuery = this.dictionaryQuery) {
    const listEl = document.getElementById('dict-vocab-list');
    if (!listEl) return;

    const t = (key, params) => window.I18N ? window.I18N.t(key, params) : key;
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
    this.dictionaryQuery = filterQuery;
    const query = filterQuery.toLowerCase().trim();
    const entries = Object.entries(this.vocabData).sort(([a], [b]) => a.localeCompare(b));
    const filtered = entries.filter(([word, data]) => {
      const categoryMatches = this.activeDictionaryCategory === 'all'
        || this.getCategoryForWord(word) === this.activeDictionaryCategory;
      const searchText = [word, data.vi, data.explain, data.phonetic].filter(Boolean).join(' ').toLowerCase();
      return categoryMatches && (!query || searchText.includes(query));
    });

    if (!this.isLoaded) {
      const countEl = document.getElementById('dict-result-count');
      if (countEl) countEl.textContent = t('dict_loading');
      listEl.innerHTML = `<div class="dict-empty-state" role="status"><span class="dict-state-spinner" aria-hidden="true"></span><p>${t('dict_loading')}</p></div>`;
      return;
    }

    const countEl = document.getElementById('dict-result-count');
    if (countEl) countEl.textContent = t('dict_count', { count: filtered.length });

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="dict-empty-state"><span class="dict-state-search" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg></span><p>${t('dict_no_results')}</p></div>`;
      return;
    }

    listEl.innerHTML = filtered.map(([word, data]) => {
      const category = this.getCategoryForWord(word);
      return `
        <article class="dict-item" role="listitem">
          <div class="dict-item-header">
            <div class="dict-item-word-group">
              <h3 class="dict-item-word">${escapeHtml(word)}</h3>
              ${data.phonetic ? `<span class="dict-item-phonetic">${escapeHtml(data.phonetic)}</span>` : ''}
            </div>
            <button type="button" class="btn-mini-audio" data-dict-speak="${escapeHtml(word)}"
              title="${escapeHtml(t('dict_listen'))}" aria-label="${escapeHtml(t('dict_listen'))}: ${escapeHtml(word)}">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/></svg>
            </button>
          </div>
          <span class="dict-item-category">${escapeHtml(t(`dict_category_${category}`))}</span>
          <div class="dict-item-meaning">
            <span>${escapeHtml(t('dict_meaning_label'))}</span>
            <strong>${escapeHtml(data.vi)}</strong>
          </div>
          ${data.explain ? `<p class="dict-item-explain">${escapeHtml(data.explain)}</p>` : ''}
        </article>
      `;
    }).join('');

    listEl.querySelectorAll('[data-dict-speak]').forEach(button => {
      button.onclick = () => this.speakWord(button.dataset.dictSpeak);
    });
=======
      modal.className = 'modal-backdrop animate-fade-in';
      modal.innerHTML = `
        <div class="modal-card vocab-dict-card">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <span class="modal-icon">📖</span>
              <div>
                <h3 class="modal-title">${t('dict_title')}</h3>
                <small class="modal-subtitle">${t('dict_subtitle')}</small>
              </div>
            </div>
            <button type="button" class="btn-close-modal" id="btn-close-dict">&times;</button>
          </div>
          <div class="vocab-dict-search-wrap">
            <input type="text" id="dict-search-input" class="dict-search-input" placeholder="${t('dict_search_placeholder')}" autocomplete="off" />
          </div>
          <div class="vocab-dict-list" id="dict-vocab-list">
            <!-- Dynamic items -->
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('#btn-close-dict').onclick = () => this.closeDictionaryModal();
      modal.onclick = (e) => {
        if (e.target === modal) this.closeDictionaryModal();
      };

      const searchInput = modal.querySelector('#dict-search-input');
      searchInput.oninput = (e) => this.renderDictList(e.target.value);
    } else {
      modal.querySelector('.modal-title').innerText = t('dict_title');
      modal.querySelector('.modal-subtitle').innerText = t('dict_subtitle');
      modal.querySelector('#dict-search-input').placeholder = t('dict_search_placeholder');
    }

    modal.classList.add('active');
    this.renderDictList('');
    setTimeout(() => {
      const searchInput = modal.querySelector('#dict-search-input');
      if (searchInput) searchInput.focus();
    }, 100);
  }

  renderDictList(filterQuery = '') {
    const listEl = document.getElementById('dict-vocab-list');
    if (!listEl) return;

    const q = filterQuery.toLowerCase().trim();
    const entries = Object.entries(this.vocabData);
    const filtered = entries.filter(([word, data]) => {
      if (!q) return true;
      return word.toLowerCase().includes(q) || (data.vi && data.vi.toLowerCase().includes(q));
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="dict-empty-state">Không tìm thấy từ phù hợp với "<strong>${filterQuery}</strong>"</div>`;
      return;
    }

    listEl.innerHTML = filtered.map(([word, data]) => `
      <div class="dict-item">
        <div class="dict-item-header">
          <span class="dict-item-word">${word}</span>
          ${data.phonetic ? `<span class="dict-item-phonetic">${data.phonetic}</span>` : ''}
          <button type="button" class="btn-mini-audio" onclick="window.VocabSupport.speakWord('${word}')" title="Phát âm">🔊</button>
        </div>
        <div class="dict-item-meaning">Tiếng Việt: <strong>${data.vi}</strong></div>
        <div class="dict-item-explain">${data.explain}</div>
      </div>
    `).join('');
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
  }

  closeDictionaryModal() {
    const modal = document.getElementById('vocab-dict-modal');
<<<<<<< HEAD
    if (!modal?.classList.contains('active')) return;
    modal.classList.remove('active');
    document.body.style.overflow = this.previousBodyOverflow;
    if (this.previousFocus?.isConnected) this.previousFocus.focus({ preventScroll: true });
    this.previousFocus = null;
=======
    if (modal) {
      modal.classList.remove('active');
    }
>>>>>>> dac564c8f995b828f22d5a41bd7face9fee15f2a
  }
}

window.VocabSupport = new VocabSupport();
