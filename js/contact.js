document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contact-form");
    const submitBtn = document.getElementById("submit-btn");

    if (!contactForm) return;

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Butonu devre dışı bırak ve yükleniyor yap
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Gönderiliyor...";

        // EmailJS bilgileriniz (Buraya kendi bilgilerinizi girmelisiniz)
        const PUBLIC_KEY = "BURAYA_PUBLIC_KEY_GELECEK";
        const SERVICE_ID = "BURAYA_SERVICE_ID_GELECEK";
        const TEMPLATE_ID = "BURAYA_TEMPLATE_ID_GELECEK";

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
