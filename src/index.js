const DarkBtn = document.getElementById('dark-btn');
const LightBtn = document.getElementById('light-btn');

if (!DarkBtn || !LightBtn) {
  console.warn('[theme] #dark-btn atau #light-btn tidak ditemukan');
}
const html = document.documentElement;

    // Click Sound Effect (using dist/click.mp3)
    const clickSound = new Audio('dist/click.mp3');
    clickSound.volume = 0.5;

    function playClickSound() {
        // clone the node so rapid/overlapping clicks each play their own instance
        const sound = clickSound.cloneNode();
        sound.volume = clickSound.volume;
        sound.play().catch(() => {
            // ignored: browser may block playback before first user gesture
        });
    }

    // Event delegation: catches every clickable <a> or <button>, present now or added later
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button');
        if (target) {
            playClickSound();
        }
    });

    // default dark mode
    if (!localStorage.getItem('theme')) {
        localStorage.setItem('theme', 'dark');
    }

    function applyTheme() {
        const theme = localStorage.getItem('theme');

        if (theme === 'dark') {
            html.classList.add('dark');

            DarkBtn.classList.add('active');
            LightBtn.classList.remove('active');
        } else {
            html.classList.remove('dark');

            LightBtn.classList.add('active');
            DarkBtn.classList.remove('active');
        }
    }

    // load saat page dibuka
    applyTheme();

    DarkBtn.addEventListener('click', () => {
        localStorage.setItem('theme', 'dark');
        applyTheme();
    });

    LightBtn.addEventListener('click', () => {
        localStorage.setItem('theme', 'light');
        applyTheme();
    });

    const toTopBtn = document.getElementById('to-top');

    function updateToTop() {
    if (!toTopBtn) return;
    toTopBtn.classList.toggle('hidden', document.documentElement.scrollTop <= 100);
    }

    let topRaf = null;
    window.addEventListener('scroll', () => {
    if (topRaf !== null) return;
    topRaf = requestAnimationFrame(() => {
        topRaf = null;
        updateToTop();
    });
    }, { passive: true });

    updateToTop();

    if (toTopBtn) {
    toTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    }

    const navLinks = document.querySelectorAll('aside a');
    const sections = document.querySelectorAll('section');

    function activateLink() {
    if (!sections.length || !navLinks.length) return;

    const probe = window.scrollY + window.innerHeight * 0.25;
    let index = -1;

    sections.forEach((section, i) => {
        if (probe >= section.offsetTop && probe < section.offsetTop + section.offsetHeight) {
        index = i;
        }
    });

    // fallback saat di paling atas
    if (index === -1 && window.scrollY < 50) index = 0;

    navLinks.forEach((link, i) => {
        link.classList.toggle('active-link', i === index);
    });
    }

    let spyRaf = null;
    window.addEventListener('scroll', () => {
    if (spyRaf !== null) return;
    spyRaf = requestAnimationFrame(() => {
        spyRaf = null;
        activateLink();
    });
    }, { passive: true });

    window.addEventListener('DOMContentLoaded', activateLink);
    window.addEventListener('load', activateLink);
    
    const tabs = [
        {
            button: document.getElementById('btnSoftware'),
            content: document.getElementById('content-software'),
            title: 'Software Projects',
        },
        {
            button: document.getElementById('btnDesign'),
            content: document.getElementById('content-design'),
            title: 'UI/UX Designs',
        },
        {
            button: document.getElementById('btnGraphic'),
            content: document.getElementById('content-graphic'),
            title: 'Graphic Designs',
        },
        {
            button: document.getElementById('btnCreative'),
            content: document.getElementById('content-creative'),
            title: 'Creative Corner',
        },
    ];

    const projectHeading = document.getElementById('project-heading');

    function activateTab(selectedTab) {
    tabs.forEach((tab) => {
        tab.button.classList.remove('active');
        tab.content.classList.add('hidden');
    });

    selectedTab.button.classList.add('active');
    selectedTab.content.classList.remove('hidden');

    projectHeading.textContent = selectedTab.title;

    // Re-jump card loop untuk panel yang baru terlihat
    if (window.innerWidth <= 1023) {
        requestAnimationFrame(() => {
            const container = selectedTab.content;
            if (container.dataset.loopReady !== 'true') {
                initMobileCardLoops();
                return;
            }
            const realCards = Array.from(container.children).filter(
                (c) => !c.dataset.clone
            );
            if (realCards.length <= 1) return;
            const s = realCards[0].offsetWidth + 12;
            container.style.scrollSnapType = 'none';
            container.scrollLeft = s;
            requestAnimationFrame(() => {
                container.style.scrollSnapType = '';
            });
        });
    }
}

    tabs.forEach((tab) => {
        tab.button.addEventListener('click', () => {
            activateTab(tab);
        });
    });

    window.addEventListener('DOMContentLoaded', () => {
        activateTab(tabs[0]);
    });

    // --- Project Image Carousel (for projects with multiple images, e.g. Graphic Design) ---
    function initProjectCarousels() {
    document.querySelectorAll('.project-carousel').forEach((carousel) => {
        if (carousel.dataset.carouselReady) return;
        carousel.dataset.carouselReady = 'true';

        const track = carousel.querySelector('.project-carousel-track');
        const originalSlides = Array.from(track.children);
        const prevBtn = carousel.querySelector('.project-carousel-prev');
        const nextBtn = carousel.querySelector('.project-carousel-next');
        const dotsWrap = carousel.querySelector('.project-carousel-dots');

        if (originalSlides.length <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (dotsWrap) dotsWrap.style.display = 'none';
            return;
        }

        const N = originalSlides.length;

        // Clone slide terakhir di depan, slide pertama di belakang
        const firstClone = originalSlides[0].cloneNode(true);
        const lastClone = originalSlides[N - 1].cloneNode(true);
        firstClone.setAttribute('aria-hidden', 'true');
        lastClone.setAttribute('aria-hidden', 'true');
        track.appendChild(firstClone);
        track.insertBefore(lastClone, originalSlides[0]);

        // Urutan track sekarang: [clone-last, s0, s1, ..., sN-1, clone-first]
        const total = N + 2;
        let index = 1;              // mulai dari slide asli pertama
        let isTransitioning = false;

        // Set posisi awal tanpa animasi
        track.style.transition = 'none';
        track.style.transform = `translateX(-${index * 100}%)`;
        void track.offsetWidth;     // paksa reflow
        track.style.transition = '';

        // Dots (satu per slide asli)
        const dots = originalSlides.map((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'project-carousel-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Lihat gambar ${i + 1}`);
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isTransitioning) return;
                isTransitioning = true;
                index = i + 1;
                update();
            });
            dotsWrap.appendChild(dot);
            return dot;
        });

        function realIndex() {
            return (index - 1 + N) % N;
        }

        function update() {
            track.style.transform = `translateX(-${index * 100}%)`;
            const ri = realIndex();
            dots.forEach((d, i) => d.classList.toggle('active', i === ri));
        }

        function jumpTo(newIndex) {
            index = newIndex;
            track.style.transition = 'none';
            track.style.transform = `translateX(-${index * 100}%)`;
            void track.offsetWidth;
            track.style.transition = '';
        }

        track.addEventListener('transitionend', (e) => {
            if (e.target !== track) return;
            if (index === 0) {
                // kita di clone-last → lompat diam-diam ke slide terakhir asli
                jumpTo(N);
            } else if (index === total - 1) {
                // kita di clone-first → lompat diam-diam ke slide pertama asli
                jumpTo(1);
            }
            isTransitioning = false;
        });

        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isTransitioning) return;
            isTransitioning = true;
            index -= 1;
            update();
        });

        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isTransitioning) return;
            isTransitioning = true;
            index += 1;
            update();
        });
    });
}

    window.addEventListener('DOMContentLoaded', initProjectCarousels);

