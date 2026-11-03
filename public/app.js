/**
 * Designer CV portfolio — theme, reveals, chatbot, form
 */
(() => {
  'use strict';

  const html = document.documentElement;
  const preloader = document.getElementById('preloader');
  const themeToggle = document.getElementById('themeToggle');
  const contactForm = document.getElementById('contactForm');
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotPanel = document.getElementById('chatbotPanel');
  const chatbotForm = document.getElementById('chatbotForm');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotMessages = document.getElementById('chatbotMessages');

  let chatHistory = [];
  let isChatOpen = false;
  let isSending = false;

  /* Theme: paper (default) | navy */
  const saved = localStorage.getItem('portfolio-theme-cv');
  if (saved === 'navy' || saved === 'paper') {
    html.setAttribute('data-theme', saved);
  } else {
    html.setAttribute('data-theme', 'paper');
  }

  themeToggle?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'paper' ? 'navy' : 'paper';
    html.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme-cv', next);
  });

  window.addEventListener('load', () => {
    setTimeout(() => preloader?.classList.add('hidden'), 1100);
  });

  /* Scroll reveals */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (prefersReduced) {
    reveals.forEach((el) => el.classList.add('visible'));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -24px 0px' }
    );
    reveals.forEach((el) => io.observe(el));
  }

  /* Contact */
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();
    if (!name || !email || !message) {
      alert('Please fill in all fields.');
      return;
    }
    const subject = encodeURIComponent('Portfolio contact from ' + name);
    const body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message);
    window.location.href =
      'mailto:mustafajawed250@gmail.com?subject=' + subject + '&body=' + body;
  });

  /* Chatbot */
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

  const escapeHtml = (s) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const appendMsg = (role, text) => {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    div.innerHTML = '<p>' + escapeHtml(text) + '</p>';
    chatbotMessages?.appendChild(div);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  };

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

    const typing = document.createElement('div');
    typing.className = 'chat-msg bot typing';
    typing.id = 'typingIndicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    chatbotMessages?.appendChild(typing);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: chatHistory })
      });
      document.getElementById('typingIndicator')?.remove();
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
      document.getElementById('typingIndicator')?.remove();
      appendMsg(
        'bot',
        'Unable to reach the AI service. Run the server with GROQ_API_KEY set.'
      );
    } finally {
      isSending = false;
      if (btn) btn.disabled = false;
      chatbotInput?.focus();
    }
  });
})();