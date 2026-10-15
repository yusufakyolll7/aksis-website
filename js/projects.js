document.addEventListener("DOMContentLoaded", () => {
    const sonProjelerAlani = document.getElementById("son-projeler-alani");
    if (!sonProjelerAlani) return;

    let currentLang = localStorage.getItem('lang') || 'tr';

    let sonProjelerData = [];

    // Dil değiştiğinde projeleri yeniden render et
    document.addEventListener('languageChanged', (e) => {
        currentLang = e.detail.lang;
        renderProjects();
    });

    function projeKartiOlustur(proje, id) {
        // Dil seçimine göre başlık ve açıklama
        let baslik = escapeHtml(currentLang === 'en' ? (proje.baslik_en || proje.baslik) : (proje.baslik_tr || proje.baslik));
        let aciklama = escapeHtml(currentLang === 'en' ? (proje.aciklama_en || proje.aciklama) : (proje.aciklama_tr || proje.aciklama));
        id = encodeURIComponent(id);

        // Ana sayfada sade görünüm için sadece ilk fotoğrafı alıyoruz
        const tekResim = safeUrl((proje.resimUrls && proje.resimUrls.length > 0) ? proje.resimUrls[0] : proje.resimUrl) || 'images/logo.png';
        
        let imgHtml = `
            <div class="px-4 pt-4 proje-img-wrapper">
                <div class="overflow-hidden shadow-sm rounded-4">
                    <img src="${tekResim}" loading="lazy" class="w-100 proje-card-img" style="height: 250px; object-fit: cover;" alt="${baslik}">
                </div>
            </div>
        `;

        return `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card h-100 shadow-sm border-0 proje-card-modern">
                    <div class="bg-white px-4 pt-4 pb-3 text-center d-flex align-items-center justify-content-center" style="height: 100px;">
                        <h5 class="fw-bold mb-0 text-dark" style="font-size: 20px; line-height: 1.3;">${baslik}</h5>
                    </div>
                    ${imgHtml}
                    <div class="card-body d-flex flex-column p-4">
                        <!-- Açıklama metni her kartta aynı yer kaplasın diye min-height verdik ve clamp ile 3 satırda kestik -->
                        <p class="text-muted" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; font-size: 15px; line-height: 1.6; min-height: 72px;">${aciklama}</p>
                        
                        <!-- Butonu her zaman en alta sabitle -->
                        <div class="mt-auto pt-3">
                            <a href="proje-detay.html?id=${id}" class="btn w-100 proje-incele-btn" style="border-radius: 8px; font-weight: 600; padding: 12px; border: 1px solid var(--accent); color: var(--accent);"><span data-i18n="project_view_btn">${typeof translations !== 'undefined' && translations[currentLang] ? translations[currentLang]['project_view_btn'] : 'İncele'}</span> <i class="bi bi-arrow-right ms-2"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderProjects() {
        if (sonProjelerData.length === 0) {
            sonProjelerAlani.innerHTML = `<div class="col-12 text-center text-muted py-4"><p>${translations[currentLang]["projects_empty"]}</p></div>`;
            return;
        }

        let html = '';
        sonProjelerData.forEach((item) => {
            html += projeKartiOlustur(item.data, item.id);
        });
        
        sonProjelerAlani.innerHTML = html;
    }

    const hataGoster = (error) => {
        console.error("Projeler yüklenirken hata oluştu:", error);
        sonProjelerAlani.innerHTML = `<div class="col-12 text-center text-danger py-4"><p>${translations[currentLang]["projects_error"]}</p></div>`;
    };

    const yeniOnce = (a, b) => {
        const t = (p) => (p.data.createdAt && typeof p.data.createdAt.toMillis === 'function') ? p.data.createdAt.toMillis() : 0;
        return t(b) - t(a);
    };

    // Admin panelinden "Ana sayfada göster" (yıldız) seçilen projeler; en fazla 3 tane
    // Hiç seçili proje yoksa son eklenen 3 proje gösterilir
    let sonEklenenlerDinleyici = null;

    db.collection("projects").where("one_cikan", "==", true).onSnapshot((querySnapshot) => {
        // Sunucuya henüz ulaşılamadıysa boş önbelleğe göre karar verme; yükleniyor göstergesi kalsın
        if (querySnapshot.empty && querySnapshot.metadata.fromCache) return;

        if (querySnapshot.empty) {
            if (!sonEklenenlerDinleyici) {
                sonEklenenlerDinleyici = db.collection("projects").orderBy("createdAt", "desc").limit(3).onSnapshot((snap) => {
                    if (snap.empty && snap.metadata.fromCache) return;
                    sonProjelerData = snap.docs.map(doc => ({ id: doc.id, data: doc.data() }));
                    renderProjects();
                }, hataGoster);
            }
            return;
        }

        if (sonEklenenlerDinleyici) {
            sonEklenenlerDinleyici();
            sonEklenenlerDinleyici = null;
        }
        sonProjelerData = querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })).sort(yeniOnce).slice(0, 3);
        renderProjects();
    }, hataGoster);
});
