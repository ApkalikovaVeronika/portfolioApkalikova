(() => {
  const body = document.body;
  const dot = document.querySelector('.cursor-dot');
  const label = document.querySelector('.cursor-label');
  const projects = [...document.querySelectorAll('.project')];
  const navItems = [...document.querySelectorAll('.nav-item')];
  const logoWrap = document.querySelector('.hero-logo-wrap');
  const heroGrid = document.querySelector('.hero-grid');
  const crosshair = document.querySelector('.hero-crosshair');
  const progressBar = document.querySelector('.scroll-progress span');

  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let raf = 0;

  function renderPointer() {
    dot.style.left = `${pointerX}px`;
    dot.style.top = `${pointerY}px`;
    label.style.left = `${pointerX}px`;
    label.style.top = `${pointerY}px`;
    if (logoWrap && window.innerWidth > 800) {
      const dx = (pointerX - window.innerWidth / 2) / window.innerWidth;
      const dy = (pointerY - window.innerHeight / 2) / window.innerHeight;
      logoWrap.style.setProperty('--px', `${dx * 22}px`);
      logoWrap.style.setProperty('--py', `${dy * 16}px`);
      heroGrid.style.transform = `translate(${dx * -10}px, ${dy * -10}px) scale(1.02)`;
      crosshair.style.transform = `translate(calc(-50% + ${dx * 28}px), calc(-50% + ${dy * 20}px))`;
    }
    raf = 0;
  }

  window.addEventListener('pointermove', (event) => {
    body.classList.add('has-pointer');
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (!raf) raf = requestAnimationFrame(renderPointer);
  }, { passive: true });

  projects.forEach((project) => {
    const image = project.querySelector('.project-image-wrap');
    const category = project.querySelector('.project-info span')?.textContent || 'VIEW';

    project.addEventListener('pointerenter', () => {
      label.textContent = `${category} ↗`;
      body.classList.add('is-hovering-project');
    });
    project.addEventListener('pointermove', (event) => {
      if (window.innerWidth <= 800) return;
      const rect = project.getBoundingClientRect();
      const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
      image.style.setProperty('--mx', `${dx * 16}px`);
      image.style.setProperty('--my', `${dy * 11}px`);
      image.style.setProperty('--tilt', `${dx * 1.2}deg`);
    });
    project.addEventListener('pointerleave', () => {
      label.textContent = 'VIEW';
      body.classList.remove('is-hovering-project');
      image.style.setProperty('--mx', '0px');
      image.style.setProperty('--my', '0px');
      image.style.setProperty('--tilt', '0deg');
    });
  });

  navItems.forEach((item) => {
    item.addEventListener('pointermove', (event) => {
      if (window.innerWidth <= 800) return;
      const rect = item.getBoundingClientRect();
      const dx = (event.clientX - rect.left - rect.width / 2) * .16;
      const dy = (event.clientY - rect.top - rect.height / 2) * .16;
      item.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    item.addEventListener('pointerleave', () => {
      item.style.transform = '';
    });
  });

  const workSection = document.querySelector('#work');
  const infoSection = document.querySelector('#info');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        const id = entry.target.id;
        navItems.forEach((item) => item.classList.toggle('is-active', item.getAttribute('href') === `#${id}`));
      }
    });
  }, { threshold: 0.18 });

  observer.observe(workSection);
  observer.observe(infoSection);
  projects.forEach((project) => observer.observe(project));

  let ticking = false;
  const update = () => {
    const viewport = window.innerHeight;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - viewport;
    const progress = docHeight > 0 ? scrollTop / docHeight : 0;
    progressBar.style.width = `${progress * 100}%`;

    const colors = ['#fb9ae2', '#66b4db', '#90cc82', '#a5ff8c', '#3c20ff', '#f6522c'];
    const colorIndex = Math.min(colors.length - 1, Math.floor(progress * colors.length));
    progressBar.style.background = colors[colorIndex];

    projects.forEach((project) => {
      const wrap = project.querySelector('.project-image-wrap');
      const rect = project.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const normalized = Math.max(-1, Math.min(1, (center - viewport / 2) / viewport));
      const index = Number(project.dataset.index);
      const depth = index % 2 ? -18 : 18;
      const scale = 1 + Math.max(0, 1 - Math.abs(normalized)) * .018;
      const rotate = Number(project.dataset.index) % 2 ? normalized * -.8 : normalized * .8;
      wrap.style.setProperty('--scroll-y', `${normalized * depth}px`);
      wrap.style.setProperty('--scroll-scale', scale);
      wrap.style.setProperty('--scroll-rotate', `${rotate}deg`);
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });

  renderPointer();
  update();
})();
