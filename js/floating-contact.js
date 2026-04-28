document.addEventListener("DOMContentLoaded", () => {
    // 1. HTML Yapısını Sayfaya Enjekte Et
    const fcpHTML = `
    <div class="floating-contact-popup" id="fcp-popup">
        <div class="fcp-header">
            <div class="fcp-header-title">
                <i class="bi bi-headset"></i> Aksis Mühendislik
            </div>
            <div class="fcp-header-subtitle">Size nasıl yardımcı olabiliriz?</div>
        </div>
        <div class="fcp-body">
            <p class="fcp-intro">Mesajınızı bırakın, uzman ekibimiz en kısa sürede size dönüş yapsın.</p>
            <form id="fcp-form">
                <div class="fcp-form-group">
                    <input type="text" name="user_name" class="fcp-input" placeholder="Adınız Soyadınız" required>
                </div>
                <div class="fcp-form-group">
                    <input type="email" name="user_email" class="fcp-input" placeholder="E-posta Adresiniz" required>
                </div>
                <div class="fcp-form-group">
                    <textarea name="message" class="fcp-textarea" placeholder="Mesajınız..." required></textarea>
                </div>
                <button type="submit" class="fcp-submit" id="fcp-submit-btn">Gönder <i class="bi bi-send-fill ms-1"></i></button>
            </form>
        </div>
    </div>
    <button class="floating-contact-btn" id="fcp-toggle-btn">
        <i class="bi bi-chat-quote-fill"></i>
    </button>
    `;

    document.body.insertAdjacentHTML('beforeend', fcpHTML);

    const toggleBtn = document.getElementById('fcp-toggle-btn');
    const popup = document.getElementById('fcp-popup');
    const form = document.getElementById('fcp-form');
    const submitBtn = document.getElementById('fcp-submit-btn');

    // Pencereyi Aç/Kapat
    toggleBtn.addEventListener('click', () => {
        popup.classList.toggle('active');
        const icon = toggleBtn.querySelector('i');
        if (popup.classList.contains('active')) {
            icon.classList.remove('bi-chat-quote-fill');
            icon.classList.add('bi-x-lg');
        } else {
            icon.classList.remove('bi-x-lg');
            icon.classList.add('bi-chat-quote-fill');
        }
    });

    // EmailJS kütüphanesini dinamik yükle (her sayfada olmayabilir)
    function loadEmailJS(callback) {
        if (typeof emailjs !== 'undefined') {
            callback();
        } else {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
            script.onload = () => {
                emailjs.init("xNu6bPouo7um--H8N");
                callback();
            };
            document.head.appendChild(script);
        }
    }

    // Form Gönderim İşlemi
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "GÖNDERİLİYOR...";
        submitBtn.disabled = true;

        loadEmailJS(() => {
            emailjs.sendForm("service_xciakzj", "template_bo62p8e", form)
                .then(() => {
                    alert("Mesajınız başarıyla gönderildi! En kısa sürede dönüş yapacağız.");
                    form.reset();
                    popup.classList.remove('active');
                    toggleBtn.querySelector('i').className = 'bi bi-chat-quote-fill';
                })
                .catch((err) => {
                    console.error(err);
                    alert("Bir hata oluştu, lütfen daha sonra tekrar deneyin.");
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
    });
});
