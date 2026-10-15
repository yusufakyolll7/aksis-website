document.addEventListener('DOMContentLoaded', () => {
    // Auth Kontrolü
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'index.html'; // Giriş yapmamışsa logine at
        } else {
            document.body.classList.remove('auth-pending'); // Oturum doğrulandı, paneli göster
        }
    });

    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        });
    });

    const tableBody = document.getElementById('projects-table-body');
    const addProjectForm = document.getElementById('add-project-form');
    const saveProjectBtn = document.getElementById('save-project-btn');
    const editProjectForm = document.getElementById('edit-project-form');
    const updateProjectBtn = document.getElementById('update-project-btn');

    let allProjectsData = {}; // Projelerin datasını hafızada tutmak için

    // Ana sayfada en fazla 3 proje gösterilir; yeni bir proje seçilmeden önce sınır kontrol edilir
    const ANA_SAYFA_LIMIT = 3;
    const oneCikanSiniriAsiliyor = (haricId) =>
        Object.entries(allProjectsData).filter(([id, p]) => p.one_cikan && id !== haricId).length >= ANA_SAYFA_LIMIT;
    const SINIR_UYARISI = "Ana sayfada en fazla 3 proje gösterilebilir. Önce başka bir projenin yıldızını kaldırın.";


    // Projeleri Getir
    db.collection("projects").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
        tableBody.innerHTML = '';
        allProjectsData = {};

        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Henüz proje eklenmemiş.</td></tr>';
            return;
        }

        snapshot.forEach((doc) => {
            const proje = doc.data();
            const id = doc.id;
            allProjectsData[id] = proje; // Hafızaya al

            const durumBadge = proje.durum === 'tamamlandi'
                ? '<span class="badge bg-success">Tamamlandı</span>'
                : '<span class="badge bg-warning text-dark">Devam Ediyor</span>';

            // Ana sayfada gösterilsin mi (yıldız)
            const yildizButton = `<button class="btn btn-sm ${proje.one_cikan ? 'btn-warning' : 'btn-outline-warning'} me-2" onclick="oneCikanDegistir('${id}')" title="${proje.one_cikan ? 'Ana sayfadan kaldır' : 'Ana sayfada göster'}"><i class="bi bi-star${proje.one_cikan ? '-fill' : ''}"></i></button>`;

            const durumButton = proje.durum === 'devam_ediyor'
                ? `<button class="btn btn-sm btn-success me-2" onclick="tamamlandiIsaretle('${id}')" title="Tamamlandı Olarak İşaretle"><i class="bi bi-check-circle"></i></button>`
                : '';

            // İlk resmi al (çoklu resim destekleniyorsa ilkini, desteklenmiyorsa eski yapıyı kullan)
            const ilkResim = safeUrl((proje.resimUrls && proje.resimUrls.length > 0) ? proje.resimUrls[0] : proje.resimUrl) || '../images/logo.png';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${ilkResim}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
                <td class="fw-bold">${escapeHtml(proje.baslik_tr || proje.baslik || '')}</td>
                <td>${durumBadge}</td>
                <td>
                    ${yildizButton}
                    ${durumButton}
                    <button class="btn btn-sm btn-primary me-2" onclick="projeDuzenle('${id}')" title="Düzenle"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="projeSil('${id}')" title="Sil"><i class="bi bi-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    });

    // Yeni Proje Ekle
    addProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const one_cikan = document.getElementById('proje-one-cikan').checked;
        if (one_cikan && oneCikanSiniriAsiliyor(null)) {
            alert(SINIR_UYARISI);
            return;
        }

        saveProjectBtn.disabled = true;
        const baslik_tr = document.getElementById('proje-baslik-tr').value.trim();
        const baslik_en = document.getElementById('proje-baslik-en').value.trim();
        const aciklama_tr = document.getElementById('proje-aciklama-tr').value.trim();
        const aciklama_en = document.getElementById('proje-aciklama-en').value.trim();
        const durum = document.getElementById('proje-durum').value;
        const gorselText = document.getElementById('proje-gorsel').value;
        const resimUrls = gorselText.split('\n').map(url => url.trim()).filter(url => url !== '');

        try {
            // Firestore'a kaydet
            await db.collection("projects").add({
                baslik_tr: baslik_tr,
                baslik_en: baslik_en,
                aciklama_tr: aciklama_tr,
                aciklama_en: aciklama_en,
                baslik: baslik_tr, // fallback for older structure
                aciklama: aciklama_tr, // fallback for older structure
                durum: durum,
                resimUrls: resimUrls, // Artık dizi olarak kaydediyoruz
                one_cikan: one_cikan,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Formu temizle ve modalı kapat
            addProjectForm.reset();

            const modal = bootstrap.Modal.getInstance(document.getElementById('addProjectModal'));
            modal.hide();

        } catch (error) {
            console.error("Proje eklenirken hata oluştu: ", error);
            alert("Bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            saveProjectBtn.disabled = false;
        }
    });

    // Proje Güncelleme
    if (editProjectForm) {
        editProjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const id = document.getElementById('edit-proje-id').value;
            const one_cikan = document.getElementById('edit-proje-one-cikan').checked;
            if (one_cikan && oneCikanSiniriAsiliyor(id)) {
                alert(SINIR_UYARISI);
                return;
            }

            updateProjectBtn.disabled = true;
            const baslik_tr = document.getElementById('edit-proje-baslik-tr').value.trim();
            const baslik_en = document.getElementById('edit-proje-baslik-en').value.trim();
            const aciklama_tr = document.getElementById('edit-proje-aciklama-tr').value.trim();
            const aciklama_en = document.getElementById('edit-proje-aciklama-en').value.trim();
            const durum = document.getElementById('edit-proje-durum').value;
            const gorselText = document.getElementById('edit-proje-gorsel').value;

            const resimUrls = gorselText.split('\n').map(url => url.trim()).filter(url => url !== '');

            try {
                await db.collection("projects").doc(id).update({
                    baslik_tr: baslik_tr,
                    baslik_en: baslik_en,
                    aciklama_tr: aciklama_tr,
                    aciklama_en: aciklama_en,
                    baslik: baslik_tr,
                    aciklama: aciklama_tr,
                    durum: durum,
                    resimUrls: resimUrls,
                    one_cikan: one_cikan
                });

                editProjectForm.reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('editProjectModal'));
                modal.hide();
            } catch (error) {
                console.error("Proje güncellenirken hata oluştu: ", error);
                alert("Güncelleme başarısız oldu.");
            } finally {
                updateProjectBtn.disabled = false;
            }
        });
    }

    // Global fonksiyonlar (HTML'den onClick ile erişilebilmesi için window objesine ekliyoruz)
    window.tamamlandiIsaretle = async (id) => {
        if (confirm("Bu projeyi 'Tamamlandı' olarak işaretlemek istediğinize emin misiniz?")) {
            await db.collection("projects").doc(id).update({
                durum: 'tamamlandi'
            });
        }
    };

    window.oneCikanDegistir = async (id) => {
        const proje = allProjectsData[id];
        if (!proje) return;
        const yeniDeger = !proje.one_cikan;
        if (yeniDeger && oneCikanSiniriAsiliyor(id)) {
            alert(SINIR_UYARISI);
            return;
        }
        try {
            await db.collection("projects").doc(id).update({ one_cikan: yeniDeger });
        } catch (error) {
            console.error("Ana sayfa seçimi güncellenemedi: ", error);
            alert("İşlem başarısız oldu. Firestore kurallarının güncel olduğundan emin olun.");
        }
    };

    window.projeDuzenle = (id) => {
        const proje = allProjectsData[id];
        if (!proje) return;

        document.getElementById('edit-proje-id').value = id;
        document.getElementById('edit-proje-baslik-tr').value = proje.baslik_tr || proje.baslik || '';
        document.getElementById('edit-proje-baslik-en').value = proje.baslik_en || '';
        document.getElementById('edit-proje-aciklama-tr').value = proje.aciklama_tr || proje.aciklama || '';
        document.getElementById('edit-proje-aciklama-en').value = proje.aciklama_en || '';
        document.getElementById('edit-proje-durum').value = proje.durum;
        document.getElementById('edit-proje-one-cikan').checked = proje.one_cikan === true;

        // Varsa resimUrls arrayini satır satır birleştirip textarea'ya yaz, yoksa eski resimUrl'i yaz
        if (proje.resimUrls && proje.resimUrls.length > 0) {
            document.getElementById('edit-proje-gorsel').value = proje.resimUrls.join('\n');
        } else {
            document.getElementById('edit-proje-gorsel').value = proje.resimUrl || '';
        }

        const modal = new bootstrap.Modal(document.getElementById('editProjectModal'));
        modal.show();
    };

    window.projeSil = async (id) => {
        if (confirm("Bu projeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
            await db.collection("projects").doc(id).delete();
        }
    };
});
