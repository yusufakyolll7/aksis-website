const firebaseConfig = {
    apiKey: "AIzaSyAwJD6tm7J_ULD-DE07kxbv_dplSqfj8aA",
    authDomain: "aksis-website-f5868.firebaseapp.com",
    projectId: "aksis-website-f5868",
    storageBucket: "aksis-website-f5868.firebasestorage.app",
    messagingSenderId: "214519271211",
    appId: "1:214519271211:web:6686abac5cc3e3320cbf6e",
    measurementId: "G-2M05ZCGDW1"
};

// Firebase başlatma
firebase.initializeApp(firebaseConfig);

// Servisleri dışa aktarma
const db = firebase.firestore();

// Bazı mobil ağlar/tarayıcılar Firestore'un sürekli açık bağlantısını (WebChannel) kesiyor;
// gerekirse otomatik olarak her yerde çalışan long-polling yöntemine geçilsin.
// Not: Çevrimdışı önbellek (enablePersistence) bazı iOS Safari sürümlerinde sorgu takılmasına yol açtığı için kapalı.
db.settings({ experimentalAutoDetectLongPolling: true, merge: true });

// Veriler belirli sürede gelmezse sonsuz yükleniyor göstergesi yerine bağlantı hatası göster
const YUKLEME_ZAMAN_ASIMI_MS = 15000;
function yuklemeZamanAsimiKur(alan, yuklendiMi) {
    setTimeout(() => {
        if (yuklendiMi()) return;
        const t = translations[localStorage.getItem('lang') || 'tr'];
        alan.innerHTML = `
            <div class="col-12 text-center text-muted py-5">
                <i class="bi bi-wifi-off fs-1 d-block mb-3"></i>
                <h5 class="fw-bold text-dark">${t["connection_error"]}</h5>
                <p>${t["connection_error_desc"]}</p>
                <button onclick="window.location.reload()" class="btn btn-outline-primary rounded-pill px-4 mt-2">${t["reload_page"]}</button>
            </div>`;
    }, YUKLEME_ZAMAN_ASIMI_MS);
}

// Auth SDK sadece admin sayfalarında yükleniyor; diğer sayfalarda hata vermemesi için kontrol ediyoruz
const auth = typeof firebase.auth === 'function' ? firebase.auth() : null;

// Firestore'dan gelen metinleri innerHTML ile basmadan önce HTML karakterlerini kaçır (XSS koruması)
function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Sadece http(s) ve site içi görsel yollarına izin ver (javascript: vb. engellenir)
function safeUrl(url) {
    const value = String(url == null ? '' : url).trim();
    if (!/^(https?:\/\/|\.{0,2}\/|images\/)/i.test(value)) return '';
    // Tırnak, parantez ve boşluklar CSS url('...') içinden kaçmayı sağlayabileceği için kodlanıyor
    return value.replace(/['"()<>\s]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}
