(() => {
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('.project-grid .project-card')];
  const status = document.querySelector('.project-filter-status');
  if (!buttons.length || !cards.length) return;

  function setFilter(filter) {
    let visibleProjects = 0;
    cards.forEach((card) => {
      const isMoreCard = card.classList.contains('more-card');
      const categories = (card.dataset.categories || '').split(/\s+/).filter(Boolean);
      const visible = filter === 'all' || (!isMoreCard && categories.includes(filter));
      card.hidden = !visible;
      if (visible && !isMoreCard) visibleProjects += 1;
    });

    buttons.forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    if (status) {
      status.textContent = filter === 'all'
        ? 'Exibindo todos os projetos.'
        : `${visibleProjects} ${visibleProjects === 1 ? 'projeto encontrado' : 'projetos encontrados'}.`;
    }
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => setFilter(button.dataset.filter));
  });
})();
