const DarkBtn = document.getElementById('dark-btn');
const LightBtn = document.getElementById('light-btn');
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

    window.onscroll = function() {
      if (document.documentElement.scrollTop > 100) {
        toTopBtn.classList.remove('hidden');
      } else {
        toTopBtn.classList.add('hidden');
      }
    }

    toTopBtn.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const navLinks = document.querySelectorAll('aside a');
    const sections = document.querySelectorAll('section');

    const activateLink = () => {
      const index = [...sections].findIndex(
        section => window.scrollY >= section.offsetTop - section.offsetHeight * 0.25 && 
        window.scrollY < section.offsetTop + section.offsetHeight - section.offsetHeight * 0.25
      );
      
      navLinks.forEach(link => link.classList.remove('active-link'));
      navLinks[index].classList.add('active-link');
    };

    window.addEventListener('scroll', activateLink);
    
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
            // avoid re-initializing the same carousel twice
            if (carousel.dataset.carouselReady) return;
            carousel.dataset.carouselReady = 'true';

            const track = carousel.querySelector('.project-carousel-track');
            const slides = Array.from(track.children);
            const prevBtn = carousel.querySelector('.project-carousel-prev');
            const nextBtn = carousel.querySelector('.project-carousel-next');
            const dotsWrap = carousel.querySelector('.project-carousel-dots');

            // only one image? no need for controls
            if (slides.length <= 1) {
                if (prevBtn) prevBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'none';
                if (dotsWrap) dotsWrap.style.display = 'none';
                return;
            }

            let index = 0;

            // build dot indicators
            const dots = slides.map((_, i) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'project-carousel-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `Lihat gambar ${i + 1}`);
                dot.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goTo(i);
                });
                dotsWrap.appendChild(dot);
                return dot;
            });

            function update() {
                track.style.transform = `translateX(-${index * 100}%)`;
                dots.forEach((d, i) => d.classList.toggle('active', i === index));
            }

            function goTo(i) {
                index = (i + slides.length) % slides.length;
                update();
            }

            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                goTo(index - 1);
            });

            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                goTo(index + 1);
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

