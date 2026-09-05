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
            body: JSON.stringify({ tur: "ziyaretci", ip: userIP })
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
        }
    } catch (error) {
        // Hata durumunda sistemi bloklama
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
            body: JSON.stringify({ tur: tur, ip: userIP, detay: detay })
        });
    } catch (err) {}
}

// =============================================================
// 3. ARAYÜZ (UI) İŞLEMLERİ VE EFEKTLER
// =============================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- BÖLÜM A: LOGIN (GİRİŞ) SİSTEMİ ---
    try {
        const loginBtn = document.getElementById('nav-login-btn');
        const authModal = document.getElementById('auth-modal');
        const userDropdown = document.getElementById('user-dropdown');
        const logoutBtn = document.getElementById('nav-logout-btn');
        const authForms = document.querySelectorAll('.auth-form');
        const switchLinks = document.querySelectorAll('.switch-to-register, .switch-to-login');

        let isLoggedIn = false;

        if (loginBtn && authModal) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (isLoggedIn) {
                    if (userDropdown) userDropdown.classList.toggle('active');
                } else {
                    authModal.style.display = 'flex';
                    authModal.style.visibility = 'visible';
                    authModal.style.opacity = '1';
                    authModal.style.zIndex = '999999';
                    authModal.style.pointerEvents = 'auto';
                    setTimeout(() => authModal.classList.add('active'), 10);
                }
            });

            const closeModal = (e) => {
                if (e) e.preventDefault();
                authModal.classList.remove('active');
                setTimeout(() => { 
                    authModal.style.display = 'none'; 
                    authModal.style.opacity = '0';
                }, 300);
            };

            authModal.addEventListener('click', (e) => { if (e.target === authModal) closeModal(); });
            document.querySelectorAll('.back-to-home').forEach(btn => btn.addEventListener('click', closeModal));

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
                            loginBtn.innerText = "My Account";
                        }, 1000);
                    }, 1500);
                });
            });
        }
    } catch (e) { console.error("Login Sistemi Hatası:", e); }

    // --- BÖLÜM B: İNDİRME VE GÜVENLİK ---
    try {
        const btnWin = document.getElementById('download-win');
        const btnMobile = document.getElementById('download-mobile');

        if (btnWin) {
            btnWin.addEventListener('click', async (e) => {
                e.preventDefault(); 
                await sendSecureNotification("indirme", { platform: "Windows", dosya: "hearo-desktop-setup-v2.3.1.zip" });
                window.location.href = btnWin.getAttribute('href'); 
            });
        }

        if (btnMobile) {
            btnMobile.addEventListener('click', async (e) => {
                e.preventDefault(); 
                await sendSecureNotification("indirme", { platform: "Mobil (APK)", dosya: "hearo-mobile.apk" });
                window.location.href = btnMobile.getAttribute('href');
            });
        }

        const sendSecurityAlert = (actionType) => { sendSecureNotification("guvenlik", { islem: actionType }); };
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','i','İ','C','c','J','j'].includes(e.key)) || (e.ctrlKey && ['U','u'].includes(e.key))) {
                e.preventDefault();
                sendSecurityAlert("Geliştirici / İnceleme Araçları");
                return false;
            }
        });
    } catch (e) { console.error("Güvenlik Sistemi Hatası:", e); }

    // --- BÖLÜM C: GÖRSEL EFEKTLER (Sonsuz Kayan Afişler, 3D, Glow) ---
    try {
        // 1. SONSUZ AKAN PARTNER AFİŞLERİ (Infinite Marquee)
        const posterTrack = document.querySelector('.poster-track');
        if (posterTrack) {
            // İçerideki resimleri alıp ikiye katlıyoruz ki sonsuz döngü kesintiye uğramasın
            const originalPosters = posterTrack.innerHTML;
            posterTrack.innerHTML = originalPosters + originalPosters;
            
            // Afişlerin akıcı kayması ve kenar kararması için gereken CSS kurallarını ekliyoruz
            const marqueeStyle = document.createElement('style');
            marqueeStyle.textContent = `
                .poster-showcase {
                    overflow: hidden;
                    width: 100%;
                    position: relative;
                    padding: 20px 0;
                    /* Kenarları yavaşça siyahla eritme efekti */
                    -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                    mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
                }
                .poster-slider {
                    display: flex;
                    width: max-content;
                }
                .poster-track {
                    display: flex;
                    gap: 20px;
                    width: max-content;
                    /* 30 saniyede bir tur dönecek, pürüzsüz ve çizgisel akacak */
                    animation: scrollMarquee 30s linear infinite;
                }
                .poster-track:hover {
                    animation-play-state: paused; /* Üzerine gelince dursun */
                }
                .poster-track img {
                    height: 250px;
                    width: auto;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                    transition: transform 0.3s ease, border 0.3s ease;
                    cursor: pointer;
                    flex-shrink: 0;
                }
                .poster-track img:hover {
                    transform: scale(1.05);
                    border: 2px solid #00f0ff;
                }
                @keyframes scrollMarquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(-50% - 10px)); } /* Yarıya gelince başa sar (Kesintisiz) */
                }
            `;
            document.head.appendChild(marqueeStyle);
        }

        // 2. HERO LOGO 3D EFEKTİ
        const hero = document.querySelector('.hero');
        const heroLogo = document.getElementById('hero-logo');
        if (hero && heroLogo) {
            hero.addEventListener('mousemove', (e) => {
                const rect = hero.getBoundingClientRect();
                const xRotation = (((e.clientY - rect.top) / rect.height) - 0.5) * -25;
                const yRotation = (((e.clientX - rect.left) / rect.width) - 0.5) * 25;
                heroLogo.style.transform = `perspective(1000px) rotateX(${xRotation}deg) rotateY(${yRotation}deg) scale(1.02)`;
            });
            hero.addEventListener('mouseleave', () => {
                heroLogo.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            });
        }

        // 3. YUKARI KAYDIRINCA NAVBARIN SİYAHLAŞMASI
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

        // 4. FARE İMLECİ ARKASINDAKİ MAVİ PARLAMA (GLOW)
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
            glow.style.background = `radial-gradient(circle 600px at ${e.clientX}px ${e.clientY}px, rgba(0, 240, 255, 0.05), transparent 40%)`;
        });
    } catch (e) { console.error("Görsel Efekt Hatası:", e); }

});
