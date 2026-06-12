/* main.js — single-page tab navigation */

(function () {
  const links   = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');

  function show(id) {
    sections.forEach(s => s.classList.remove('visible'));
    links.forEach(l => l.classList.remove('active'));

    const target = document.getElementById(id);
    const link   = document.querySelector(`[data-section="${id}"]`);

    if (target) target.classList.add('visible');
    if (link)   link.classList.add('active');

    // Trigger notes load only when that tab is first opened
    if (id === 'notes' && !window._notesLoaded) {
      window._notesLoaded = true;
      if (typeof loadNotes === 'function') loadNotes();
    }
  }

  links.forEach(link => {
    if (!link.dataset.section) return; // skip CV external link
    link.addEventListener('click', e => {
      e.preventDefault();
      show(link.dataset.section);
      history.replaceState(null, '', '#' + link.dataset.section);
    });
  });

  // Handle direct URL hash on load
  const hash = location.hash.replace('#', '');
  const validSections = ['about', 'notes', 'sidequests', 'blog'];
  if (validSections.includes(hash)) {
    show(hash);
  } else {
    show('about');
  }
})();
