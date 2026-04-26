document.addEventListener("DOMContentLoaded", () => {
    // Proje container'larını al
    const tamamlananProjelerContainer = document.getElementById("tamamlanan-projeler-alani");
    const devamEdenProjelerContainer = document.getElementById("devam-eden-projeler-alani");

    if(!tamamlananProjelerContainer || !devamEdenProjelerContainer) return;

    // Veritabanından projeleri dinle
    db.collection("projects").orderBy("createdAt", "desc").onSnapshot((querySnapshot) => {
        
        tamamlananProjelerContainer.innerHTML = '';
        devamEdenProjelerContainer.innerHTML = '';

        let tamamlananSayisi = 0;
        let devamEdenSayisi = 0;

        querySnapshot.forEach((doc) => {
            const proje = doc.data();
            const id = doc.id;
            
            // Çoklu resim kontrolü
            let imgHtml = '';
            if (proje.resimUrls && proje.resimUrls.length > 1) {
                // Carousel (Galeri) yapısı
                const carouselId = `carousel-${id}`;
                let indicators = '';
                let items = '';
                
                proje.resimUrls.forEach((url, index) => {
                    const activeClass = index === 0 ? 'active' : '';
                    indicators += `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" class="${activeClass}"></button>`;
                    items += `
                        <div class="carousel-item ${activeClass}">
                            <img src="${url}" class="d-block w-100 card-img-top" style="height: 250px; object-fit: cover;" alt="${proje.baslik}">
                        </div>
                    `;
                });

                imgHtml = `
                    <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
                        <div class="carousel-indicators">
                            ${indicators}
                        </div>
                        <div class="carousel-inner">
                            ${items}
                        </div>
                        <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Önceki</span>
                        </button>
                        <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Sonraki</span>
                        </button>
                    </div>
                `;
            } else {
                // Tek resim yapısı (Eskisi)
                const tekResim = (proje.resimUrls && proje.resimUrls.length > 0) ? proje.resimUrls[0] : (proje.resimUrl || 'images/logo.jpg');
                imgHtml = `<img src="${tekResim}" class="card-img-top" style="height: 250px; object-fit: cover;" alt="${proje.baslik}">`;
            }

            // HTML Kart Tasarımı
            const projeHtml = `
                <div class="col-md-4" data-aos="zoom-in">
                    <div class="card h-100 shadow-sm border-0">
                        ${imgHtml}
                        <div class="card-body d-flex flex-column">
                            <h5 class="fw-bold">${proje.baslik}</h5>
                            <p class="text-muted flex-grow-1">${proje.aciklama}</p>
                            <a href="proje-detay.html?id=${id}" class="btn btn-outline-dark mt-auto w-100">İncele</a>
                        </div>
                    </div>
                </div>
            `;

            if (proje.durum === "tamamlandi") {
                tamamlananProjelerContainer.innerHTML += projeHtml;
                tamamlananSayisi++;
            } else if (proje.durum === "devam_ediyor") {
                devamEdenProjelerContainer.innerHTML += projeHtml;
                devamEdenSayisi++;
            }
        });

        // Eğer proje yoksa mesaj göster
        if(tamamlananSayisi === 0) {
            tamamlananProjelerContainer.innerHTML = '<div class="col-12"><p class="text-muted">Henüz eklenen proje bulunmuyor.</p></div>';
        }
        if(devamEdenSayisi === 0) {
            devamEdenProjelerContainer.innerHTML = '<div class="col-12"><p class="text-muted">Şu an devam eden proje bulunmuyor.</p></div>';
        }
    });
});
