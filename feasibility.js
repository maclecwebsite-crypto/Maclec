document.addEventListener('DOMContentLoaded', () => {

  /* ===== FILE UPLOAD CHIPS ===== */
  function wireFileDrop(inputId, listId) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    const dropZone = input.closest('.file-drop');
    if (!input || !list) return;

    input.addEventListener('change', () => {
      list.innerHTML = '';
      Array.from(input.files).forEach(file => {
        const chip = document.createElement('span');
        chip.className = 'file-chip';
        chip.textContent = file.name;
        list.appendChild(chip);
      });
    });

    ['dragenter', 'dragover'].forEach(evt => {
      dropZone.addEventListener(evt, e => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
    });
    ['dragleave', 'drop'].forEach(evt => {
      dropZone.addEventListener(evt, e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
      });
    });
    dropZone.addEventListener('drop', e => {
      if (e.dataTransfer.files.length) {
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
      }
    });
  }

  wireFileDrop('upload-drawings', 'list-drawings');
  wireFileDrop('upload-photos', 'list-photos');

  /* ===== FORM SUBMIT ===== */
  const form = document.getElementById('feas-form');
  const success = document.getElementById('feas-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // In production this would POST to a backend / CRM endpoint.
    success.classList.add('show');
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    form.querySelector('.feas-submit').textContent = 'Request Sent ✓';
    form.querySelector('.feas-submit').disabled = true;
  });
});
