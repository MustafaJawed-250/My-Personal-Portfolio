/**
 * Muhammad Mustafa Jawed — Portfolio
 * Theme switcher, scroll, reveals, chatbot, forms
 */
(() => {
  'use strict';

  const html = document.documentElement;
  const preloader = document.getElementById('preloader');
  const navbar = document.getElementById('navbar');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');
  const themeToggle = document.getElementById('themeToggle');
  const scrollProgress = document.getElementById('scrollProgress');
  const backToTop = document.getElementById('backToTop');
  const cursor = document.getElementById('cursor');
  const cursorFollower = document.getElementById('cursorFollower');
  const yearEl = document.getElementById('year');
  const contactForm = document.getElementById('contactForm');
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotWindow = document.getElementById('chatbotWindow');
  const chatbotForm = document.getElementById('chatbotForm');
  const chatbotInput = document.getElementById('chatbotInput');
  const chatbotMessages = document.getElementById('chatbotMessages');

  let chatHistory = [];
  let isChatOpen = false;
  let isSending = false;
  let ticking = false;

  /* Theme — default navy */
  const saved = localStorage.getItem('portfolio-theme');
  if (saved === 'cream' || saved === 'navy') {
    html.setAttribute('data-theme', saved);
  } else {
    html.setAttribute('data-theme', 'navy');
  }

  themeToggle?.addEventListener('click', () => {
    const next = (html.getAttribute('data-theme') || 'navy') === 'navy' ? 'cream' : 'navy';
    html.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });

  /* Preloader */
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader?.classList.add('hidden');
      document.body.classList.add('cursor-ready');
    }, 1200);
  });

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Custom cursor */
  if (cursor && cursorFollower && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let mx = 0, my = 0, fx = 0, fy = 0;
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    });
    const loop = () => {
      fx += (mx - fx) * 0.15;
      fy += (my - fy) * 0.15;
      cursorFollower.style.left = fx + 'px';
      cursorFollower.style.top = fy + 'px';
      requestAnimationFrame(loop);
    };
    loop();
    document.querySelectorAll('a, button, .btn, .skill-card, .service-card, .magnetic').forEach((el) => {
      el.addEventListener('mouseenter', () => cursorFollower.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursorFollower.classList.remove('hover'));
    });
  }

  /* Magnetic buttons */
  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  /* Scroll UI */
  const updateScroll = () => {
    const y = window.scrollY || window.pageYOffset;
    const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    const ratio = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;
    if (scrollProgress) {
      scrollProgress.style.transform = 'scaleX(' + ratio + ')';
      scrollProgress.setAttribute('aria-valuenow', Math.round(ratio * 100));
    }
    navbar?.classList.toggle('scrolled', y > 30);
    backToTop?.classList.toggle('visible', y > 480);

    let current = '';
    document.querySelectorAll('section[id]').forEach((sec) => {
      if (y >= sec.offsetTop - 110) current = sec.id;
    });
    document.querySelectorAll('.nav-link').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  updateScroll();

  /* Mobile nav */
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

  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* Reveals */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (prefersReduced) {
    reveals.forEach((el) => el.classList.add('visible'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -24px 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  /* Stats */
  document.querySelectorAll('.stat-number').forEach((el) => {
    const target = parseInt(el.dataset.target, 10) || 0;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / 1400, 1);
          el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target;
        };
        requestAnimationFrame(step);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    obs.observe(el);
  });

  /* Typing */
  const typingEl = document.getElementById('typingText');
  if (typingEl && !prefersReduced) {
    const phrases = ['AI Web Developer', 'Frontend Developer', 'Full Stack Builder', 'AI Integrator'];
    let pi = 0, ci = 0, deleting = false;
    const type = () => {
      const cur = phrases[pi];
      typingEl.textContent = deleting ? cur.slice(0, ci - 1) : cur.slice(0, ci + 1);
      ci += deleting ? -1 : 1;
      let delay = deleting ? 40 : 80;
      if (!deleting && ci === cur.length) { delay = 2000; deleting = true; }
      else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 350; }
      setTimeout(type, delay);
    };
    setTimeout(type, 700);
  }

  /* Contact form */
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const message = document.getElementById('message')?.value.trim();
    if (!name || !email || !message) { alert('Please fill in all fields.'); return; }
    const subject = encodeURIComponent('Portfolio contact from ' + name);
    const body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message);
    window.location.href = 'mailto:mustafajawed250@gmail.com?subject=' + subject + '&body=' + body;
  });

  /* Chatbot */
  chatbotToggle?.addEventListener('click', () => {
    isChatOpen = !isChatOpen;
    chatbotWindow?.classList.toggle('open', isChatOpen);
    chatbotToggle.classList.toggle('open', isChatOpen);
    chatbotToggle.setAttribute('aria-expanded', isChatOpen);
    chatbotWindow?.setAttribute('aria-hidden', !isChatOpen);
    if (isChatOpen) chatbotInput?.focus();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isChatOpen) {
      isChatOpen = false;
      chatbotWindow?.classList.remove('open');
      chatbotToggle?.classList.remove('open');
      chatbotToggle?.setAttribute('aria-expanded', 'false');
      chatbotWindow?.setAttribute('aria-hidden', 'true');
    }
  });

  const escapeHtml = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

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
      appendMsg('bot', 'Unable to reach the AI service. On GitHub Pages the chatbot needs a deployed backend (e.g. Vercel/Render) with GROQ_API_KEY.');
    } finally {
      isSending = false;
      if (btn) btn.disabled = false;
      chatbotInput?.focus();
    }
  });
})();