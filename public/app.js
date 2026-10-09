/**
 * Muhammad Mustafa Jawed — Portfolio interactions
 * Theme switcher, scroll, chatbot, forms
 */

(() => {
  'use strict';

  const html = document.documentElement;
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');
  const themeToggle = document.getElementById('themeToggle');
  const scrollProgress = document.getElementById('scrollProgress');
  const backTop = document.getElementById('backTop');
  const yearEl = document.getElementById('year');
  const contactForm = document.getElementById('contactForm');
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotPanel = document.getElementById('chatbotPanel');
  const chatbotForm = document.getElementById('chatbotForm');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotLog = document.getElementById('chatbotLog');

  let chatHistory = [];
  let isChatOpen = false;
  let isSending = false;

  /* ---------- Theme ---------- */
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'cream' || savedTheme === 'navy') {
    html.setAttribute('data-theme', savedTheme);
  }

  themeToggle?.addEventListener('click', () => {
    const current = html.getAttribute('data-theme') || 'navy';
    const next = current === 'navy' ? 'cream' : 'navy';
    html.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });

  /* ---------- Year ---------- */
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Scroll ---------- */
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (y / max) * 100 : 0;

    if (scrollProgress) {
      scrollProgress.style.width = pct + '%';
      scrollProgress.setAttribute('aria-valuenow', Math.round(pct));
    }

    navbar?.classList.toggle('scrolled', y > 30);
    backTop?.classList.toggle('visible', y > 480);

    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach((sec) => {
      if (y >= sec.offsetTop - 110) current = sec.id;
    });
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  navToggle?.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', open);
    document.body.classList.toggle('no-scroll', open);
  });

  navLinks?.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle?.classList.remove('active');
      navToggle?.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    });
  });

  /* ---------- Back to top ---------- */
  backTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- Reveal ---------- */
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
  );
  reveals.forEach((el) => io.observe(el));

  /* ---------- Contact form ---------- */
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();
    if (!name || !email || !message) {
      alert('Please fill in all fields.');
      return;
    }
    const subject = encodeURIComponent(`Portfolio contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:mustafajawed250@gmail.com?subject=${subject}&body=${body}`;
  });

  /* ---------- Chatbot ---------- */
  chatbotToggle?.addEventListener('click', () => {
    isChatOpen = !isChatOpen;
    chatbotPanel?.classList.toggle('open', isChatOpen);
    chatbotToggle.classList.toggle('open', isChatOpen);
    chatbotToggle.setAttribute('aria-expanded', isChatOpen);
    chatbotPanel?.setAttribute('aria-hidden', !isChatOpen);
    if (isChatOpen) chatbotInput?.focus();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isChatOpen) {
      isChatOpen = false;
      chatbotPanel?.classList.remove('open');
      chatbotToggle?.classList.remove('open');
      chatbotToggle?.setAttribute('aria-expanded', 'false');
      chatbotPanel?.setAttribute('aria-hidden', 'true');
    }
  });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function appendMsg(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    div.innerHTML = `<p>${escapeHtml(text)}</p>`;
    chatbotLog?.appendChild(div);
    chatbotLog.scrollTop = chatbotLog.scrollHeight;
  }

  function appendTyping() {
    const div = document.createElement('div');
    div.className = 'msg bot typing';
    div.id = 'typingIndicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    chatbotLog?.appendChild(div);
    chatbotLog.scrollTop = chatbotLog.scrollHeight;
  }

  function removeTyping() {
    document.getElementById('typingIndicator')?.remove();
  }

  chatbotForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSending) return;

    const message = chatbotInput?.value.trim();
    if (!message) return;

    chatbotInput.value = '';
    appendMsg('user', message);
    chatHistory.push({ role: 'user', content: message });

    isSending = true;
    const btn = chatbotForm.querySelector('button');
    if (btn) btn.disabled = true;
    appendTyping();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: chatHistory })
      });

      removeTyping();

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        appendMsg('bot', err.error || 'Something went wrong. Please try again.');
      } else {
        const data = await res.json();
        const reply = data.reply || 'Sorry, I could not generate a response.';
        appendMsg('bot', reply);
        chatHistory.push({ role: 'assistant', content: reply });
      }
    } catch {
      removeTyping();
      appendMsg('bot', 'Unable to reach the AI service. Check that the server is running and GROQ_API_KEY is set.');
    } finally {
      isSending = false;
      if (btn) btn.disabled = false;
      chatbotInput?.focus();
    }
  });
})();
