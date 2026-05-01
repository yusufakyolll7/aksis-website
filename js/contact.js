document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contact-form");
    const submitBtn = document.getElementById("submit-btn");

    if (!contactForm) return;

    // Dosya sayacı - birden fazla seçimde birikerek artar
    const fileInput = document.getElementById("contact-file");
    const fileCount = document.querySelector(".contact-file-count");
    const accumulatedFiles = new DataTransfer();

    if (fileInput && fileCount) {
        fileInput.addEventListener("change", () => {
            // Yeni seçilen dosyaları mevcut listeye ekle (aynı isimde olanları atla)
            const existingNames = Array.from(accumulatedFiles.files).map(f => f.name);
            Array.from(fileInput.files).forEach(file => {
                if (!existingNames.includes(file.name)) {
                    accumulatedFiles.items.add(file);
                }
            });
            // Input'u güncel toplam listeyle güncelle
            fileInput.files = accumulatedFiles.files;
            fileCount.textContent = `Ekler (${accumulatedFiles.files.length})`;
        });
    }

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Butonu devre dışı bırak ve yükleniyor yap
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Gönderiliyor...";

        // EmailJS bilgileriniz
        const PUBLIC_KEY = "xNu6bPouo7um--H8N";
        const SERVICE_ID = "service_xciakzj";
        const TEMPLATE_ID = "template_bo62p8e";

        if (PUBLIC_KEY === "BURAYA_PUBLIC_KEY_GELECEK") {
            alert("Lütfen js/contact.js dosyasından EmailJS bilgilerinizi tanımlayın!");
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            return;
        }

        emailjs.init(PUBLIC_KEY);

        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, contactForm)
            .then(() => {
                alert("Mesajınız başarıyla gönderildi!");
                contactForm.reset();
            })
            .catch((error) => {
                console.error("Hata:", error);
                alert("Mesaj gönderilirken bir hata oluştu.");
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
    });
});
