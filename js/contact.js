document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contact-form");
    const submitBtn = document.getElementById("submit-btn");

    if (!contactForm) return;

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Mesajlar o anki seçili dile göre gösterilsin
        const t = translations[localStorage.getItem("lang") || "tr"];

        // Butonu devre dışı bırak ve yükleniyor yap
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = t["floating_contact_sending"];

        // EmailJS bilgileriniz (public key tarayıcıda çalışmak için tasarlanmıştır, gizli değildir)
        const PUBLIC_KEY = "xNu6bPouo7um--H8N";
        const SERVICE_ID = "service_xciakzj";
        const TEMPLATE_ID = "template_bo62p8e";

        emailjs.init(PUBLIC_KEY);

        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, contactForm)
            .then(() => {
                alert(t["floating_contact_success"]);
                contactForm.reset();
            })
            .catch((error) => {
                console.error("Hata:", error);
                alert(t["floating_contact_error"]);
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
    });
});
