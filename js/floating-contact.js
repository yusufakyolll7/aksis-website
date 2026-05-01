document.addEventListener("DOMContentLoaded", () => {
    let currentLang = localStorage.getItem('lang') || 'tr';

    // 1. HTML Yapısını Sayfaya Enjekte Et
    const injectFCP = () => {
        // Varsa eskiyi temizle
        const oldPopup = document.getElementById('fcp-popup');
        const oldBtn = document.getElementById('fcp-toggle-btn');
        if (oldPopup) oldPopup.remove();
        if (oldBtn) oldBtn.remove();

        const fcpHTML = `
        <div class="floating-contact-popup" id="fcp-popup">
            <div class="fcp-header">
                <div class="fcp-header-title">
                    <i class="bi bi-headset"></i> Aksis Mühendislik
                </div>
                <div class="fcp-header-subtitle">${translations[currentLang]["floating_contact_subtitle"]}</div>
            </div>
            <div class="fcp-body">
                <p class="fcp-intro">${translations[currentLang]["floating_contact_intro"]}</p>
                <form id="fcp-form">
                    <div class="fcp-form-group">
                        <input type="text" name="user_name" class="fcp-input" placeholder="${translations[currentLang]["floating_contact_name_placeholder"]}" required>
                    </div>
                    <div class="fcp-form-group">
                        <input type="email" name="user_email" class="fcp-input" placeholder="${translations[currentLang]["floating_contact_email_placeholder"]}" required>
                    </div>
                    <div class="fcp-form-group">
                        <textarea name="message" class="fcp-textarea" placeholder="${translations[currentLang]["floating_contact_msg_placeholder"]}" required></textarea>
                    </div>
                    <button type="submit" class="fcp-submit" id="fcp-submit-btn">${translations[currentLang]["floating_contact_submit"]} <i class="bi bi-send-fill ms-1"></i></button>
                </form>
            </div>
        </div>
        <button class="floating-contact-btn" id="fcp-toggle-btn">
            <i class="bi bi-chat-quote-fill"></i>
        </button>
        `;

        document.body.insertAdjacentHTML('beforeend', fcpHTML);
        setupEventListeners();
    };

    const setupEventListeners = () => {
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

        // Form Gönderim İşlemi
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            submitBtn.textContent = translations[currentLang]["floating_contact_sending"];
            submitBtn.disabled = true;

            loadEmailJS(() => {
                emailjs.sendForm("service_xciakzj", "template_bo62p8e", form)
                    .then(() => {
                        alert(translations[currentLang]["floating_contact_success"]);
                        form.reset();
                        popup.classList.remove('active');
                        toggleBtn.querySelector('i').className = 'bi bi-chat-quote-fill';
                    })
                    .catch((err) => {
                        console.error(err);
                        alert(translations[currentLang]["floating_contact_error"]);
                    })
                    .finally(() => {
                        submitBtn.innerHTML = `${translations[currentLang]["floating_contact_submit"]} <i class="bi bi-send-fill ms-1"></i>`;
                        submitBtn.disabled = false;
                    });
            });
        });
    };

    // EmailJS kütüphanesini dinamik yükle
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

    // İlk yükleme
    injectFCP();

    // Dil değiştiğinde içeriği güncelle
    document.addEventListener('languageChanged', (e) => {
        currentLang = e.detail.lang;
        injectFCP(); // HTML'i yeni dille tekrar enjekte et
    });
});
