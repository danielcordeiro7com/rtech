/* R.tec — interações da landing page (JavaScript puro, sem dependências) */
(function () {
  "use strict";

  var WHATSAPP = "5531983624815";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function openWhatsApp(message) {
    window.open(
      "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(message),
      "_blank",
      "noopener"
    );
  }

  /* Botões de WhatsApp -------------------------------------------------- */
  document.querySelectorAll("[data-wa]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openWhatsApp(el.dataset.wa);
    });
  });

  /* Cabeçalho: encolher ao rolar + seção ativa --------------------------- */
  var header = document.querySelector(".header");
  var topbar = document.querySelector(".topbar");
  var syncTop = function () {
    if (window.scrollY <= 40) header.style.top = topbar.offsetHeight + "px";
  };
  window.addEventListener("resize", syncTop);
  syncTop();
  var toTop = document.querySelector(".to-top");
  var navLinks = document.getElementById("navLinks");
  var menuBtn = document.getElementById("menuBtn");
  var links = Array.prototype.slice.call(navLinks.querySelectorAll("a[href^='#']"));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 40);
    header.style.top = y > 40 ? "0px" : topbar.offsetHeight + "px";
    topbar.classList.toggle("hide", y > 40);
    toTop.classList.toggle("show", y > 700);

    var current = null;
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= 140) current = section;
    });
    links.forEach(function (a) {
      a.classList.toggle("active", current && a.getAttribute("href") === "#" + current.id);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  });

  /* Menu mobile ---------------------------------------------------------- */
  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  }
  menuBtn.addEventListener("click", function () {
    setMenu(!navLinks.classList.contains("open"));
  });
  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  /* Animações de entrada -------------------------------------------------- */
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach(function (el) { revealObserver.observe(el); });

  /* Contadores animados --------------------------------------------------- */
  var counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        counterObserver.unobserve(entry.target);
        var el = entry.target;
        var target = parseInt(el.dataset.count, 10);
        var prefix = el.dataset.prefix || "";
        var suffix = el.dataset.suffix || "";
        var pad = el.dataset.pad === "true";

        if (reduced) {
          el.textContent = prefix + (pad ? String(target).padStart(2, "0") : target) + suffix;
          return;
        }
        var start = performance.now();
        var duration = 1200;
        function tick(now) {
          var p = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          var value = Math.round(target * eased);
          el.textContent = prefix + (pad ? String(value).padStart(2, "0") : value) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.4 }
  );
  document.querySelectorAll("[data-count]").forEach(function (el) { counterObserver.observe(el); });

  /* FAQ em acordeão ------------------------------------------------------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq-item"));
  faqItems.forEach(function (item) {
    var button = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");

    button.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");

      faqItems.forEach(function (other) {
        if (other === item) return;
        var otherAnswer = other.querySelector(".faq-answer");
        other.classList.remove("open");
        other.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        otherAnswer.style.height = "0px";
      });

      if (isOpen) {
        item.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
        answer.style.height = "0px";
      } else {
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
        answer.style.height = answer.scrollHeight + "px";
      }
    });
  });
  window.addEventListener("resize", function () {
    faqItems.forEach(function (item) {
      if (item.classList.contains("open")) {
        var answer = item.querySelector(".faq-answer");
        answer.style.height = answer.scrollHeight + "px";
      }
    });
  });

  /* Lightbox da galeria ---------------------------------------------------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox.querySelector("img");
  var lightboxCaption = lightbox.querySelector("figcaption");
  var lastFocused = null;

  function openLightbox(src, alt, caption) {
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightboxCaption.textContent = caption;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lightbox.querySelector(".lightbox-close").focus();
  }
  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll(".gallery-item[data-zoom]").forEach(function (item) {
    item.addEventListener("click", function () {
      var img = item.querySelector("img");
      openLightbox(img.src, img.alt, item.dataset.caption || img.alt);
    });
  });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox || e.target.closest(".lightbox-close")) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
  });

  /* Formulário: validação + envio via WhatsApp ----------------------------- */
  var form = document.getElementById("quoteForm");
  var success = document.getElementById("formSuccess");
  var submitBtn = form.querySelector("button[type='submit']");
  var submitLabel = submitBtn.querySelector(".label");

  function fieldOf(input) { return input.closest(".field"); }

  function validate(input) {
    var wrapper = fieldOf(input);
    var errorEl = wrapper.querySelector(".error");
    var value = input.value.trim();
    var message = "";

    if (input.required && !value) {
      message = "Campo obrigatório.";
    } else if (input.id === "phone" && value) {
      var digits = value.replace(/\D/g, "");
      if (digits.length < 10) message = "Informe o DDD e o número completo.";
    } else if (input.id === "name" && value && value.length < 2) {
      message = "Informe seu nome.";
    }

    errorEl.textContent = message;
    wrapper.classList.toggle("invalid", !!message);
    wrapper.classList.toggle("valid", !message && !!value);
    return !message;
  }

  var fields = Array.prototype.slice.call(form.querySelectorAll("input, textarea"));
  fields.forEach(function (input) {
    input.addEventListener("blur", function () { validate(input); });
    input.addEventListener("input", function () {
      if (fieldOf(input).classList.contains("invalid")) validate(input);
    });
  });

  /* Máscara simples de telefone brasileiro */
  var phone = document.getElementById("phone");
  phone.addEventListener("input", function () {
    var d = phone.value.replace(/\D/g, "").slice(0, 11);
    var out = d;
    if (d.length > 2) out = "(" + d.slice(0, 2) + ") " + d.slice(2);
    if (d.length > 6) {
      var split = d.length > 10 ? 7 : 6;
      out = "(" + d.slice(0, 2) + ") " + d.slice(2, split) + "-" + d.slice(split);
    }
    phone.value = out;
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    fields.forEach(function (input) { if (!validate(input)) ok = false; });

    if (!ok) {
      var firstInvalid = form.querySelector(".field.invalid input, .field.invalid textarea");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitBtn.disabled = true;
    submitLabel.textContent = "Enviando...";

    var v = function (id) {
      var el = document.getElementById(id);
      return el.value.trim() || "Não informado";
    };
    var text =
      "Olá, Rtec! Gostaria de solicitar um orçamento.\n\n" +
      "*Nome:* " + v("name") + "\n" +
      "*WhatsApp:* " + v("phone") + "\n" +
      "*Estado/Cidade:* " + v("location") + "\n" +
      "*Modelo da máquina:* " + v("machine") + "\n" +
      "*Peça / Nº de série / PN:* " + v("part") + "\n" +
      "*Mensagem:* " + v("message");

    window.setTimeout(function () {
      openWhatsApp(text);
      submitBtn.disabled = false;
      submitLabel.textContent = "Quero meu Orçamento";
      success.classList.add("show");
    }, 450);
  });

  /* Ano do rodapé ---------------------------------------------------------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
