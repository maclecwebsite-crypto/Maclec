document.addEventListener('DOMContentLoaded', () => {

  // Comparison table — hover a row across all three columns
  const cells = document.querySelectorAll('.tcompare-table .compare-cell[data-row]');
  cells.forEach(cell => {
    const row = cell.getAttribute('data-row');
    cell.addEventListener('mouseenter', () => {
      document.querySelectorAll(`.tcompare-table .compare-cell[data-row="${row}"]`)
        .forEach(c => c.classList.add('compare-cell--row-hover'));
    });
    cell.addEventListener('mouseleave', () => {
      document.querySelectorAll(`.tcompare-table .compare-cell[data-row="${row}"]`)
        .forEach(c => c.classList.remove('compare-cell--row-hover'));
    });
  });

  // Tech hero video — pause/play based on visibility, fallback on error
  const video = document.querySelector('.tech-hero-video');
  if (video) {
    video.addEventListener('error', () => {
      video.style.display = 'none';
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.1 });
    observer.observe(video);
  }
});
