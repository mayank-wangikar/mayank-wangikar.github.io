/* notes.js — reads notes-manifest.json and renders collapsible folders (with nested subfolders) */

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
  //         { "name": "1.1 Topological Preliminaries", "pdf": "pdfs/1.1 Topological Preliminaries.pdf" },
  //         ...
  //       ],
  //       "subfolders": [
  //         {
  //           "id": "folder-1a",
  //           "name": "Subsection A",
  //           "files": [...],
  //           "subfolders": [...]   // can nest indefinitely
  //         }
  //       ]
  //     },
  //     ...
  //   ],
  //   "uncategorized": [
  //     { "name": "...", "pdf": "..." }
  //   ]
  // }

  const folders = manifest.folders || [];
  const uncategorized = manifest.uncategorized || [];

  if (folders.length === 0 && uncategorized.length === 0) {
    container.innerHTML = '<p class="notes-empty">No notes available yet.</p>';
    return;
  }

  container.innerHTML = '';

  // Render named folders (recursively handles subfolders)
  folders.forEach(folder => {
    container.appendChild(buildFolder(folder.name, folder.files, folder.id, folder.subfolders, 0));
  });

  // Render uncategorized if any
}

function buildFolder(name, files, id, subfolders, depth) {
  const div = document.createElement('div');
  div.className = 'folder';
  if (depth > 0) div.classList.add('subfolder');
  div.id = 'folder-' + id;
  div.style.marginLeft = (depth * 1.25) + 'rem';

  // Header
  const header = document.createElement('div');
  header.className = 'folder-header';
  header.innerHTML = `
    <span>${escapeHtml(name)}</span>
    <span class="folder-arrow">&#9654;</span>
  `;
  header.addEventListener('click', () => div.classList.toggle('open'));

  // Body — holds files and nested subfolders
  const body = document.createElement('div');
  body.className = 'folder-files';

  const hasFiles = files && files.length > 0;
  const hasSubfolders = subfolders && subfolders.length > 0;

  if (!hasFiles && !hasSubfolders) {
    body.innerHTML = '<p class="notes-empty" style="padding:0.3rem 0">Empty folder.</p>';
  } else {
    if (hasFiles) {
      files.forEach(file => {
        const entry = document.createElement('div');
        entry.className = 'file-entry';
        const pdfLink = file.pdf
          ? `<a href="${escapeHtml(file.pdf)}" target="_blank">PDF</a>`
          : '';
        entry.innerHTML = `
          <span class="file-name">${escapeHtml(file.name)}</span>
          ${pdfLink}
        `;
        body.appendChild(entry);
      });
    }

    if (hasSubfolders) {
      subfolders.forEach(sub => {
        body.appendChild(buildFolder(sub.name, sub.files, sub.id, sub.subfolders, depth + 1));
      });
    }
  }

  div.appendChild(header);
  div.appendChild(body);
  return div;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
