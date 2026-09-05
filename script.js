const BACKEND_URL = "https://billowing-smoke-cb6b.hearo.workers.dev";
const AUTH_TOKEN = "Bearer hearo_gizli_anahtar_2026";
let userIP = "Bilinmiyor";

// =============================================================
// 1. IP KONTROLÜ VE BAN ENGELLEME SİSTEMİ
// =============================================================
async function initSystem() {
    try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        userIP = ipData.ip ? ipData.ip.trim() : "Bilinmiyor";
    } catch (error) {
        userIP = "Bilinmiyor";
    }

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': AUTH_TOKEN
            },
            body: JSON.stringify({ 
                tur: "ziyaretci",
                ip: userIP
            })
        });
        
        const result = await response.json().catch(() => ({}));

        if (response.status === 403 || result.isBanned === true) {
            document.documentElement.innerHTML = `
                <html>
                <body style="margin:0; background:#050505; display:flex; justify-content:center; align-items:center; height:100vh;">
                    <div style="display:flex; flex-direction:column; color:#ff3366; align-items:center; justify-content:center; font-family:sans-serif; text-align:center;">
                        <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 10px; letter-spacing: 2px;">ACCESS DENIED</h1>
                        <p style="color: #888; font-size: 14px;">Your IP address has been permanently blocked from accessing this server.</p>
                    </div>
                </body>
                </html>`;
            window.stop();
            throw new Error("Erişim Engellendi");
        }
    } catch (error) {
        if (error.message === "Erişim Engellendi") throw error;
    }
}

initSystem();

// =============================================================
// 2. BİLDİRİM VE LOG GÖNDERME YARDIMCISI
// =============================================================
async function sendSecureNotification(tur, detay = {}) {
    try {
        await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': AUTH_TOKEN
            },
            body: JSON.stringify({ 
                tur: tur, 
                ip: userIP,
                detay: detay 
            })
        });
    } catch (err) {
        console.error("Bildirim gönderilemedi:", err);
    }
}

// =============================================================
// 3. ARAYÜZ, GİRİŞ EKRANI (LOGIN) VE GÜVENLİK
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 3D Efektler ve Navbar ---
    const hero = document.querySelector('.hero');
    const heroLogo = document.getElementById('hero-logo');
    const posterShowcase = document.querySelector('.poster-showcase');

    const applyTilt = (container, element, intensity = 20) => {
        if (!container || !element) return;
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

    if (hero && heroLogo) applyTilt(hero, heroLogo, 25);
    if (posterShowcase) {
        const slider = posterShowcase.querySelector('.poster-slider');
        if (slider) {
            slider.style.transition = 'transform 0.1s ease-out';
            applyTilt(posterShowcase, slider, 15);
        }
    }

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

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // --- LOGIN & AUTH MODAL İŞLEMLERİ ---
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
                
                if (form.id === 'login-form') {
                    const usernameInput = form.querySelector('input[type="text"], input[type="email"]');
                    const passwordInput = form.querySelector('input[type="password"]');
                    
                    if (usernameInput && passwordInput) {
                        if (btoa(usernameInput.value.trim()) === 'aGVhcm8=' && btoa(passwordInput.value.trim()) === 'aGVhcm9jaGVja2Vy') {
                            window.location.href = 'checker.html';
                            return; 
                        }
                    }
                }

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
                            const emailInput = form.querySelector('input[type="text"], input[type="email"]');
                            if (emailInput && emailInput.value) displayName = emailInput.value.split('@')[0];
                        }
                        loginBtn.innerText = displayName;
                        loginBtn.href = '#';
                    }, 1000);
                }, 1500);
            });
        });
    }

    // --- Load More İşlemi ---
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

    // --- Glow Efekti ---
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

    // --- İndirme Butonları ---
    const btnWin = document.getElementById('download-win') || document.getElementById('download-windows');
    const btnMobile = document.getElementById('download-mobile');

    if (btnWin) {
        btnWin.addEventListener('click', async (e) => {
            e.preventDefault(); 
            const originalHref = btnWin.getAttribute('href'); 
            await sendSecureNotification("indirme", { platform: "Windows", dosya: "hearo-desktop-setup-v2.3.1.zip" });
            window.location.href = originalHref; 
        });
    }

    if (btnMobile) {
        btnMobile.addEventListener('click', async (e) => {
            e.preventDefault(); 
            const originalHref = btnMobile.getAttribute('href'); 
            await sendSecureNotification("indirme", { platform: "Mobil (APK)", dosya: "hearo-mobile.apk" });
            window.location.href = originalHref;
        });
    }

    // --- Güvenlik: Sağ Tık ve Tuş Engellemeleri ---
    const sendSecurityAlert = (actionType) => {
        sendSecureNotification("guvenlik", { islem: actionType });
    };

    document.addEventListener('contextmenu', e => e.preventDefault());

    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12') {
            e.preventDefault();
            sendSecurityAlert("F12 (Geliştirici Araçları)");
            return false;
        }
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'İ')) {
            e.preventDefault();
            sendSecurityAlert("Ctrl+Shift+I (İncele)");
            return false;
        }
        if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
            e.preventDefault();
            sendSecurityAlert("Ctrl+Shift+C (Öğe Seçici)");
            return false;
        }
        if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
            e.preventDefault();
            sendSecurityAlert("Ctrl+Shift+J (Konsol)");
            return false;
        }
        if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
            e.preventDefault();
            sendSecurityAlert("Ctrl+U (Kaynak Kodu)");
            return false;
        }
    });
});
