/* ===================================================================
   VISUAL ENHANCEMENT JS — Micro-interactions only
   NO layout changes, NO content changes, NO structure changes
   =================================================================== */

(function () {
    'use strict';

    // ── CURSOR GLOW FOLLOWER ─────────────────────────────────────────
    const cursorGlow = document.getElementById('cursorGlow');
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let glowX = mouseX, glowY = mouseY;

    if (cursorGlow && window.innerWidth > 768) {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        cursorGlow.classList.add('visible');

        function animateGlow() {
            // Smooth lerp follow
            glowX += (mouseX - glowX) * 0.07;
            glowY += (mouseY - glowY) * 0.07;
            cursorGlow.style.left = glowX + 'px';
            cursorGlow.style.top = glowY + 'px';
            requestAnimationFrame(animateGlow);
        }
        animateGlow();
    }

    // ── SUBTLE STAR/PARTICLE BACKGROUND ──────────────────────────────
    const canvas = document.getElementById('bgParticles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const COUNT = 50; // subtle, not overwhelming
        const MAX_DIST = 120;

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        class Dot {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.3; // very slow
                this.vy = (Math.random() - 0.5) * 0.3;
                this.r = Math.random() * 1.5 + 0.5;
                this.alpha = Math.random() * 0.5 + 0.2;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(124, 106, 255, ' + this.alpha + ')';
                ctx.fill();
            }
        }

        function initDots() {
            particles = [];
            for (let i = 0; i < COUNT; i++) particles.push(new Dot());
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < MAX_DIST) {
                        ctx.strokeStyle = 'rgba(124, 106, 255, ' + ((1 - dist / MAX_DIST) * 0.1) + ')';
                        ctx.lineWidth = 0.4;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            drawConnections();
            requestAnimationFrame(loop);
        }

        resize();
        initDots();
        loop();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => { resize(); initDots(); }, 300);
        });
    }

    // ── MAGNETIC BUTTONS (very light effect) ─────────────────────────
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            // Light pull — only 15% of distance
            btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // ── EDUCATION TIMELINE GLOW ON SCROLL ────────────────────────────
    const eduItems = document.querySelectorAll('.education-item');
    if (eduItems.length > 0) {
        const eduObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                entry.target.classList.toggle('glow', entry.isIntersecting);
            });
        }, { threshold: 0.5 });

        eduItems.forEach(item => eduObserver.observe(item));
    }

    // ── PROJECT CARD SUBTLE TILT ON HOVER ────────────────────────────
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const rotateX = (y - 0.5) * -6;  // very subtle
            const rotateY = (x - 0.5) * 6;
            card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-6px)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ── GALLERY ITEM SUBTLE TILT ─────────────────────────────────────
    document.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            const rotateX = (y - 0.5) * -8;
            const rotateY = (x - 0.5) * 8;
            item.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
        });

        item.addEventListener('mouseleave', () => {
            item.style.transform = '';
        });
    });

    // ── NAVBAR SCROLL STATE ──────────────────────────────────────────
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });

        // Apply immediately if already scrolled
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }

    // ── DONE ─────────────────────────────────────────────────────────
    console.log('%c✦ Visual Enhancement Layer Loaded', 'color: #7c6aff; font-weight: bold;');

})();
