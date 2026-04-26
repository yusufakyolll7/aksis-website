document.addEventListener('DOMContentLoaded', () => {
    // Auth Kontrolü
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'index.html'; // Giriş yapmamışsa logine at
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
                
            const durumButton = proje.durum === 'devam_ediyor'
                ? `<button class="btn btn-sm btn-success me-2" onclick="tamamlandiIsaretle('${id}')" title="Tamamlandı Olarak İşaretle"><i class="bi bi-check-circle"></i></button>`
                : '';

            // İlk resmi al (çoklu resim destekleniyorsa ilkini, desteklenmiyorsa eski yapıyı kullan)
            const ilkResim = (proje.resimUrls && proje.resimUrls.length > 0) ? proje.resimUrls[0] : (proje.resimUrl || '../images/logo.jpg');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${ilkResim}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
                <td class="fw-bold">${proje.baslik}</td>
                <td>${durumBadge}</td>
                <td>
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
        
        saveProjectBtn.disabled = true;
        const baslik = document.getElementById('proje-baslik').value;
        const aciklama = document.getElementById('proje-aciklama').value;
        const durum = document.getElementById('proje-durum').value;
        const gorselText = document.getElementById('proje-gorsel').value;
        const resimUrls = gorselText.split('\n').map(url => url.trim()).filter(url => url !== '');

        try {
            // Firestore'a kaydet
            await db.collection("projects").add({
                baslik: baslik,
                aciklama: aciklama,
                durum: durum,
                resimUrls: resimUrls, // Artık dizi olarak kaydediyoruz
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
    if(editProjectForm) {
        editProjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            updateProjectBtn.disabled = true;
            const id = document.getElementById('edit-proje-id').value;
            const baslik = document.getElementById('edit-proje-baslik').value;
            const aciklama = document.getElementById('edit-proje-aciklama').value;
            const durum = document.getElementById('edit-proje-durum').value;
            const gorselText = document.getElementById('edit-proje-gorsel').value;
            
            const resimUrls = gorselText.split('\n').map(url => url.trim()).filter(url => url !== '');

            try {
                await db.collection("projects").doc(id).update({
                    baslik: baslik,
                    aciklama: aciklama,
                    durum: durum,
                    resimUrls: resimUrls
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
        if(confirm("Bu projeyi 'Tamamlandı' olarak işaretlemek istediğinize emin misiniz?")) {
            await db.collection("projects").doc(id).update({
                durum: 'tamamlandi'
            });
        }
    };

    window.projeDuzenle = (id) => {
        const proje = allProjectsData[id];
        if(!proje) return;

        document.getElementById('edit-proje-id').value = id;
        document.getElementById('edit-proje-baslik').value = proje.baslik;
        document.getElementById('edit-proje-aciklama').value = proje.aciklama;
        document.getElementById('edit-proje-durum').value = proje.durum;
        
        // Varsa resimUrls arrayini satır satır birleştirip textarea'ya yaz, yoksa eski resimUrl'i yaz
        if(proje.resimUrls && proje.resimUrls.length > 0) {
            document.getElementById('edit-proje-gorsel').value = proje.resimUrls.join('\n');
        } else {
            document.getElementById('edit-proje-gorsel').value = proje.resimUrl || '';
        }

        const modal = new bootstrap.Modal(document.getElementById('editProjectModal'));
        modal.show();
    };

    window.projeSil = async (id) => {
        if(confirm("Bu projeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
            await db.collection("projects").doc(id).delete();
        }
    };
});
