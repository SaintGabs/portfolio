(() => {
  const canvas = document.querySelector('.particle-network');
  const hero = document.querySelector('.hero');
  const context = canvas?.getContext('2d');

  if (canvas && hero && context) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let particles = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    const linkDistance = 142;

    function resizeNetwork() {
      const bounds = hero.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(18, Math.min(46, Math.round(width / 27)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        radius: Math.random() * 1.4 + 0.7,
      }));
      paint();
    }

    function paint() {
      context.clearRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i += 1) {
        const point = particles[i];
        if (!reduceMotion.matches) {
          point.x += point.vx;
          point.y += point.vy;
          if (point.x < 0 || point.x > width) point.vx *= -1;
          if (point.y < 0 || point.y > height) point.vy *= -1;
        }

        for (let j = i + 1; j < particles.length; j += 1) {
          const other = particles[j];
          const dx = point.x - other.x;
          const dy = point.y - other.y;
          const distance = Math.hypot(dx, dy);
          if (distance < linkDistance) {
            context.strokeStyle = `rgba(93, 207, 187, ${0.14 * (1 - distance / linkDistance)})`;
            context.lineWidth = 0.8;
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(other.x, other.y);
            context.stroke();
          }
        }

        context.fillStyle = 'rgba(131, 243, 222, 0.58)';
        context.beginPath();
        context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
        context.fill();
      }

      if (!reduceMotion.matches) frame = window.requestAnimationFrame(paint);
    }

    function restartNetwork() {
      window.cancelAnimationFrame(frame);
      resizeNetwork();
    }

    if ('ResizeObserver' in window) new ResizeObserver(resizeNetwork).observe(hero);
    else window.addEventListener('resize', resizeNetwork, { passive: true });
    reduceMotion.addEventListener?.('change', restartNetwork);
    resizeNetwork();
  }

  const dialog = document.querySelector('#command-dialog');
  const trigger = document.querySelector('.command-trigger');
  const input = document.querySelector('#command-input');
  const items = Array.from(document.querySelectorAll('.command-item'));
  let activeIndex = -1;

  if (!dialog || !input || !trigger || !items.length) return;

  const visibleItems = () => items.filter((item) => !item.hidden);

  function markActive(index) {
    const visible = visibleItems();
    if (!visible.length) {
      activeIndex = -1;
      return;
    }
    activeIndex = Math.max(0, Math.min(index, visible.length - 1));
    visible.forEach((item, i) => item.classList.toggle('is-active', i === activeIndex));
    visible[activeIndex].scrollIntoView({ block: 'nearest' });
  }

  function filterItems() {
    const query = input.value.trim().toLocaleLowerCase('pt-BR');
    items.forEach((item) => {
      item.hidden = !item.textContent.toLocaleLowerCase('pt-BR').includes(query);
      item.classList.remove('is-active');
    });
    activeIndex = -1;
    if (visibleItems().length) markActive(0);
  }

  function openPalette() {
    if (!dialog.open) dialog.showModal();
    input.value = '';
    filterItems();
    window.requestAnimationFrame(() => input.focus());
  }

  trigger.addEventListener('click', openPalette);
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openPalette();
    }
  });
  input.addEventListener('input', filterItems);
  input.addEventListener('keydown', (event) => {
    const visible = visibleItems();
    if (event.key === 'ArrowDown' && visible.length) {
      event.preventDefault();
      markActive(activeIndex < visible.length - 1 ? activeIndex + 1 : 0);
    } else if (event.key === 'ArrowUp' && visible.length) {
      event.preventDefault();
      markActive(activeIndex > 0 ? activeIndex - 1 : visible.length - 1);
    } else if (event.key === 'Enter' && activeIndex >= 0 && visible[activeIndex]) {
      event.preventDefault();
      visible[activeIndex].click();
    }
  });
  items.forEach((item) => item.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => trigger.focus());
})();
