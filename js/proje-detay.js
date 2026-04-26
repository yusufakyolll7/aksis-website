document.addEventListener("DOMContentLoaded", async () => {
    const detayAlani = document.getElementById("proje-detay-alani");
    
    // URL'den id'yi al
    const urlParams = new URLSearchParams(window.location.search);
    const projeId = urlParams.get("id");

    if (!projeId) {
        detayAlani.innerHTML = `
            <div class="alert alert-danger text-center">
                Geçersiz proje bağlantısı. Lütfen ana sayfaya dönün.
                <br><a href="index.html" class="btn btn-primary mt-3">Ana Sayfaya Dön</a>
            </div>`;
        return;
    }

    try {
        // Firebase'den projeyi çek
        const doc = await db.collection("projects").doc(projeId).get();

        if (!doc.exists) {
            detayAlani.innerHTML = `
                <div class="alert alert-warning text-center">
                    Aradığınız proje bulunamadı veya silinmiş olabilir.
                    <br><a href="index.html" class="btn btn-primary mt-3">Ana Sayfaya Dön</a>
                </div>`;
            return;
        }

        const proje = doc.data();

        // Çoklu resim kontrolü ve Galeri oluşturma
        let imgHtml = '';
        if (proje.resimUrls && proje.resimUrls.length > 1) {
            const carouselId = 'projeDetayCarousel';
            let indicators = '';
            let items = '';
            
            proje.resimUrls.forEach((url, index) => {
                const activeClass = index === 0 ? 'active' : '';
                indicators += `<button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${index}" class="${activeClass}"></button>`;
                items += `
                    <div class="carousel-item ${activeClass}">
                        <img src="${url}" class="d-block w-100 rounded shadow-sm" style="max-height: 600px; object-fit: contain; background-color: #f8f9fa;" alt="${proje.baslik}">
                    </div>
                `;
            });

            imgHtml = `
                <div id="${carouselId}" class="carousel slide mb-5" data-bs-ride="carousel">
                    <div class="carousel-indicators">
                        ${indicators}
                    </div>
                    <div class="carousel-inner rounded">
                        ${items}
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon bg-dark rounded-circle p-3" aria-hidden="true"></span>
                        <span class="visually-hidden">Önceki</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                        <span class="carousel-control-next-icon bg-dark rounded-circle p-3" aria-hidden="true"></span>
                        <span class="visually-hidden">Sonraki</span>
                    </button>
                </div>
            `;
        } else {
            // Tek resim
            const tekResim = (proje.resimUrls && proje.resimUrls.length > 0) ? proje.resimUrls[0] : (proje.resimUrl || 'images/logo.jpg');
            imgHtml = `<img src="${tekResim}" class="img-fluid rounded shadow-sm mb-5 w-100" style="max-height: 600px; object-fit: contain; background-color: #f8f9fa;" alt="${proje.baslik}">`;
        }

        // Durum Badge
        const durumBadge = proje.durum === 'tamamlandi' 
            ? '<span class="badge bg-success mb-3 fs-6">Tamamlandı</span>' 
            : '<span class="badge bg-warning text-dark mb-3 fs-6">Devam Ediyor</span>';

        // Detay Sayfası Tasarımını Ekrana Bas
        detayAlani.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <div class="text-center mb-5">
                        ${durumBadge}
                        <h1 class="fw-bold display-4 mb-3">${proje.baslik}</h1>
                        <p class="text-muted"><i class="bi bi-calendar3"></i> Eklenme Tarihi: ${proje.createdAt ? proje.createdAt.toDate().toLocaleDateString('tr-TR') : 'Bilinmiyor'}</p>
                    </div>
                    
                    ${imgHtml}
                    
                    <div class="proje-aciklama bg-white p-4 p-md-5 rounded shadow-sm">
                        <h3 class="fw-bold mb-4">Proje Detayları</h3>
                        <p class="fs-5" style="line-height: 1.8; white-space: pre-wrap;">${proje.aciklama}</p>
                    </div>
                    
                    <div class="text-center mt-5">
                        <a href="index.html#projeler" class="btn btn-outline-dark btn-lg">
                            <i class="bi bi-arrow-left"></i> Tüm Projelere Dön
                        </a>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error("Proje yüklenirken hata oluştu:", error);
        detayAlani.innerHTML = `
            <div class="alert alert-danger text-center">
                Proje bilgileri alınırken bir hata oluştu. Lütfen bağlantınızı kontrol edin.
            </div>`;
    }
});
