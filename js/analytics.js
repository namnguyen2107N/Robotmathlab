/**
 * ROBOT MATH LAB - TRAFFIC & ACCESS ANALYTICS ENGINE
 * Tracks web visits, page views, session duration, device types, and screen sizes.
 * Provides visualization charts for Teachers and Researchers.
 */

const Analytics = {
  STORAGE_KEY: 'rml_web_analytics_data',

  init() {
    this.ensureStorage();
    this.trackVisit();
  },

  ensureStorage() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      // Seed initial realistic baseline for demonstration
      const initialData = {
        totalVisits: 142,
        uniqueVisitors: 38,
        pageViews: {
          '#home': 98,
          '#lessons': 76,
          '#lesson/motion-1': 54,
          '#lesson/motion-2': 42,
          '#lesson/motion-3': 35,
          '#lesson/motion-4': 28,
          '#lesson/motion-5': 22,
          '#progress': 45,
          '#research': 31
        },
        deviceBreakdown: {
          'Desktop/Smartboard': 85,
          'Tablet': 42,
          'Mobile': 15
        },
        dailyVisits: {
          '2026-09-15': 18,
          '2026-09-16': 24,
          '2026-09-17': 31,
          '2026-09-18': 37,
          '2026-09-19': 32
        },
        recentLogs: []
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialData));
    }
  },

  getData() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  },

  saveData(data) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  },

  trackVisit() {
    const data = this.getData();
    data.totalVisits = (data.totalVisits || 0) + 1;

    // Device breakdown
    const device = DB.detectDevice();
    data.deviceBreakdown[device] = (data.deviceBreakdown[device] || 0) + 1;

    // Daily breakdown
    const today = new Date().toISOString().split('T')[0];
    data.dailyVisits[today] = (data.dailyVisits[today] || 0) + 1;

    // Log entry
    const user = DB.getCurrentUser();
    data.recentLogs.unshift({
      timestamp: new Date().toISOString(),
      studentId: user ? user.id : 'anonymous',
      studentName: user ? user.name : 'Khách',
      device,
      resolution: `${window.innerWidth}x${window.innerHeight}`
    });

    if (data.recentLogs.length > 100) data.recentLogs.pop();
    this.saveData(data);
  },

  trackPageView(pageHash) {
    const data = this.getData();
    const page = pageHash || '#home';
    data.pageViews[page] = (data.pageViews[page] || 0) + 1;
    this.saveData(data);
  },

  getSummary() {
    const data = this.getData();
    const totalViews = Object.values(data.pageViews || {}).reduce((a, b) => a + b, 0);
    return {
      totalVisits: data.totalVisits || 0,
      totalPageViews: totalViews,
      deviceBreakdown: data.deviceBreakdown || {},
      dailyVisits: data.dailyVisits || {},
      pageViews: data.pageViews || {},
      recentLogs: data.recentLogs || []
    };
  },

  /**
   * Draw interactive traffic chart on Canvas (Zero CDN dependency)
   */
  renderTrafficChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = 200 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // Use setTransform to avoid cumulative scaling
    const w = rect.width;
    const h = 200;

    const summary = this.getSummary();
    const days = Object.keys(summary.dailyVisits);
    const counts = Object.values(summary.dailyVisits);
    const maxVal = Math.max(...counts, 10);

    ctx.clearRect(0, 0, w, h);

    // Draw baseline
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, h - 30);
    ctx.lineTo(w - 20, h - 30);
    ctx.stroke();

    // Draw bars
    const barWidth = Math.min(45, (w - 80) / days.length - 15);
    const spacing = (w - 80) / days.length;

    days.forEach((day, idx) => {
      const val = counts[idx];
      const barHeight = (val / maxVal) * (h - 70);
      const x = 50 + idx * spacing;
      const y = h - 30 - barHeight;

      // Bar gradient
      const grad = ctx.createLinearGradient(0, y, 0, h - 30);
      grad.addColorStop(0, '#4F46E5');
      grad.addColorStop(1, '#818CF8');
      ctx.fillStyle = grad;

      // Draw rounded bar
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(x, y, barWidth, barHeight, [6, 6, 0, 0]) : ctx.fillRect(x, y, barWidth, barHeight);
      ctx.fill();

      // Value label
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 12px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(val, x + barWidth / 2, y - 6);

      // Date label (dd/mm)
      const parts = day.split('-');
      const shortDate = `${parts[2]}/${parts[1]}`;
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 11px Nunito, sans-serif';
      ctx.fillText(shortDate, x + barWidth / 2, h - 12);
    });
  }
};

Analytics.init();
window.Analytics = Analytics;
