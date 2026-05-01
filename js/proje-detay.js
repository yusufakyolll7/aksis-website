document.addEventListener("DOMContentLoaded", () => {
    const detayAlani = document.getElementById("proje-detay-alani");
    
    // URL'den id'yi al
    const urlParams = new URLSearchParams(window.location.search);
    const projeId = urlParams.get("id");

    let currentLang = localStorage.getItem('lang') || 'tr';

    // Dil değiştiğinde sayfayı güncelle
    document.addEventListener('languageChanged', (e) => {
        currentLang = e.detail.lang;
        window.location.reload(); // Detay sayfasında içerik çok dinamik olduğu için reload en güvenlisi
    });

    if (!projeId) {
        detayAlani.innerHTML = `
            <div class="alert alert-danger text-center">
                ${translations[currentLang]["invalid_link"]}
                <br><a href="index.html" class="btn btn-primary mt-3">${translations[currentLang]["back_to_home"]}</a>
            </div>`;
        return;
    }

    // Projeyi çek (onSnapshot ile anında yükleme)
    db.collection("projects").doc(projeId).onSnapshot((doc) => {
        if (!doc.exists) {
            detayAlani.innerHTML = `
                <div class="alert alert-warning text-center shadow-sm rounded-4 border-0 p-5">
                    <i class="bi bi-exclamation-triangle fs-1 text-warning mb-3 d-block"></i>
                    <h4 class="fw-bold">${translations[currentLang]["project_not_found"]}</h4>
                    <p>${translations[currentLang]["project_not_found_desc"]}</p>
                    <button onclick="history.back()" class="btn btn-primary mt-3 px-4 rounded-pill">${translations[currentLang]["project_detail_back"]}</button>
                </div>`;
            return;
        }

        const proje = doc.data();

        // CSS animasyonlarını ve Thumbnail stillerini enjekte et
        if (!document.getElementById("projeDetayStilleri")) {
            const style = document.createElement("style");
            style.id = "projeDetayStilleri";
            style.innerHTML = `
                @keyframes kenBurnsEffect {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
                .proje-detay-img {
                    animation: kenBurnsEffect 20s infinite alternate linear;
                }
                .thumb-btn {
                    width: 90px; 
                    height: 65px; 
                    text-indent: 0; 
                    background: transparent; 
                    border: 3px solid transparent; 
                    border-radius: 10px; 
                    overflow: hidden; 
                    opacity: 0.5; 
                    transition: all 0.3s ease;
                    padding: 0;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .thumb-btn:hover {
                    opacity: 0.8;
                    transform: translateY(-2px);
                }
                .thumb-btn.active {
                    opacity: 1 !important;
                    border-color: var(--accent) !important;
                    transform: scale(1.05);
                    box-shadow: 0 8px 15px rgba(37,99,235,0.3);
                }
            `;
            document.head.appendChild(style);
        }

        // Çoklu resim kontrolü ve Galeri oluşturma
        let imgHtml = '';
        if (proje.resimUrls && proje.resimUrls.length > 1) {
            const carouselId = 'projeDetayCarousel';
            let indicators = '';
            let items = '';
            
            proje.resimUrls.forEach((url, index) => {
                const activeClass = index === 0 ? 'active' : '';
                
                // Küçük resim (Thumbnail) butonları
                indicators += `
                    <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" class="thumb-btn ${activeClass}">
                        <img src="${url}" style="width: 100%; height: 100%; object-fit: cover;" alt="Thumbnail ${index+1}">
                    </button>
                `;
                
                items += `
                    <div class="carousel-item ${activeClass} h-100 d-flex align-items-center justify-content-center">
                        <img src="${url}" class="d-block w-100 proje-detay-img" style="max-height: 750px; height: auto; object-fit: contain;" alt="${proje.baslik}">
                    </div>
                `;
            });

            imgHtml = `
                <div id="${carouselId}" class="carousel slide carousel-fade shadow-sm rounded-4 overflow-hidden bg-light border" data-bs-ride="carousel" data-bs-interval="4000">
                    <div class="carousel-inner">
                        ${items}
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon bg-dark rounded-circle p-3 shadow" aria-hidden="true" style="opacity: 0.9;"></span>
                        <span class="visually-hidden">${translations[currentLang]["project_detail_prev"]}</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                        <span class="carousel-control-next-icon bg-dark rounded-circle p-3 shadow" aria-hidden="true" style="opacity: 0.9;"></span>
                        <span class="visually-hidden">${translations[currentLang]["project_detail_next"]}</span>
                    </button>
                </div>
                
                <!-- Küçük Resimler (Thumbnails) Alt Galeri -->
                <div class="d-flex justify-content-center gap-3 mt-4 flex-wrap">
                    ${indicators}
                </div>
            `;
        } else {
            // Tek resim
            const tekResim = (proje.resimUrls && proje.resimUrls.length > 0) ? proje.resimUrls[0] : (proje.resimUrl || 'images/logo.png');
            imgHtml = `
                <div class="shadow-lg rounded-4 overflow-hidden d-flex align-items-center justify-content-center bg-light border" style="min-height: 300px;">
                    <img src="${tekResim}" class="img-fluid w-100 proje-detay-img" style="max-height: 750px; height: auto; object-fit: contain;" alt="${proje.baslik}">
                </div>
            `;
        }

        // Sayfa başlığını güncelle
        document.title = proje.baslik + ' | Aksis Mühendislik';

        // Detay Sayfası HTML Enjeksiyonu
        detayAlani.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-lg-11">

                    <!-- Üst Navigasyon ve Başlık -->
                    <div class="d-flex align-items-center mb-5">
                        <button onclick="history.back()" class="btn btn-white shadow-sm rounded-circle d-flex align-items-center justify-content-center" style="width: 55px; height: 55px; border: 1px solid #eee; transition: all 0.3s ease;" onmouseover="this.style.background='var(--accent)'; this.style.color='white';" onmouseout="this.style.background='white'; this.style.color='var(--dark)';">
                            <i class="bi bi-arrow-left fs-4"></i>
                        </button>
                        <div class="text-center flex-grow-1 px-4">
                            <h1 class="fw-bold mb-0" style="font-size: 2.2rem; letter-spacing: -0.02em; color: var(--primary);">${proje.baslik}</h1>
                        </div>
                        <div style="width: 55px;"></div> <!-- Dengeleyici -->
                    </div>
                    
                    <!-- Resim Galerisi -->
                    <div class="row justify-content-center mb-5">
                        <div class="col-lg-12">
                            ${imgHtml}
                        </div>
                    </div>

                    <!-- Açıklama Bloğu -->
                    <div class="row justify-content-center">
                        <div class="col-lg-10">
                            <div class="py-4 mt-3" style="border-top: 1px solid rgba(0,0,0,0.05);">
                                <p class="mb-0 text-start" style="line-height: 1.8; font-size: 1.25rem; color: #111827; white-space: pre-wrap; font-weight: 500;">${proje.aciklama}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        `;

        // Küçük resim (thumbnail) aktiflik durumu senkronizasyonu
        if (proje.resimUrls && proje.resimUrls.length > 1) {
            const carouselElement = document.getElementById('projeDetayCarousel');
            if (carouselElement) {
                carouselElement.addEventListener('slide.bs.carousel', function (e) {
                    const thumbs = document.querySelectorAll('.thumb-btn');
                    thumbs.forEach(btn => btn.classList.remove('active'));
                    if (thumbs[e.to]) {
                        thumbs[e.to].classList.add('active');
                    }
                });
            }
        }
        
    }, (error) => {
        console.error("Proje yüklenirken hata oluştu:", error);
        detayAlani.innerHTML = `
            <div class="alert alert-danger text-center shadow-sm rounded-4 border-0 p-5">
                <i class="bi bi-x-circle fs-1 text-danger mb-3 d-block"></i>
                <h4 class="fw-bold">${translations[currentLang]["connection_error"]}</h4>
                <p>${translations[currentLang]["connection_error_desc"]}</p>
                <button onclick="window.location.reload()" class="btn btn-outline-danger mt-3 rounded-pill px-4">${translations[currentLang]["reload_page"]}</button>
            </div>`;
    });
});
