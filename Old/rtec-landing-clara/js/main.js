(() => {
  'use strict';

  const WHATSAPP = '5531983624815';

  function openWhatsApp(message) {
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  }

  function maskPhone(raw) {
    const d = raw.replace(/\D/g, '').slice(0, 11);
    if (d.length > 6) {
      const split = d.length > 10 ? 7 : 6;
      return `(${d.slice(0, 2)}) ${d.slice(2, split)}-${d.slice(split)}`;
    }
    if (d.length > 2) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return d;
  }

  function validateField(id, value) {
    const required = ['name', 'phone', 'location', 'machine'].includes(id);
    const v = value.trim();
    if (required && !v) return 'Campo obrigatório.';
    if (id === 'phone' && v && v.replace(/\D/g, '').length < 10) return 'Informe o DDD e o número completo.';
    if (id === 'name' && v && v.length < 2) return 'Informe seu nome.';
    return '';
  }

  function updateFieldClass(field, error, touched) {
    const invalid = !!error;
    const valid = !invalid && touched && !!field.querySelector('input, textarea').value.trim();
    field.classList.remove('invalid', 'valid');
    if (invalid) field.classList.add('invalid');
    else if (valid) field.classList.add('valid');
    field.querySelector('.error').textContent = error || '';
  }

  // Menu mobile
  const menuBtn = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');

  function toggleMenu(force) {
    const open = typeof force === 'boolean' ? force : !navLinks.classList.contains('open');
    navLinks.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  menuBtn.addEventListener('click', () => toggleMenu());
  navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => toggleMenu(false)));

  // Header scroll, topbar, voltar ao topo e seção ativa
  const header = document.getElementById('header');
  const topbar = document.getElementById('topbar');
  const toTop = document.getElementById('toTop');
  const navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]')).map((a) => a.getAttribute('href'));

  function onScroll() {
    const y = window.scrollY;
    const scrolled = y > 40;
    header.classList.toggle('scrolled', scrolled);
    header.style.top = scrolled ? '0' : '35px';
    topbar.classList.toggle('hide', scrolled);
    toTop.classList.toggle('show', y > 700);

    let current = null;
    navAnchors.forEach((href) => {
      const section = document.querySelector(href);
      if (section && section.getBoundingClientRect().top <= 140) current = href;
    });
    document.querySelectorAll('.nav-links a').forEach((a) => {
      a.classList.toggle('active', current && a.getAttribute('href') === current);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Reveal scroll
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // Contadores animados
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCounter(el) {
    const value = Number(el.dataset.counter);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const pad = el.dataset.pad === 'true';
    const format = (v) => `${prefix}${pad ? String(v).padStart(2, '0') : v}${suffix}`;

    if (reducedMotion) {
      el.textContent = format(value);
      return;
    }

    el.textContent = format(0);
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(value * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll('[data-counter]').forEach((el) => counterObserver.observe(el));

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  function openLightbox(src, alt, caption) {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightboxCaption.textContent = caption;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.gallery-item[data-lightbox]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openLightbox(btn.dataset.lightbox, btn.dataset.alt, btn.dataset.caption);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    function setOpen(open) {
      item.classList.toggle('open', open);
      question.setAttribute('aria-expanded', String(open));
      answer.style.height = open ? `${answer.scrollHeight}px` : '0';
    }

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach((openItem) => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        openItem.querySelector('.faq-answer').style.height = '0';
      });
      setOpen(!isOpen);
    });
  });

  // Formulário
  const form = document.getElementById('contactForm');
  const fields = Array.from(form.querySelectorAll('.field'));
  const touched = {};
  const values = {};

  fields.forEach((field) => {
    const input = field.querySelector('input, textarea');
    const id = input.id;
    values[id] = '';
    touched[id] = false;

    input.addEventListener('input', () => {
      let raw = input.value;
      if (id === 'phone') raw = maskPhone(raw);
      input.value = raw;
      values[id] = raw;
      if (touched[id]) {
        const error = validateField(id, raw);
        updateFieldClass(field, error, true);
      }
    });

    input.addEventListener('blur', () => {
      touched[id] = true;
      const error = validateField(id, input.value);
      updateFieldClass(field, error, true);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let firstInvalid = null;
    let hasError = false;

    fields.forEach((field) => {
      const input = field.querySelector('input, textarea');
      const id = input.id;
      touched[id] = true;
      const error = validateField(id, input.value);
      updateFieldClass(field, error, true);
      if (error) {
        hasError = true;
        if (!firstInvalid) firstInvalid = input;
      }
    });

    if (hasError) {
      firstInvalid.focus();
      return;
    }

    const v = (id) => values[id].trim() || 'Não informado';
    const text =
      'Olá, Rtec! Gostaria de solicitar um orçamento.\n\n' +
      `*Nome:* ${v('name')}\n` +
      `*WhatsApp:* ${v('phone')}\n` +
      `*Estado/Cidade:* ${v('location')}\n` +
      `*Modelo da máquina:* ${v('machine')}\n` +
      `*Peça / Nº de série / PN:* ${v('part')}\n` +
      `*Mensagem:* ${v('message')}`;

    const submitBtn = form.querySelector('button[type="submit"]');
    const label = submitBtn.querySelector('.label');
    const success = form.querySelector('.form-success');

    label.textContent = 'Enviando...';
    submitBtn.disabled = true;

    setTimeout(() => {
      openWhatsApp(text);
      label.textContent = 'Quero meu Orçamento';
      submitBtn.disabled = false;
      success.classList.add('show');
    }, 450);
  });

  // Botões WhatsApp
  document.querySelectorAll('[data-whatsapp]').forEach((btn) => {
    btn.addEventListener('click', () => openWhatsApp(btn.dataset.whatsapp));
  });

  // Escape fecha menu e lightbox
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    toggleMenu(false);
    closeLightbox();
  });

  // Ano atual no footer
  document.getElementById('year').textContent = new Date().getFullYear();
})();
