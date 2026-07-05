// main.js — interactivity for Abhishek's portfolio
document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------
     1. Terminal typewriter effect
  --------------------------------------------------- */
  const terminalBody = document.getElementById('terminalBody');
  const terminalLines = [
    { prompt: '$ whoami', out: 'abhishek_kumar — backend developer' },
    { prompt: '$ status', out: 'open to full-time & internship roles' },
    { prompt: '$ ping devtinder.quest', out: '200 OK — live in production' }
  ];

  function typeTerminal() {
    if (!terminalBody) return;

    if (prefersReducedMotion) {
      terminalBody.innerHTML = terminalLines
        .map(l => `<span class="prompt">${l.prompt}</span>\n<span class="out">${l.out}</span>`)
        .join('\n');
      return;
    }

    terminalBody.innerHTML = '';
    let lineIndex = 0;

    function typeLine() {
      if (lineIndex >= terminalLines.length) {
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        terminalBody.appendChild(cursor);
        return;
      }

      const line = terminalLines[lineIndex];
      const promptSpan = document.createElement('span');
      promptSpan.className = 'prompt';
      terminalBody.appendChild(promptSpan);

      let charIndex = 0;
      const typeChar = setInterval(() => {
        promptSpan.textContent += line.prompt[charIndex];
        charIndex++;
        if (charIndex >= line.prompt.length) {
          clearInterval(typeChar);
          terminalBody.appendChild(document.createElement('br'));
          const outSpan = document.createElement('span');
          outSpan.className = 'out';
          terminalBody.appendChild(outSpan);

          let outIndex = 0;
          const typeOut = setInterval(() => {
            outSpan.textContent += line.out[outIndex];
            outIndex++;
            if (outIndex >= line.out.length) {
              clearInterval(typeOut);
              terminalBody.appendChild(document.createElement('br'));
              lineIndex++;
              setTimeout(typeLine, 250);
            }
          }, 18);
        }
      }, 35);
    }

    typeLine();
  }

  // Start the terminal once it scrolls into view
  const terminalEl = document.getElementById('terminal');
  if (terminalEl && 'IntersectionObserver' in window) {
    const terminalObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          typeTerminal();
          obs.disconnect();
        }
      });
    }, { threshold: 0.3 });
    terminalObserver.observe(terminalEl);
  } else {
    typeTerminal();
  }

  /* ---------------------------------------------------
     2. Scroll-spy navigation + progress bar
  --------------------------------------------------- */
  const sections = ['about', 'skills', 'education', 'portfolio']
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navLinks = document.querySelectorAll('.nav-link');
  const navProgressBar = document.getElementById('navProgressBar');

  function setActiveLink(id) {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });

    sections.forEach(section => spy.observe(section));
  }

  const mainContent = document.querySelector('.main-content');
  function updateProgress() {
    if (!navProgressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    navProgressBar.style.width = `${Math.min(pct, 100)}%`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* ---------------------------------------------------
     3. Reveal-on-scroll for skills / education / portfolio
  --------------------------------------------------- */
  const revealTargets = document.querySelectorAll('.item, .edfirst, .edsecond, .project');
  revealTargets.forEach(el => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('is-visible'), i * 60);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealTargets.forEach(el => revealObserver.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------------------------------------------------
     4. Animated stat counters
  --------------------------------------------------- */
  const statNumbers = document.querySelectorAll('.stat-number');

  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    const suffix = el.dataset.suffix || '';
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1200;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const statsRow = document.getElementById('statsRow');
  if (statsRow && 'IntersectionObserver' in window) {
    const statsObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          statNumbers.forEach(animateCount);
          obs.disconnect();
        }
      });
    }, { threshold: 0.4 });
    statsObserver.observe(statsRow);
  }

  /* ---------------------------------------------------
     5. Copy email to clipboard
  --------------------------------------------------- */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        const temp = document.createElement('textarea');
        temp.value = text;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      const original = btn.textContent;
      btn.textContent = 'copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 1800);
    });
  });

  /* ---------------------------------------------------
     6. Back-to-top button
  --------------------------------------------------- */
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------
     7. Subtle tilt effect on the project card
  --------------------------------------------------- */
  if (!prefersReducedMotion) {
    document.querySelectorAll('.project').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(700px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(700px) rotateY(0) rotateX(0) translateY(0)';
      });
    });
  }

});