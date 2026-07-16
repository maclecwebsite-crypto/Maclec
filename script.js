  (function() {
    const loader = document.getElementById('loadingScreen');
    const body = document.body;
    
    // Remove loading screen after 2 seconds
    setTimeout(function() {
      loader.classList.add('done');
      body.classList.remove('loading');
    }, 2000);
  })();

document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen);

      if (isOpen) {
        nav.style.display = 'flex';
        nav.style.flexDirection = 'column';
        nav.style.position = 'absolute';
        nav.style.top = '100%';
        nav.style.left = '0';
        nav.style.right = '0';
        nav.style.background = 'rgba(6,13,23,0.97)';
        nav.style.padding = '20px 24px';
        nav.style.gap = '16px';
      } else {
        nav.style.display = 'none';
      }
    });
  }

  // Close mobile nav after clicking a link
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 1100 && nav.classList.contains('open')) {
        nav.classList.remove('open');
        nav.style.display = 'none';
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Himalayan river video — pause/play based on visibility for performance
  const video = document.querySelector('.hero-media .hero-video');
  if (video) {
    // If video fails to load, hide it so the fallback image shows through
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





// ---  CAROUSEL & VIDEO MODAL ------
(function () {
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.querySelector('.carousel-arrow--prev');
  const nextBtn = document.querySelector('.carousel-arrow--next');
  const modal = document.getElementById('videoModal');
  const modalPlayer = document.getElementById('videoModalPlayer');
  const modalClose = document.getElementById('videoModalClose');

  if (!track) return;

  const scrollAmount = () => track.clientWidth * 0.8;
  prevBtn.addEventListener('click', () => track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
  nextBtn.addEventListener('click', () => track.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));

  document.querySelectorAll('.carousel-slide').forEach(slide => {
    slide.addEventListener('click', () => {
      const src = slide.getAttribute('data-video');
      modalPlayer.src = src;
      modal.classList.add('open');
      modalPlayer.play();
    });
  });

  function closeModal() {
    modal.classList.remove('open');
    modalPlayer.pause();
    modalPlayer.currentTime = 0;
    modalPlayer.src = '';
  }

  modalClose.addEventListener('click', closeModal);
  modal.querySelector('.video-modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
})();