// --- Custom Sparkle Cursor ---
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const STAR_PATH = 'M13 0 L16 10 L26 13 L16 16 L13 26 L10 16 L0 13 L10 10 Z';

    // cursor utama: bintang outline, ngikutin mouse
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.innerHTML = `
        <svg viewBox="0 0 26 26" width="26" height="26">
            <path d="${STAR_PATH}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
    `;
    document.body.appendChild(cursor);

    let lastParticleX = 0;
    let lastParticleY = 0;
    const PARTICLE_MIN_DISTANCE = 24; // jarak (px) sebelum spawn particle baru

    function spawnParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'cursor-particle';

    // ukuran acak: campuran kecil & besar biar berasa "buyar"
    const size = Math.random() < 0.5
        ? 3 + Math.random() * 4    // kecil: 3-7px
        : 8 + Math.random() * 10;  // besar: 8-18px

    const startRotate = Math.random() * 360;
    const endRotate = startRotate + (Math.random() * 140 - 70); // muter acak ±70deg tambahan

    particle.style.left = `${x + (Math.random() * 16 - 8)}px`;
    particle.style.top = `${y + (Math.random() * 16 - 8)}px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.setProperty('--start-rotate', `${startRotate}deg`);
    particle.style.setProperty('--end-rotate', `${endRotate}deg`);

    particle.innerHTML = `
        <svg viewBox="0 0 26 26" width="100%" height="100%">
            <path d="${STAR_PATH}" fill="currentColor"/>
        </svg>
    `;
    document.body.appendChild(particle);
    particle.addEventListener('animationend', () => particle.remove());
}

    window.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;

        const dx = e.clientX - lastParticleX;
        const dy = e.clientY - lastParticleY;
        if (Math.hypot(dx, dy) > PARTICLE_MIN_DISTANCE) {
            spawnParticle(e.clientX, e.clientY);
            lastParticleX = e.clientX;
            lastParticleY = e.clientY;
        }
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
}

// Panggil mobile card loops
window.addEventListener('DOMContentLoaded', initMobileCardLoops);
window.addEventListener('resize', () => {
    if (window.innerWidth <= 1023) initMobileCardLoops();
});

// --- Infinite loop untuk card proyek di mobile ---
function initMobileCardLoops() {
    if (window.innerWidth > 1023) return;

    const panels = [
        'content-software',
        'content-design',
        'content-graphic',
        'content-creative',
    ];

    panels.forEach((id) => {
        const container = document.getElementById(id);
        if (!container) return;
        if (container.dataset.loopReady === 'true') {
            const realCards = Array.from(container.children).filter(
                (c) => !c.dataset.clone
            );
            if (realCards.length <= 1) return;
            requestAnimationFrame(() => {
                const s = realCards[0].offsetWidth + 12;
                container.style.scrollSnapType = 'none';
                container.scrollLeft = s;
                requestAnimationFrame(() => {
                    container.style.scrollSnapType = '';
                });
            });
            return;
        }

        const cards = Array.from(container.children);
        if (cards.length <= 1) return;

        const N = cards.length;

        // Clone terakhir ke depan, pertama ke belakang
        const firstClone = cards[0].cloneNode(true);
        const lastClone = cards[N - 1].cloneNode(true);
        firstClone.setAttribute('aria-hidden', 'true');
        lastClone.setAttribute('aria-hidden', 'true');
        firstClone.dataset.clone = 'first';
        lastClone.dataset.clone = 'last';

        container.appendChild(firstClone);
        container.insertBefore(lastClone, cards[0]);

        container.dataset.loopReady = 'true';

        const step = () => cards[0].offsetWidth + 12; // + gap

        // index 0 = clone-last, index 1..N = real, index N+1 = clone-first
        const jumpTo = (index) => {
            const s = step();
            // matikan snap sementara supaya lompatan tidak "ditarik balik"
            const prevSnap = container.style.scrollSnapType;
            container.style.scrollSnapType = 'none';
            container.scrollLeft = index * s;
            requestAnimationFrame(() => {
                container.style.scrollSnapType = prevSnap || '';
            });
        };

        // Mulai dari card pertama yang asli
        requestAnimationFrame(() => jumpTo(1));

        let ticking = false;
        container.addEventListener(
            'scroll',
            () => {
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(() => {
                    ticking = false;

                    const s = step();
                    const pos = container.scrollLeft;

                    // Mendekati clone-first (ujung kanan) → lompat ke real first
                    if (pos >= (N + 1) * s - s * 0.35) {
                        jumpTo(1);
                    }
                    // Mendekati clone-last (ujung kiri) → lompat ke real last
                    else if (pos <= s * 0.35) {
                        jumpTo(N);
                    }
                });
            },
            { passive: true }
        );

        // Cegah navigasi kalau user cuma swipe (bukan tap)
        let startX = 0;
        let startY = 0;
        let moved = false;

        container.addEventListener(
            'touchstart',
            (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                moved = false;
            },
            { passive: true }
        );

        container.addEventListener(
            'touchmove',
            (e) => {
                const dx = Math.abs(e.touches[0].clientX - startX);
                const dy = Math.abs(e.touches[0].clientY - startY);
                if (dx > 10 || dy > 10) moved = true;
            },
            { passive: true }
        );

        container.addEventListener(
            'click',
            (e) => {
                if (window.innerWidth > 1023) return;

                // Elemen yang tetap boleh diklik di mobile
                if (e.target.closest('.project-details-btn')) return;
                if (e.target.closest('.project-carousel-btn')) return;
                if (e.target.closest('.project-carousel-dot')) return;

                // Selain itu, blokir (biar tap card tidak navigasi)
                e.preventDefault();
                e.stopPropagation();
            },
            true
        );
    });
}

// // --- Floating background card suit icons (gerak acak, saling menghindar) ---
// document.addEventListener('DOMContentLoaded', () => {
//     const icons = document.querySelectorAll('.card-suit');
//     if (!icons.length) return;

//     const SPEED = 1.5; // px/detik, konstan & pelan

//     const state = Array.from(icons).map((el) => {
//         const rect = el.getBoundingClientRect();
//         const radius = rect.width / 2;
//         const angle = Math.random() * Math.PI * 2;
//         return {
//             el,
//             radius,
//             cx: rect.left + radius,
//             cy: rect.top + radius,
//             vx: Math.cos(angle) * SPEED,
//             vy: Math.sin(angle) * SPEED,
//         };
//     });

//     let lastTime = performance.now();

//     function step(now) {
//         const dt = Math.min((now - lastTime) / 1000, 0.05);
//         lastTime = now;

//         // saling menghindar: kalau 2 icon kedeketan, dorong pelan-pelan menjauh
//         for (let i = 0; i < state.length; i++) {
//             for (let j = i + 1; j < state.length; j++) {
//                 const a = state[i];
//                 const b = state[j];
//                 const dx = b.cx - a.cx;
//                 const dy = b.cy - a.cy;
//                 const dist = Math.max(Math.hypot(dx, dy), 0.01);
//                 const minDist = (a.radius + b.radius) * 0.95;

//                 if (dist < minDist) {
//                     const nx = dx / dist;
//                     const ny = dy / dist;
//                     const overlap = minDist - dist;
//                     a.cx -= nx * overlap * 0.5;
//                     a.cy -= ny * overlap * 0.5;
//                     b.cx += nx * overlap * 0.5;
//                     b.cy += ny * overlap * 0.5;
//                 }
//             }
//         }

//         // gerak + mantul di tepi layar
//         state.forEach((s) => {
//             s.cx += s.vx * dt;
//             s.cy += s.vy * dt;

//             const minX = s.radius;
//             const maxX = window.innerWidth - s.radius;
//             const minY = s.radius;
//             const maxY = window.innerHeight - s.radius;

//             if (s.cx < minX) { s.cx = minX; s.vx = Math.abs(s.vx); }
//             if (s.cx > maxX) { s.cx = maxX; s.vx = -Math.abs(s.vx); }
//             if (s.cy < minY) { s.cy = minY; s.vy = Math.abs(s.vy); }
//             if (s.cy > maxY) { s.cy = maxY; s.vy = -Math.abs(s.vy); }

//             s.el.style.transform = `translate(${s.cx - s.radius}px, ${s.cy - s.radius}px)`;
//         });

//         requestAnimationFrame(step);
//     }

//     requestAnimationFrame(step);
// });

// --- Project Details Modal ---
function initProjectModal() {
  if (document.getElementById('project-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'project-modal';
  modal.className = 'project-modal';
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="project-modal-backdrop" data-modal-close></div>
    <div class="project-modal-panel" role="dialog" aria-modal="true" aria-labelledby="project-modal-title" tabindex="-1">
      <button class="project-modal-close" type="button" data-modal-close aria-label="Tutup">&times;</button>
      <div class="project-modal-media">
        <img class="project-modal-img" alt="">
        <button type="button" class="project-modal-nav project-modal-nav-prev" aria-label="Gambar sebelumnya" hidden>&lsaquo;</button>
        <button type="button" class="project-modal-nav project-modal-nav-next" aria-label="Gambar berikutnya" hidden>&rsaquo;</button>
        <div class="project-modal-dots" hidden></div>
      </div>
      <div class="project-modal-body">
        <div>
          <h2 id="project-modal-title" class="project-modal-title"></h2>
          <span class="project-modal-date"></span>
        </div>
        <p class="project-modal-desc"></p>
        <div class="project-modal-badges"></div>
        <a class="project-modal-link" href="#" target="_blank" rel="noopener">Visit Project &rarr;</a>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const panel = modal.querySelector('.project-modal-panel');
  const imgEl = modal.querySelector('.project-modal-img');
  const prevImgBtn = modal.querySelector('.project-modal-nav-prev');
  const nextImgBtn = modal.querySelector('.project-modal-nav-next');
  const dotsWrap = modal.querySelector('.project-modal-dots');
  const titleEl = modal.querySelector('.project-modal-title');
  const dateEl = modal.querySelector('.project-modal-date');
  const descEl = modal.querySelector('.project-modal-desc');
  const badgesEl = modal.querySelector('.project-modal-badges');
  const linkEl = modal.querySelector('.project-modal-link');

  let lastFocus = null;
  let images = [];
  let imgIndex = 0;

  function renderImage() {
    if (!images.length) {
      imgEl.removeAttribute('src');
      imgEl.style.visibility = 'hidden';
      prevImgBtn.hidden = true;
      nextImgBtn.hidden = true;
      dotsWrap.hidden = true;
      return;
    }

    imgEl.style.visibility = '';
    imgEl.src = images[imgIndex];

    const multi = images.length > 1;
    prevImgBtn.hidden = !multi;
    nextImgBtn.hidden = !multi;
    dotsWrap.hidden = !multi;

    if (multi) {
      dotsWrap.innerHTML = '';
      images.forEach((_, i) => {
        const d = document.createElement('button');
        d.type = 'button';
        d.className = 'project-modal-dot' + (i === imgIndex ? ' active' : '');
        d.setAttribute('aria-label', `Gambar ${i + 1}`);
        d.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          imgIndex = i;
          renderImage();
        });
        dotsWrap.appendChild(d);
      });
    }
  }

  prevImgBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length < 2) return;
    imgIndex = (imgIndex - 1 + images.length) % images.length;
    renderImage();
  });

  nextImgBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length < 2) return;
    imgIndex = (imgIndex + 1) % images.length;
    renderImage();
  });

  function openModal(card) {
    const titleWrap = card.querySelector('.project-card-inner h2')?.parentElement;
    const title = titleWrap?.querySelector('h2')?.textContent.trim() || '';
    const date = titleWrap?.querySelector('span')?.textContent.trim() || '';
    const desc = card.querySelector('.project-card-inner p')?.textContent.trim() || '';

        // Kumpulkan semua gambar — carousel kalau ada, kalau tidak single image
    const carousel = card.querySelector('.project-carousel');
    let imgEls = [];
    if (carousel) {
      // Ambil hanya slide asli; clone loop ditandai aria-hidden="true"
      imgEls = Array.from(
        carousel.querySelectorAll(
          '.project-carousel-slide:not([aria-hidden="true"]) img'
        )
      );
    } else {
      const single = card.querySelector('img.project-card-img');
      if (single) imgEls = [single];
    }

    // Dedupe berdasarkan src — safety net kalau masih ada duplikat
    const seen = new Set();
    images = imgEls
      .map((el) => el.getAttribute('src'))
      .filter((src) => {
        if (!src || seen.has(src)) return false;
        seen.add(src);
        return true;
      });

    imgIndex = 0;

    const anchor = card.closest('a');
    const href = anchor?.href || '';

    const badges = Array.from(card.querySelectorAll('.project-card-badges span')).map(b => {
      const cs = getComputedStyle(b);
      return { text: b.textContent.trim(), bg: cs.backgroundColor, color: cs.color };
    });

    titleEl.textContent = title;
    dateEl.textContent = date;
    descEl.textContent = desc;

    if (href && href !== '#' && !href.endsWith('#')) {
      linkEl.href = href;
      linkEl.style.display = '';
    } else {
      linkEl.style.display = 'none';
    }

    renderImage();

    badgesEl.innerHTML = '';
    badges.forEach(b => {
      const s = document.createElement('span');
      s.className = 'project-modal-badge';
      s.textContent = b.text;
      s.style.background = b.bg;
      s.style.color = b.color;
      badgesEl.appendChild(s);
    });

    lastFocus = document.activeElement;
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    panel.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { modal.hidden = true; }, 220);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  modal.addEventListener('click', (e) => {
    if (e.target.closest('[data-modal-close]')) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
    if (modal.hidden) return;
    if (e.key === 'ArrowLeft' && images.length > 1) {
      imgIndex = (imgIndex - 1 + images.length) % images.length;
      renderImage();
    }
    if (e.key === 'ArrowRight' && images.length > 1) {
      imgIndex = (imgIndex + 1) % images.length;
      renderImage();
    }
  });

  // Inject tombol Details ke setiap card
  document.querySelectorAll('.project-card-outer').forEach((card) => {
    if (card.querySelector('.project-details-btn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'project-details-btn';
    btn.textContent = 'Details';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openModal(card);
    });
    const inner = card.querySelector('.project-card-inner');
    if (inner) inner.appendChild(btn);
  });
}

window.addEventListener('DOMContentLoaded', initProjectModal);