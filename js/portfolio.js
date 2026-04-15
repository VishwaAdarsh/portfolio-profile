/* ===================================================================
   ADARSH VISHWAKARMA – PORTFOLIO JS ENGINE
   Canvas particles, cursor glow, magnetic buttons, modals, Easter egg
   =================================================================== */

(function () {
    'use strict';

    // ── UTILITY ──────────────────────────────────────────────────────
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // ── THEME TOGGLE ─────────────────────────────────────────────────
    const themeToggle = $('#themeToggle');
    const themeIcon = themeToggle?.querySelector('i');

    function setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('portfolio-theme', theme);
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        }
    }

    // Default to dark
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    setTheme(savedTheme);

    themeToggle?.addEventListener('click', () => {
        const current = document.body.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
    });

    // ── NAVBAR SCROLL ────────────────────────────────────────────────
    const navbar = $('#navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        navbar?.classList.toggle('scrolled', scrollY > 50);
        lastScroll = scrollY;
    }, { passive: true });

    // ── MOBILE MENU ──────────────────────────────────────────────────
    const hamburger = $('#hamburger');
    const navLinks = $('#navLinks');

    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks?.classList.toggle('active');
    });

    $$('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navLinks?.classList.remove('active');
        });
    });

    // Active nav link on scroll
    const sections = $$('section[id]');
    function updateActiveNav() {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = $(`.nav-link[href="#${id}"]`);
            if (link) {
                link.classList.toggle('active', scrollY >= top && scrollY < top + height);
            }
        });
    }
    window.addEventListener('scroll', updateActiveNav, { passive: true });

    // Smooth scroll with offset
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = $(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const pos = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: pos, behavior: 'smooth' });
            }
        });
    });

    // ── CURSOR GLOW ──────────────────────────────────────────────────
    const cursorGlow = $('#cursorGlow');
    let glowX = mouseX, glowY = mouseY;

    if (cursorGlow && window.innerWidth > 768) {
        cursorGlow.classList.add('visible');

        function animateGlow() {
            glowX = lerp(glowX, mouseX, 0.08);
            glowY = lerp(glowY, mouseY, 0.08);
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
            requestAnimationFrame(animateGlow);
        }
        animateGlow();
    }

    // ── CANVAS PARTICLE SYSTEM ───────────────────────────────────────
    const canvas = $('#heroCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const PARTICLE_COUNT = 80;
        const MAX_DIST = 150;

        function resizeCanvas() {
            const hero = canvas.parentElement;
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
        }

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2 + 0.5;
                this.alpha = Math.random() * 0.5 + 0.2;
            }
            update() {
                // Subtle mouse attraction
                const heroRect = canvas.getBoundingClientRect();
                const mx = mouseX - heroRect.left;
                const my = mouseY - heroRect.top;
                const dx = mx - this.x;
                const dy = my - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    this.vx += dx * 0.00005;
                    this.vy += dy * 0.00005;
                }

                this.x += this.vx;
                this.y += this.vy;

                // Damping
                this.vx *= 0.999;
                this.vy *= 0.999;

                // Wrap around
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(124, 106, 255, ${this.alpha})`;
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push(new Particle());
            }
        }

        function drawLines() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MAX_DIST) {
                        const alpha = (1 - dist / MAX_DIST) * 0.15;
                        ctx.strokeStyle = `rgba(124, 106, 255, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawLines();
            requestAnimationFrame(animateParticles);
        }

        resizeCanvas();
        initParticles();
        animateParticles();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                resizeCanvas();
                initParticles();
            }, 250);
        });
    }

    // ── MAGNETIC BUTTONS ─────────────────────────────────────────────
    $$('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
            btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            setTimeout(() => { btn.style.transition = ''; }, 400);
        });
    });

    // ── SCROLL REVEAL ────────────────────────────────────────────────
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    $$('.reveal').forEach(el => revealObserver.observe(el));

    // ── ANIMATED COUNTERS ────────────────────────────────────────────
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target, 10);
                const suffix = el.dataset.suffix || '';
                let current = 0;
                const duration = 1500;
                const step = target / (duration / 16);

                function tick() {
                    current += step;
                    if (current >= target) {
                        el.textContent = target + suffix;
                    } else {
                        el.textContent = Math.floor(current) + suffix;
                        requestAnimationFrame(tick);
                    }
                }
                tick();
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    $$('.stat-number[data-target]').forEach(el => counterObserver.observe(el));

    // ── SKILL BAR FILL ───────────────────────────────────────────────
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.dataset.width;
                setTimeout(() => {
                    bar.style.width = width + '%';
                }, 200);
                skillObserver.unobserve(bar);
            }
        });
    }, { threshold: 0.3 });

    $$('.skill-bar-fill').forEach(bar => skillObserver.observe(bar));

    // ── PROJECT MODAL ────────────────────────────────────────────────
    const projectModal = $('#projectModal');
    const modalClose = $('#modalClose');

    const projectData = {
        ecommerce: {
            title: 'E-Commerce Dashboard',
            problem: 'Small businesses need a simple yet powerful way to track inventory, sales, and customer analytics without complex enterprise tools.',
            solution: 'Built a comprehensive dashboard with real-time data visualization, inventory management, and sales tracking using vanilla JavaScript and modern CSS.',
            tech: ['HTML', 'CSS', 'JavaScript', 'Chart.js'],
            result: 'Intuitive dashboard that reduces inventory management time by 40% and provides actionable sales insights at a glance.'
        },
        furniture: {
            title: 'Vishwakarma Furniture — Business Website',
            problem: 'A local furniture business needed an online presence to showcase their custom furniture, aluminium work, and renovation services.',
            solution: 'Designed and built a responsive, professional website with service showcases, project galleries, and easy contact options.',
            tech: ['HTML', 'CSS', 'JavaScript'],
            result: 'Increased customer inquiries by providing a professional digital storefront that highlights craftsmanship and services.'
        },
        travel: {
            title: 'Travel Blog',
            problem: 'Content creators needed a fast, SEO-optimized platform for publishing travel stories with rich media and photo galleries.',
            solution: 'Built with Gatsby and GraphQL, leveraging markdown files for content management with lazy-loaded images and smooth transitions.',
            tech: ['Gatsby', 'GraphQL', 'React', 'Markdown'],
            result: 'Lightning-fast static site with 95+ Lighthouse score and beautiful reading experience for travel content.'
        }
    };

    $$('.project-card[data-project]').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't open modal if clicking on a link
            if (e.target.closest('a')) return;

            const key = card.dataset.project;
            const data = projectData[key];
            if (!data) return;

            $('#modalTitle').textContent = data.title;
            $('#modalProblem').textContent = data.problem;
            $('#modalSolution').textContent = data.solution;
            $('#modalResult').textContent = data.result;

            const techContainer = $('#modalTech');
            techContainer.innerHTML = data.tech.map(t => `<span class="tech-badge">${t}</span>`).join('');

            projectModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        projectModal?.classList.remove('active');
        document.body.style.overflow = '';
    }

    modalClose?.addEventListener('click', closeModal);
    projectModal?.addEventListener('click', (e) => {
        if (e.target === projectModal) closeModal();
    });

    // ── CERTIFICATE FILTERS ──────────────────────────────────────────
    const filterBtns = $$('.cert-filter-btn');
    const certCards = $$('.cert-card[data-year]');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            certCards.forEach(card => {
                if (filter === 'all' || card.dataset.year === filter) {
                    card.classList.remove('hidden');
                    card.style.animation = 'fade-slide-up 0.4s ease forwards';
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ── GALLERY 3D TILT & LIGHTBOX ───────────────────────────────────
    $$('.gallery-item').forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const rotateX = (y - 0.5) * -15;
            const rotateY = (x - 0.5) * 15;
            item.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = 'perspective(500px) rotateX(0) rotateY(0) scale(1)';
            item.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            setTimeout(() => { item.style.transition = ''; }, 500);
        });
    });

    // Lightbox
    const lightbox = $('#lightbox');
    const lightboxImg = $('#lightboxImg');
    const lightboxClose = $('#lightboxClose');

    $$('.gallery-item').forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (img && lightbox) {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    function closeLightbox() {
        lightbox?.classList.remove('active');
        document.body.style.overflow = '';
    }

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // ── CONTACT FORM VALIDATION ──────────────────────────────────────
    const contactForm = $('#contactForm');

    function validateField(input) {
        const group = input.closest('.form-group');
        const value = input.value.trim();
        let isValid = true;

        if (input.type === 'email') {
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        } else {
            isValid = value.length > 0;
        }

        input.classList.toggle('valid', isValid);
        input.classList.toggle('error', !isValid && value.length > 0);
        group?.classList.toggle('has-error', !isValid && value.length > 0);

        return isValid;
    }

    $$('#contactForm input, #contactForm textarea').forEach(input => {
        input.addEventListener('input', () => validateField(input));
        input.addEventListener('blur', () => validateField(input));
    });

    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = $$('#contactForm input, #contactForm textarea');
        let allValid = true;

        inputs.forEach(input => {
            if (!validateField(input)) allValid = false;
        });

        if (allValid) {
            // Show success state
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Message Sent!';
            btn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                contactForm.reset();
                $$('#contactForm input, #contactForm textarea').forEach(i => {
                    i.classList.remove('valid', 'error');
                    i.closest('.form-group')?.classList.remove('has-error');
                });
            }, 2500);
        }
    });

    // ── EASTER EGG — KONAMI CODE ─────────────────────────────────────
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.code === konamiSequence[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiSequence.length) {
                triggerConfetti();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });

    function triggerConfetti() {
        const colors = ['#7c6aff', '#a78bfa', '#22d3ee', '#f472b6', '#fbbf24', '#34d399'];
        const count = 100;

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.top = '-10px';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.width = (Math.random() * 8 + 4) + 'px';
            particle.style.height = (Math.random() * 8 + 4) + 'px';
            particle.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';

            document.body.appendChild(particle);

            const duration = Math.random() * 2000 + 1500;
            const endX = (Math.random() - 0.5) * 300;
            const endY = window.innerHeight + 50;
            const rotation = Math.random() * 720;

            particle.animate([
                { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
                { transform: `translate(${endX}px, ${endY}px) rotate(${rotation}deg)`, opacity: 0 }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => particle.remove();
        }
    }

    // ── ESCAPE KEY HANDLER ───────────────────────────────────────────
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeLightbox();
        }
    });

    // ── INIT LOG ─────────────────────────────────────────────────────
    console.log(
        '%c✦ Adarsh Vishwakarma Portfolio ✦\n%cLoaded successfully. Try the Konami code! ↑↑↓↓←→←→BA',
        'color: #7c6aff; font-size: 16px; font-weight: bold;',
        'color: #22d3ee; font-size: 12px;'
    );

})();
