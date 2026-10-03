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
    this.init();
  }

  async init() {
    try {
      const response = await fetch('data/vocab.json');
      if (response.ok) {
        this.vocabData = await response.json();
        this.isLoaded = true;
      }
    } catch (e) {
      console.warn('Could not load data/vocab.json, using fallback vocab:', e);
      this.vocabData = this.getFallbackVocab();
      this.isLoaded = true;
    }

    this.setupGlobalEvents();
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
    return text.replace(/\[([a-zA-Z\s]+)\]\*?/g, (match, word) => {
      const key = word.trim().toLowerCase();
      const hasDef = this.vocabData[key];
      return `<span class="vocab-term" data-vocab-word="${key}" tabindex="0" role="button" aria-haspopup="dialog" title="Nhấn để xem nghĩa Tiếng Việt của '${word}'">${word}</span>`;
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

    // Log the lookup event
    if (window.LogEngine) {
      window.LogEngine.logVocabLookup(wordKey, data);
    }

    const popover = document.createElement('div');
    popover.className = 'vocab-popover animate-fade-in';
    popover.setAttribute('role', 'dialog');
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
  }

  /**
   * Open the full interactive Dictionary Modal
   */
  openDictionaryModal() {
    if (window.SoundFX) window.SoundFX.playPop();
    this.closePopover();
    let modal = document.getElementById('vocab-dict-modal');
    const t = (k, p) => window.I18N ? window.I18N.t(k, p) : k;

    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'vocab-dict-modal';
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
  }

  closeDictionaryModal() {
    const modal = document.getElementById('vocab-dict-modal');
    if (modal) {
      modal.classList.remove('active');
    }
  }
}

window.VocabSupport = new VocabSupport();
