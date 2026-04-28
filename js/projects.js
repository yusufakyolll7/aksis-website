document.addEventListener("DOMContentLoaded", () => {
    const tamamlananContainer = document.getElementById("tamamlanan-projeler-alani");
    const devamEdenContainer = document.getElementById("devam-eden-projeler-alani");

    if (!tamamlananContainer || !devamEdenContainer) return;

    // Tek bir proje kartı HTML'i oluştur
    function projeKartiOlustur(proje, id) {
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
                        <img src="${url}" class="d-block w-100 card-img-top" style="height: 250px; object-fit: cover;" alt="${proje.baslik}">
                    </div>
                `;
            });

            imgHtml = `
                <div id="${carouselId}" class="carousel slide" data-bs-ride="carousel">
                    <div class="carousel-indicators">${indicators}</div>
                    <div class="carousel-inner">${items}</div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                    </button>
                </div>
            `;
        } else {
            const tekResim = (proje.resimUrls && proje.resimUrls.length > 0) ? proje.resimUrls[0] : (proje.resimUrl || 'images/logo.png');
            imgHtml = `<img src="${tekResim}" class="card-img-top" style="height: 250px; object-fit: cover;" alt="${proje.baslik}">`;
        }

        return `
            <div style="flex: 0 0 33.333%; max-width: 33.333%; padding: 0 12px; box-sizing: border-box;">
                <div class="card" style="height: 460px;">
                    ${imgHtml}
                    <div class="card-body d-flex flex-column">
                        <h5 class="fw-bold">${proje.baslik}</h5>
                        <p class="text-muted flex-grow-1" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${proje.aciklama}</p>
                        <a href="proje-detay.html?id=${id}" class="btn btn-outline-dark mt-auto w-100">İncele</a>
                    </div>
                </div>
            </div>
        `;
    }

    // Sayfalı proje listesi oluştur
    function sayfaliListeOlustur(projeler, container) {
        if (projeler.length === 0) {
            container.innerHTML = '<p class="text-muted">Henüz eklenen proje bulunmuyor.</p>';
            return;
        }

        const SAYFA_BASINA = 3;
        let mevcutSayfa = 0;
        const toplamSayfa = Math.ceil(projeler.length / SAYFA_BASINA);

        function sayfayiGoster(yon) {
            const kartAlani = container.querySelector('.proje-kart-alani');

            function icerigiOlustur() {
                const baslangic = mevcutSayfa * SAYFA_BASINA;
                const bitis = baslangic + SAYFA_BASINA;
                const sayfaProjeler = projeler.slice(baslangic, bitis);

                let kartlarHtml = '';
                sayfaProjeler.forEach(p => {
                    kartlarHtml += projeKartiOlustur(p.data, p.id);
                });
                // Eksik slotları ghost div ile doldur (her zaman 3 slot görünsün)
                const eksik = SAYFA_BASINA - sayfaProjeler.length;
                for (let i = 0; i < eksik; i++) {
                    kartlarHtml += `<div style="flex: 0 0 33.333%; max-width: 33.333%; padding: 0 12px; box-sizing: border-box; visibility: hidden;"><div style="height: 460px;"></div></div>`;
                }

                const kartDiv = container.querySelector('.proje-kart-alani');
                if (kartDiv) {
                    kartDiv.innerHTML = kartlarHtml;
                    // Kayma yönüne göre başlangıç
                    const kaymaDegeri = yon === 'sag' ? '30px' : yon === 'sol' ? '-30px' : '0px';
                    kartDiv.style.transform = `translateX(${kaymaDegeri})`;
                    kartDiv.style.opacity = '0';
                    // Animasyonu tetikle
                    requestAnimationFrame(() => {
                        kartDiv.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
                        kartDiv.style.transform = 'translateX(0)';
                        kartDiv.style.opacity = '1';
                    });
                }

                // Sayfalama butonlarını güncelle
                const oncekiBtn = container.querySelector('.proje-onceki');
                const sonrakiBtn = container.querySelector('.proje-sonraki');
                const sayfaBilgi = container.querySelector('.proje-sayfa-bilgi');
                if (oncekiBtn) oncekiBtn.style.setProperty('display', mevcutSayfa === 0 ? 'none' : 'flex', 'important');
                if (sonrakiBtn) sonrakiBtn.style.setProperty('display', mevcutSayfa === toplamSayfa - 1 ? 'none' : 'flex', 'important');
                if (sayfaBilgi) sayfaBilgi.textContent = `${mevcutSayfa + 1} / ${toplamSayfa}`;
            }

            // İlk yükleme veya animasyonlu geçiş
            if (!kartAlani || !yon) {
                // İlk yükleme — tüm yapıyı oluştur
                let html = `
                    <div class="position-relative px-md-5 px-4">
                        <div class="proje-kart-alani" style="display: flex; flex-wrap: nowrap; gap: 0; transition: opacity 0.35s ease, transform 0.35s ease;">`;
                
                const baslangic = mevcutSayfa * SAYFA_BASINA;
                const sayfaProjeler = projeler.slice(baslangic, baslangic + SAYFA_BASINA);
                sayfaProjeler.forEach(p => { html += projeKartiOlustur(p.data, p.id); });
                
                // Eksik slotları ghost div ile doldur
                const eksikIlk = SAYFA_BASINA - sayfaProjeler.length;
                for (let i = 0; i < eksikIlk; i++) {
                    html += `<div style="flex: 0 0 33.333%; max-width: 33.333%; padding: 0 12px; box-sizing: border-box; visibility: hidden;"><div style="height: 460px;"></div></div>`;
                }
                html += `</div>`; // .proje-kart-alani bitti

                if (toplamSayfa > 1) {
                    html += `
                        <button class="btn btn-light shadow-sm rounded-circle proje-onceki position-absolute align-items-center justify-content-center" style="width: 40px; height: 40px; left: 0; top: calc(50% - 30px); transform: translateY(-50%); z-index: 10; display: ${mevcutSayfa === 0 ? 'none' : 'flex'} !important;">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        <button class="btn btn-light shadow-sm rounded-circle proje-sonraki position-absolute align-items-center justify-content-center" style="width: 40px; height: 40px; right: 0; top: calc(50% - 30px); transform: translateY(-50%); z-index: 10; display: ${mevcutSayfa === toplamSayfa - 1 ? 'none' : 'flex'} !important;">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                        <div class="text-center mt-3">
                            <span class="mx-3 text-muted proje-sayfa-bilgi" style="font-size: 14px; font-weight: 500;">${mevcutSayfa + 1} / ${toplamSayfa}</span>
                        </div>
                    `;
                }
                html += `</div>`; // .position-relative bitti
                container.innerHTML = html;

                // Buton eventlerini bağla
                const oncekiBtn = container.querySelector('.proje-onceki');
                const sonrakiBtn = container.querySelector('.proje-sonraki');
                if (oncekiBtn) {
                    oncekiBtn.addEventListener('click', () => {
                        if (mevcutSayfa > 0) { mevcutSayfa--; sayfayiGoster('sol'); }
                    });
                }
                if (sonrakiBtn) {
                    sonrakiBtn.addEventListener('click', () => {
                        if (mevcutSayfa < toplamSayfa - 1) { mevcutSayfa++; sayfayiGoster('sag'); }
                    });
                }
            } else {
                // Sayfa geçişi — fade out, değiştir, fade in
                kartAlani.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
                const kaymaCikis = yon === 'sag' ? '-30px' : '30px';
                kartAlani.style.transform = `translateX(${kaymaCikis})`;
                kartAlani.style.opacity = '0';
                setTimeout(() => icerigiOlustur(), 200);
            }
        }

        sayfayiGoster();
    }

    // Firebase'den projeleri dinle
    db.collection("projects").orderBy("createdAt", "desc").onSnapshot((querySnapshot) => {
        const tamamlanan = [];
        const devamEden = [];

        querySnapshot.forEach((doc) => {
            const proje = doc.data();
            if (proje.durum === "tamamlandi") {
                tamamlanan.push({ id: doc.id, data: proje });
            } else if (proje.durum === "devam_ediyor") {
                devamEden.push({ id: doc.id, data: proje });
            }
        });

        sayfaliListeOlustur(tamamlanan, tamamlananContainer);
        sayfaliListeOlustur(devamEden, devamEdenContainer);
    });
});
