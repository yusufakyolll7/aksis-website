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
        let baslik = currentLang === 'en' ? (proje.baslik_en || proje.baslik) : (proje.baslik_tr || proje.baslik);
        let aciklama = currentLang === 'en' ? (proje.aciklama_en || proje.aciklama) : (proje.aciklama_tr || proje.aciklama);

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
                .back-btn-custom {
                    color: var(--primary) !important;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) !important;
                }
                .back-btn-custom:hover {
                    color: var(--accent) !important;
                    transform: translateX(-5px);
                    text-shadow: 0 0 12px rgba(37, 99, 235, 0.5);
                }
                .thumb-gallery-container {
                    display: flex;
                    gap: 1rem;
                    overflow-x: auto;
                    padding: 10px 0;
                    margin: 0 auto;
                    max-width: 100%;
                    scroll-behavior: smooth;
                    -webkit-overflow-scrolling: touch;
                    scrollbar-width: none; /* Firefox */
                }
                .thumb-gallery-container::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, Opera */
                }
                .thumb-btn {
                    flex: 0 0 auto;
                    width: 70px; 
                    height: 50px; 
                    text-indent: 0; 
                    background: transparent; 
                    border: 3px solid transparent; 
                    border-radius: 10px; 
                    overflow: hidden; 
                    opacity: 0.5; 
                    transition: all 0.3s ease;
                    padding: 0;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    cursor: pointer;
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
                    <div class="carousel-item ${activeClass} h-100 position-relative">
                        <div class="position-absolute w-100 h-100" style="background-image: url('${url}'); background-size: cover; background-position: center; filter: blur(25px) brightness(0.6); z-index: 0; transform: scale(1.1);"></div>
                        <div class="d-flex align-items-center justify-content-center h-100 position-relative z-1">
                            <img src="${url}" class="d-block proje-detay-img shadow-lg" style="max-height: 55vh; max-width: 100%; object-fit: contain;" alt="${baslik}">
                        </div>
                    </div>
                `;
            });

            imgHtml = `
                <div id="${carouselId}" class="carousel slide carousel-fade shadow-sm rounded-4 overflow-hidden bg-dark border-0" data-bs-ride="carousel" data-bs-interval="4000">
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
                <div class="w-100 d-flex justify-content-center">
                    <div class="thumb-gallery-container mt-3">
                        ${indicators}
                    </div>
                </div>
            `;
        } else {
            // Tek resim
            const tekResim = (proje.resimUrls && proje.resimUrls.length > 0) ? proje.resimUrls[0] : (proje.resimUrl || 'images/logo.png');
            imgHtml = `
                <div class="shadow-lg rounded-4 overflow-hidden position-relative border-0" style="min-height: 300px; background-color: #0f172a;">
                    <div class="position-absolute w-100 h-100" style="background-image: url('${tekResim}'); background-size: cover; background-position: center; filter: blur(25px) brightness(0.6); z-index: 0; transform: scale(1.1);"></div>
                    <div class="d-flex align-items-center justify-content-center position-relative z-1" style="min-height: 300px;">
                        <img src="${tekResim}" class="img-fluid proje-detay-img shadow-lg" style="max-height: 55vh; max-width: 100%; object-fit: contain;" alt="${baslik}">
                    </div>
                </div>
            `;
        }

        // Sayfa başlığını güncelle
        document.title = baslik + ' | Aksis Mühendislik';

        // Detay Sayfası HTML Enjeksiyonu
        detayAlani.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-lg-11">

                    <!-- Üst Navigasyon ve Başlık -->
                    <div class="d-flex align-items-center mb-3">
                        <button onclick="history.back()" class="btn btn-link p-0 border-0 text-decoration-none d-flex align-items-center justify-content-center back-btn-custom" style="width: 40px; height: 40px;">
                            <i class="bi bi-arrow-left fs-3"></i>
                        </button>
                        <div class="text-center flex-grow-1 px-3" style="min-width: 0;">
                            <h1 class="fw-bold mb-0 text-truncate" style="font-size: clamp(1.2rem, 2.5vw, 1.8rem); letter-spacing: -0.02em; color: var(--primary); width: 100%;" title="${baslik}">${baslik}</h1>
                        </div>
                        <div style="width: 40px;"></div> <!-- Dengeleyici -->
                    </div>
                    
                    <!-- Resim Galerisi -->
                    <div class="row justify-content-center mb-4">
                        <div class="col-lg-12">
                            ${imgHtml}
                        </div>
                    </div>

                    <!-- Açıklama Bloğu -->
                    <div class="row justify-content-center">
                        <div class="col-lg-10">
                            <div class="py-4 mt-3" style="border-top: 1px solid rgba(0,0,0,0.05);">
                                <p class="mb-0 text-start" style="line-height: 1.8; font-size: 1.25rem; color: #111827; white-space: pre-wrap; font-weight: 500;">${aciklama}</p>
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
