/**
 * ROBOT MATH LAB - SPARKY FLOATING MASCOT COMPANION
 * Draggable helper robot with cheer voice messages, animations, and sound effects.
 */
(function () {
  'use strict';

  class SparkyMascotCompanion {
    constructor() {
      this.container = null;
      this.avatar = null;
      this.bubble = null;

      this.isDragging = false;
      this.hasMoved = false;
      this.startPointerX = 0;
      this.startPointerY = 0;
      this.grabOffsetX = 0;
      this.grabOffsetY = 0;
      this.currentSide = 'bubble-on-left';
      this.activePointerTarget = null;
      this.activePointerId = null;

      this.onPointerStart = this.onPointerStart.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.onPointerEnd = this.onPointerEnd.bind(this);
      this.onResize = this.onResize.bind(this);

      this.init();
    }

    init() {
      if (typeof document === 'undefined') return;

      this.container = document.getElementById('sparky-container');
      this.avatar = document.getElementById('sparky-avatar');
      this.bubble = document.getElementById('sparky-bubble');

      if (!this.container || !this.avatar) return;

      this.restorePosition();
      this.bindEvents();
    }

    getCheerMessages() {
      if (window.I18N && window.I18N.isVietnamese()) {
        return [
          'Bạn học giỏi lắm, cố gắng lên nào! ⭐',
          'Hãy nhớ đọc kỹ đề bài trước khi tính nhé! 📖',
          'Toán học thật thú vị đúng không nào? 🚀',
          'Mình luôn ở đây để đồng hành cùng bạn! 🤖✨',
          "Nếu gặp khó khăn, hãy bấm nút 'Gợi ý' nhé! 💡",
          'Mỗi lần thử sai là một lần chúng mình học thêm điều mới! 🌱'
        ];
      }
      return [
        "You're doing great! Keep it up! ⭐",
        'Always read the problem carefully before calculating! 📖',
        'Math and robots are so fun together! 🚀',
        "I'm always right here with you! 🤖✨",
        "Need help? Click the 'Hint' button anytime! 💡",
        'Every mistake is a step toward learning something new! 🌱'
      ];
    }

    triggerCheer() {
      if (window.SoundFX && typeof window.SoundFX.playTing === 'function') {
        window.SoundFX.playTing();
      }
      if (this.avatar) {
        this.avatar.classList.add('sparky-jump');
        setTimeout(() => {
          this.avatar?.classList.remove('sparky-jump');
        }, 600);
      }
      const msgs = this.getCheerMessages();
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      if (this.bubble) {
        this.bubble.innerText = randomMsg;
      }
    }

    restorePosition() {
      if (typeof localStorage === 'undefined') return;
      try {
        const savedPos = localStorage.getItem('sparky_pos');
        if (savedPos) {
          const parsed = JSON.parse(savedPos);
          if (parsed && this.container) {
            if (parsed.side) {
              this.currentSide = parsed.side;
              this.container.classList.remove('bubble-on-left', 'bubble-on-right');
              this.container.classList.add(this.currentSide);
            }
            if (parsed.right !== undefined) this.container.style.right = parsed.right;
            if (parsed.left !== undefined) this.container.style.left = parsed.left;
            if (parsed.bottom !== undefined) this.container.style.bottom = parsed.bottom;
            if (parsed.top !== undefined) this.container.style.top = parsed.top;
          }
        }
      } catch (_) {}
    }

    updatePosition(clientX, clientY) {
      if (!this.container || !this.avatar) return;
      const avatarRect = this.avatar.getBoundingClientRect();
      const winW = window.innerWidth;
      const winH = window.innerHeight;

      const avatarW = avatarRect.width || 88;
      const avatarH = avatarRect.height || 88;

      const minAvatarX = 12;
      const maxAvatarX = Math.max(12, winW - avatarW - 12);
      const desiredAvatarX = Math.max(minAvatarX, Math.min(clientX - this.grabOffsetX, maxAvatarX));

      const minAvatarY = 12;
      const maxAvatarY = Math.max(12, winH - avatarH - 12);
      const desiredAvatarY = Math.max(minAvatarY, Math.min(clientY - this.grabOffsetY, maxAvatarY));

      const side = desiredAvatarX < winW / 2 ? 'bubble-on-right' : 'bubble-on-left';
      if (side !== this.currentSide) {
        this.currentSide = side;
        this.container.classList.remove('bubble-on-left', 'bubble-on-right');
        this.container.classList.add(this.currentSide);
      }

      let containerX;
      const gap = 16;
      const bubbleW = this.bubble && this.bubble.offsetWidth ? this.bubble.offsetWidth : 260;

      if (this.currentSide === 'bubble-on-left') {
        containerX = desiredAvatarX - bubbleW - gap;
        if (containerX < 12) containerX = 12;
      } else {
        containerX = desiredAvatarX;
        const totalW = this.container.offsetWidth;
        if (containerX + totalW > winW - 12) {
          containerX = Math.max(12, winW - totalW - 12);
        }
      }

      const containerH = this.container.offsetHeight;
      let containerY = desiredAvatarY + avatarH - containerH;
      if (containerY < 12) containerY = 12;
      if (containerY + containerH > winH - 12) {
        containerY = Math.max(12, winH - containerH - 12);
      }

      this.container.style.left = `${Math.round(containerX)}px`;
      this.container.style.top = `${Math.round(containerY)}px`;
      this.container.style.right = 'auto';
      this.container.style.bottom = 'auto';
    }

    onPointerStart(e) {
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      this.isDragging = true;
      this.hasMoved = false;
      this.startPointerX = e.clientX;
      this.startPointerY = e.clientY;
      this.activePointerTarget = e.currentTarget;
      this.activePointerId = e.pointerId;

      const avatarRect = this.avatar.getBoundingClientRect();
      this.grabOffsetX = e.clientX - avatarRect.left;
      this.grabOffsetY = e.clientY - avatarRect.top;

      try {
        this.activePointerTarget?.setPointerCapture?.(this.activePointerId);
      } catch (_) {}
    }

    onPointerMove(e) {
      if (!this.isDragging) return;
      const dx = e.clientX - this.startPointerX;
      const dy = e.clientY - this.startPointerY;

      if (!this.hasMoved && Math.hypot(dx, dy) > 5) {
        this.hasMoved = true;
        this.container?.classList.add('is-dragging');
        this.avatar?.classList.add('is-dragging');
        this.bubble?.classList.add('is-dragging');
      }

      if (this.hasMoved) {
        this.updatePosition(e.clientX, e.clientY);
      }
    }

    onPointerEnd(e) {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.container?.classList.remove('is-dragging');
      this.avatar?.classList.remove('is-dragging');
      this.bubble?.classList.remove('is-dragging');

      if (this.activePointerTarget && this.activePointerId !== null) {
        try {
          this.activePointerTarget.releasePointerCapture?.(this.activePointerId);
        } catch (_) {}
      }
      this.activePointerTarget = null;
      this.activePointerId = null;

      if (!this.hasMoved) {
        this.triggerCheer();
      } else {
        if (!this.avatar || !this.container) return;
        const avatarRect = this.avatar.getBoundingClientRect();
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const avatarW = avatarRect.width || 88;
        const avatarH = avatarRect.height || 88;

        let rightVal = 'auto';
        let leftVal = 'auto';
        let bottomVal = 'auto';
        let topVal = 'auto';

        if (avatarRect.left >= winW / 2) {
          const distRight = Math.max(12, winW - (avatarRect.left + avatarW));
          rightVal = `${Math.round(distRight)}px`;
        } else {
          leftVal = `${Math.max(12, Math.round(avatarRect.left))}px`;
        }

        if (avatarRect.top >= winH / 2) {
          const distBottom = Math.max(12, winH - (avatarRect.top + avatarH));
          bottomVal = `${Math.round(distBottom)}px`;
        } else {
          const containerRect = this.container.getBoundingClientRect();
          topVal = `${Math.max(12, Math.round(containerRect.top))}px`;
        }

        this.container.style.right = rightVal;
        this.container.style.left = leftVal;
        this.container.style.bottom = bottomVal;
        this.container.style.top = topVal;

        try {
          localStorage.setItem(
            'sparky_pos',
            JSON.stringify({
              side: this.currentSide,
              right: rightVal,
              left: leftVal,
              bottom: bottomVal,
              top: topVal
            })
          );
        } catch (_) {}
      }
    }

    onResize() {
      if (!this.container) return;
      const containerRect = this.container.getBoundingClientRect();
      const maxW = Math.max(12, window.innerWidth - containerRect.width - 12);
      const maxH = Math.max(12, window.innerHeight - containerRect.height - 12);
      if (this.container.style.left && this.container.style.left !== 'auto') {
        const currL = parseFloat(this.container.style.left) || containerRect.left;
        this.container.style.left = `${Math.max(12, Math.min(currL, maxW))}px`;
      }
      if (this.container.style.top && this.container.style.top !== 'auto') {
        const currT = parseFloat(this.container.style.top) || containerRect.top;
        this.container.style.top = `${Math.max(12, Math.min(currT, maxH))}px`;
      }
    }

    bindEvents() {
      if (this.avatar) {
        this.avatar.addEventListener('pointerdown', this.onPointerStart);
        this.avatar.addEventListener('pointermove', this.onPointerMove);
        this.avatar.addEventListener('pointerup', this.onPointerEnd);
        this.avatar.addEventListener('pointercancel', this.onPointerEnd);

        this.avatar.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.triggerCheer();
          }
        });
      }

      if (this.bubble) {
        this.bubble.addEventListener('pointerdown', this.onPointerStart);
        this.bubble.addEventListener('pointermove', this.onPointerMove);
        this.bubble.addEventListener('pointerup', this.onPointerEnd);
        this.bubble.addEventListener('pointercancel', this.onPointerEnd);
      }

      window.addEventListener('resize', this.onResize);
    }
  }

  // Initialize on DOM ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.SparkyMascot = new SparkyMascotCompanion();
      });
    } else {
      window.SparkyMascot = new SparkyMascotCompanion();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SparkyMascotCompanion;
  }
})();
