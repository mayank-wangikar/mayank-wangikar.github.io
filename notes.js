/* notes.js — reads notes-manifest.json and renders collapsible folders */

function loadNotes() {
  const container = document.getElementById('notes-container');
  if (!container) return;

  fetch('notes-manifest.json?v=' + Date.now())
    .then(r => {
      if (!r.ok) throw new Error('manifest not found');
      return r.json();
    })
    .then(manifest => renderNotes(manifest, container))
    .catch(() => {
      container.innerHTML =
        '<p class="notes-empty">No notes available yet.</p>';
    });
}

function renderNotes(manifest, container) {
  // manifest shape:
  // {
  //   "folders": [
  //     {
  //       "id": "folder-1",
  //       "name": "Chapter 1: Topological Groups",
  //       "files": [
  //         { "name": "1.1 Topological Preliminaries", "pdf": "pdfs/1.1 Topological Preliminaries.pdf", "tex": "latex/1.1 Topological Preliminaries.tex" },
  //         ...
  //       ]
  //     },
  //     ...
  //   ],
  //   "uncategorized": [
  //     { "name": "...", "pdf": "...", "tex": "..." }
  //   ]
  // }

  const folders = manifest.folders || [];
  const uncategorized = manifest.uncategorized || [];

  if (folders.length === 0 && uncategorized.length === 0) {
    container.innerHTML = '<p class="notes-empty">No notes available yet.</p>';
    return;
  }

  container.innerHTML = '';

  // Render named folders
  folders.forEach(folder => {
    container.appendChild(buildFolder(folder.name, folder.files, folder.id));
  });

  // Render uncategorized if any
  if (uncategorized.length > 0) {
    container.appendChild(buildFolder('Uncategorized', uncategorized, 'uncategorized'));
  }
}

function buildFolder(name, files, id) {
  const div = document.createElement('div');
  div.className = 'folder';
  div.id = 'folder-' + id;

  // Header
  const header = document.createElement('div');
  header.className = 'folder-header';
  header.innerHTML = `
    <span>${escapeHtml(name)}</span>
    <span class="folder-arrow">&#9654;</span>
  `;
  header.addEventListener('click', () => div.classList.toggle('open'));

  // File list
  const fileList = document.createElement('div');
  fileList.className = 'folder-files';

  if (!files || files.length === 0) {
    fileList.innerHTML = '<p class="notes-empty" style="padding:0.3rem 0">Empty folder.</p>';
  } else {
    files.forEach(file => {
      const entry = document.createElement('div');
      entry.className = 'file-entry';

      const pdfLink = file.pdf
        ? `<a href="${escapeHtml(file.pdf)}" target="_blank">PDF</a>`
        : '';
      const texLink = file.tex
        ? `<a href="${escapeHtml(file.tex)}" target="_blank">TeX</a>`
        : '';

      entry.innerHTML = `
        <span class="file-name">${escapeHtml(file.name)}</span>
        ${pdfLink}
        ${texLink}
      `;
      fileList.appendChild(entry);
    });
  }

  div.appendChild(header);
  div.appendChild(fileList);
  return div;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
