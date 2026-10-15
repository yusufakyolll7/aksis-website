// Google reCAPTCHA v2 ("Ben robot değilim") - iletişim formlarında spam koruması
// Site key herkese açıktır; secret key sadece EmailJS şablon ayarlarında durur.
const RECAPTCHA_SITE_KEY = "6LcDefAtAAAAAHOsNll2Pmt6_wPHPcBrelQGeGvB";

let recaptchaYuklendi = null;

// reCAPTCHA kütüphanesini sadece ihtiyaç olduğunda, bir kez yükle
function recaptchaYukle() {
    if (!recaptchaYuklendi) {
        recaptchaYuklendi = new Promise((resolve) => {
            window.onRecaptchaLoad = resolve;
            const lang = localStorage.getItem("lang") === "en" ? "en" : "tr";
            const script = document.createElement("script");
            script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit&hl=${lang}`;
            script.async = true;
            document.head.appendChild(script);
        });
    }
    return recaptchaYuklendi;
}

// Verilen kutuya widget çiz; widget id'sini döndürür
function recaptchaCiz(container) {
    return recaptchaYukle().then(() => grecaptcha.render(container, { sitekey: RECAPTCHA_SITE_KEY }));
}

// Kutu işaretlenmiş mi? İşaretlenmemişse uyarı gösterir ve false döner
function recaptchaKontrol(widgetId) {
    // widgetId null/undefined ise kutu henüz çizilmemiştir (getResponse'a null verilirse sayfadaki ilk kutuya bakar)
    if (widgetId == null || typeof grecaptcha === "undefined" || !grecaptcha.getResponse(widgetId)) {
        const t = translations[localStorage.getItem("lang") || "tr"];
        alert(t["recaptcha_required"]);
        return false;
    }
    return true;
}

// Her doğrulama tek kullanımlık; gönderimden sonra kutuyu sıfırla
function recaptchaSifirla(widgetId) {
    if (widgetId != null && typeof grecaptcha !== "undefined") {
        grecaptcha.reset(widgetId);
    }
}
