console.log('HEARO UI Loaded.');

// 3D Tilt Effect for Hero Logo AND Poster Showcase
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.hero');
    const heroLogo = document.getElementById('hero-logo');
    const posterShowcase = document.querySelector('.poster-showcase');

    // Helper function for tilt
    const applyTilt = (container, element, intensity = 20) => {
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xRotation = ((y / rect.height) - 0.5) * -intensity;
            const yRotation = ((x / rect.width) - 0.5) * intensity;

            element.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg) scale(1.02)`;
        });

        container.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    };

    if (hero && heroLogo) {
        applyTilt(hero, heroLogo, 25);
    }

    if (posterShowcase) {
        const slider = posterShowcase.querySelector('.poster-slider');
        if (slider) {
            slider.style.transition = 'transform 0.1s ease-out';
            applyTilt(posterShowcase, slider, 15);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(5, 5, 5, 0.95)';
                navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
            } else {
                navbar.style.background = 'rgba(5, 5, 5, 0.8)';
                navbar.style.boxShadow = 'none';
            }
        });
    }

    // Smooth Scroll for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // AUTH MODAL LOGIC
    const loginBtn = document.getElementById('nav-login-btn');
    const authModal = document.getElementById('auth-modal');
    const userDropdown = document.getElementById('user-dropdown');
    const logoutBtn = document.getElementById('nav-logout-btn');
    const backToHomeBtns = document.querySelectorAll('.back-to-home');
    const authForms = document.querySelectorAll('.auth-form');
    const switchLinks = document.querySelectorAll('.switch-to-register, .switch-to-login');

    let isLoggedIn = false;

    if (loginBtn && authModal) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (isLoggedIn) {
                userDropdown && userDropdown.classList.toggle('active');
            } else {
                authModal.style.display = 'flex';
                setTimeout(() => authModal.classList.add('active'), 10);
            }
        });

        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                isLoggedIn = false;
                loginBtn.innerText = 'Login';
                loginBtn.href = '#';
                userDropdown && userDropdown.classList.remove('active');
            });
        }

        document.addEventListener('click', (e) => {
            if (userDropdown && !loginBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });

        const closeModal = (e) => {
            if (e) e.preventDefault();
            authModal.classList.remove('active');
            setTimeout(() => { authModal.style.display = 'none'; }, 300);
        };

        backToHomeBtns.forEach(btn => btn.addEventListener('click', closeModal));
        authModal.addEventListener('click', (e) => { if (e.target === authModal) closeModal(); });

        switchLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                authForms.forEach(form => form.classList.remove('active'));
                if (link.classList.contains('switch-to-register')) {
                    document.getElementById('register-form').classList.add('active');
                } else {
                    document.getElementById('login-form').classList.add('active');
                }
            });
        });

        authForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const btn = form.querySelector('button');
                const originalText = btn.innerText;
                btn.innerText = 'Processing...';
                setTimeout(() => {
                    btn.innerText = 'Success!';
                    setTimeout(() => {
                        closeModal();
                        btn.innerText = originalText;
                        isLoggedIn = true;
                        let displayName = "My Account";
                        if (form.id === 'register-form') {
                            const usernameInput = form.querySelector('input[type="text"]');
                            if (usernameInput && usernameInput.value) displayName = usernameInput.value;
                        } else if (form.id === 'login-form') {
                            const emailInput = form.querySelector('input[type="email"]');
                            if (emailInput && emailInput.value) displayName = emailInput.value.split('@')[0];
                        }
                        loginBtn.innerText = displayName;
                        loginBtn.href = '#';
                    }, 1000);
                }, 1500);
            });
        });
    }

    // LOAD MORE LOGIC FOR LIVE ROOMS
    const btnLoadMore = document.getElementById('btn-load-more');
    if (btnLoadMore) {
        btnLoadMore.addEventListener('click', () => {
            const hiddenCards = document.querySelectorAll('.room-card-hidden');
            if (hiddenCards.length === 0) return;

            btnLoadMore.innerText = "Loading...";
            btnLoadMore.style.opacity = "0.7";
            btnLoadMore.style.pointerEvents = "none";

            setTimeout(() => {
                hiddenCards.forEach(card => {
                    card.style.display = 'flex';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.animate([
                        { opacity: 0, transform: 'translateY(20px)' },
                        { opacity: 1, transform: 'translateY(0)' }
                    ], { duration: 500, easing: 'ease-out', fill: 'forwards' });
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                });
                btnLoadMore.style.display = 'none';
            }, 500);
        });
    }
});

// Premium Mouse Follow Glow (Cyan for HEARO)
document.addEventListener('DOMContentLoaded', () => {
    const glow = document.createElement('div');
    glow.style.position = 'fixed';
    glow.style.top = '0';
    glow.style.left = '0';
    glow.style.width = '100vw';
    glow.style.height = '100vh';
    glow.style.pointerEvents = 'none';
    glow.style.zIndex = '9999';
    glow.style.transition = 'background 0.1s ease';
    document.body.appendChild(glow);

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        glow.style.background = `radial-gradient(circle 600px at ${x}px ${y}px, rgba(0, 240, 255, 0.05), transparent 40%)`;
    });
});
