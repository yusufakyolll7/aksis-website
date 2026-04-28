document.addEventListener("DOMContentLoaded", () => {
    const sonProjelerAlani = document.getElementById("son-projeler-alani");
    if (!sonProjelerAlani) return;

    function projeKartiOlustur(proje, id) {
        // Ana sayfada sade görünüm için sadece ilk fotoğrafı alıyoruz
        const tekResim = (proje.resimUrls && proje.resimUrls.length > 0) ? proje.resimUrls[0] : (proje.resimUrl || 'images/logo.png');
        
        let imgHtml = `
            <div class="px-4 pt-3">
                <div class="overflow-hidden shadow-sm rounded-4">
                    <img src="${tekResim}" class="w-100" style="height: 250px; object-fit: cover; transition: transform 0.5s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" alt="${proje.baslik}">
                </div>
            </div>
        `;

        return `
            <div class="col-lg-4 col-md-6 mb-4">
                <div class="card h-100 shadow-sm border-0" style="border-radius: 12px; transition: transform 0.3s ease, box-shadow 0.3s ease;" onmouseover="this.style.transform='translateY(-8px)'; this.style.boxShadow='0 15px 30px rgba(0,0,0,0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm)';">
                    <div class="bg-white px-4 pt-4 pb-2 text-center">
                        <h5 class="fw-bold mb-0 text-dark" style="font-size: 20px;">${proje.baslik}</h5>
                    </div>
                    ${imgHtml}
                    <div class="card-body d-flex flex-column p-4">
                        <!-- Açıklama metni her kartta aynı yer kaplasın diye min-height verdik ve clamp ile 3 satırda kestik -->
                        <p class="text-muted" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; font-size: 15px; line-height: 1.6; min-height: 72px;">${proje.aciklama}</p>
                        
                        <!-- Butonu her zaman en alta sabitle -->
                        <div class="mt-auto pt-3">
                            <a href="proje-detay.html?id=${id}" class="btn w-100" style="border-radius: 8px; font-weight: 600; padding: 12px; border: 1px solid var(--accent); color: var(--accent); transition: all 0.3s ease;" onmouseover="this.style.background='var(--accent)'; this.style.color='white';" onmouseout="this.style.background='transparent'; this.style.color='var(--accent)';">İncele <i class="bi bi-arrow-right ms-2"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Firebase'den Verileri Çek (Sadece Son 3 Proje)
    db.collection("projects").orderBy("createdAt", "desc").limit(3).onSnapshot((querySnapshot) => {
        if (querySnapshot.empty) {
            sonProjelerAlani.innerHTML = `<div class="col-12 text-center text-muted py-4"><p>Henüz proje bulunmuyor.</p></div>`;
            return;
        }

        let html = '';
        querySnapshot.forEach((doc) => {
            html += projeKartiOlustur(doc.data(), doc.id);
        });
        
        sonProjelerAlani.innerHTML = html;
    }, (error) => {
        console.error("Projeler yüklenirken hata oluştu:", error);
        sonProjelerAlani.innerHTML = `<div class="col-12 text-center text-danger py-4"><p>Projeler yüklenirken bir hata oluştu.</p></div>`;
    });
});
