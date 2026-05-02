document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const kategori = urlParams.get('kategori') || 'tamamlandi'; // varsayılan tamamlanan
    
    const baslikEl = document.getElementById("sayfa-basligi");
    const gridEl = document.getElementById("projeler-grid");
    
    let currentLang = localStorage.getItem('lang') || 'tr';

    // Sayfa başlığını ayarla
    if (kategori === 'tamamlandi') {
        baslikEl.setAttribute("data-i18n", "nav_completed_projects");
        baslikEl.textContent = typeof translations !== 'undefined' ? translations[currentLang]["nav_completed_projects"] : "Tamamlanan Projeler";
    } else {
        baslikEl.setAttribute("data-i18n", "nav_ongoing_projects");
        baslikEl.textContent = typeof translations !== 'undefined' ? translations[currentLang]["nav_ongoing_projects"] : "Devam Eden Projeler";
    }

    let projelerData = [];

    // Dil değiştiğinde başlığı ve kartları da güncelle
    document.addEventListener('languageChanged', (e) => {
        currentLang = e.detail.lang;
        const key = kategori === 'tamamlandi' ? 'nav_completed_projects' : 'nav_ongoing_projects';
        baslikEl.textContent = translations[currentLang][key];
        renderProjects();
    });

    // Proje kartı HTML'ini oluştur
    function projeKartiOlustur(proje, id, index = 0) {
        let baslik = currentLang === 'en' ? (proje.baslik_en || proje.baslik) : (proje.baslik_tr || proje.baslik);
        let aciklama = currentLang === 'en' ? (proje.aciklama_en || proje.aciklama) : (proje.aciklama_tr || proje.aciklama);

        let imgHtml = '';
        if (proje.resimUrls && proje.resimUrls.length > 1) {
            const carouselId = `carousel-${id}`;
            let indicators = '';
            let items = '';

            proje.resimUrls.forEach((url, index) => {
                const activeClass = index === 0 ? 'active' : '';
                indicators += `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" class="${activeClass}"></button>`;
                items += `
                    <div class="carousel-item ${activeClass}">
                        <img src="${url}" class="d-block w-100 proje-card-img" style="height: 280px; object-fit: cover;" alt="${baslik}">
                    </div>
                `;
            });

            imgHtml = `
                <div class="px-4 proje-img-wrapper">
                    <div id="${carouselId}" class="carousel slide carousel-fade shadow-sm rounded-4 overflow-hidden" data-bs-ride="carousel">
                        <div class="carousel-indicators">${indicators}</div>
                        <div class="carousel-inner">${items}</div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        </button>
                    </div>
                </div>
            `;
        } else {
            const tekResim = (proje.resimUrls && proje.resimUrls.length > 0) ? proje.resimUrls[0] : (proje.resimUrl || 'images/logo.png');
            imgHtml = `
                <div class="px-4 proje-img-wrapper">
                    <div class="overflow-hidden shadow-sm rounded-4">
                        <img src="${tekResim}" class="w-100 proje-card-img" style="height: 280px; object-fit: cover;" alt="${baslik}">
                    </div>
                </div>
            `;
        }

        // Renk paleti belirleme (index'e göre 0: Beyaz, 1: Lacivert, 2: Mavi)
        let cardStyle = 'background-color: #FFFFFF;';
        let headerStyle = 'bg-white';
        let textStyle = 'text-dark';
        let descStyle = 'text-muted';
        let btnStyle = 'border: 1px solid var(--accent); color: var(--accent); background-color: transparent;';
        let btnHoverClass = 'proje-incele-btn'; 

        // Tüm kartlar beyaz temada olacak
        // Bootstrap col-md-4 class'ı ile her satıra 3 adet proje dizeceğiz.
        return `
            <div class="col-md-4 col-sm-6 mb-4">
                <div class="card h-100 shadow-sm border-0 proje-card-modern" style="${cardStyle}">
                    <div class="${headerStyle} px-4 pt-4 pb-3 text-center">
                        <h5 class="fw-bold ${textStyle} mb-0" style="font-size: 20px;">${baslik}</h5>
                    </div>
                    ${imgHtml}
                    <div class="card-body d-flex flex-column p-4">
                        <p class="${descStyle} flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; font-size: 15px; line-height: 1.6;">${aciklama}</p>
                        <a href="proje-detay.html?id=${id}" class="btn mt-4 w-100 proje-incele-btn" style="border-radius: 8px; font-weight: 600; padding: 12px; ${btnStyle}"><span data-i18n="project_view_btn">${typeof translations !== 'undefined' && translations[currentLang] ? translations[currentLang]['project_view_btn'] : 'Projeyi İncele'}</span> <i class="bi bi-arrow-right ms-2"></i></a>
                    </div>
                </div>
            </div>
        `;
    }

    function renderProjects() {
        if (projelerData.length === 0) {
            gridEl.innerHTML = `
                <div class="col-12 text-center text-muted py-5 mt-5">
                    <i class="bi bi-inbox text-secondary mb-3" style="font-size: 60px; opacity: 0.5;"></i>
                    <h4 class="text-dark">Kayıt Bulunamadı</h4>
                    <p>Bu kategoride henüz yayınlanmış bir proje bulunmuyor.</p>
                </div>`;
            return;
        }

        let html = '';
        projelerData.forEach((p, index) => {
            html += projeKartiOlustur(p.data, p.id, index);
        });
        
        gridEl.innerHTML = html;
        // JS hover effects are removed in favor of CSS .proje-card-modern
    }

    // Firebase'den Verileri Çek (Sıralama ve filtrelemeyi JS ile yapıyoruz, onSnapshot ile anında yüklenir)
    db.collection("projects").onSnapshot((querySnapshot) => {
        projelerData = [];

        querySnapshot.forEach((doc) => {
            const proje = doc.data();
            if (proje.durum === kategori) {
                projelerData.push({ id: doc.id, data: proje });
            }
        });

        // Tarihe göre sıralama (Eğer tarih verisi eksikse 0 kabul edip en sona atar, hata vermez)
        projelerData.sort((a, b) => {
            const timeA = (a.data.createdAt && typeof a.data.createdAt.toMillis === 'function') 
                            ? a.data.createdAt.toMillis() : 0;
            const timeB = (b.data.createdAt && typeof b.data.createdAt.toMillis === 'function') 
                            ? b.data.createdAt.toMillis() : 0;
            return timeB - timeA;
        });

        renderProjects();
    }, (error) => {
        console.error("Projeler yüklenirken hata oluştu:", error);
        gridEl.innerHTML = `<div class="col-12 text-center text-danger py-5"><p>Projeler yüklenirken bir hata oluştu.</p></div>`;
    });
});
