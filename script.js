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

        // Eğer kullanıcı banlıysa içeriği tamamen yok et ve engellenme ekranı göster
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
// 3. İNDİRME VE GÜVENLİK DİNLEYİCİLERİ
// =============================================================
document.addEventListener('DOMContentLoaded', () => {
    const btnWindows = document.getElementById('download-windows') || document.querySelector('.btn-windows');
    const btnMobile = document.getElementById('download-mobile') || document.querySelector('.btn-mobile');

    if (btnWindows) {
        btnWindows.addEventListener('click', async (e) => {
            e.preventDefault(); 
            const originalHref = btnWindows.getAttribute('href'); 
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
