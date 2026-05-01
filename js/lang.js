document.addEventListener("DOMContentLoaded", () => {
  // Get default language or stored language
  let currentLang = localStorage.getItem("lang") || "tr";
  
  // Set initial language
  setLanguage(currentLang);

  // Setup language toggle buttons
  const langTrBtn = document.getElementById("lang-tr");
  const langEnBtn = document.getElementById("lang-en");

  if (langTrBtn && langEnBtn) {
    langTrBtn.addEventListener("click", (e) => {
      e.preventDefault();
      setLanguage("tr");
    });

    langEnBtn.addEventListener("click", (e) => {
      e.preventDefault();
      setLanguage("en");
    });
  }
});

function setLanguage(lang) {
  // Save to local storage
  localStorage.setItem("lang", lang);

  // Update Active Button Style
  const langTrBtn = document.getElementById("lang-tr");
  const langEnBtn = document.getElementById("lang-en");

  if (langTrBtn && langEnBtn) {
    if (lang === "tr") {
      langTrBtn.classList.add("active", "fw-bold");
      langTrBtn.classList.remove("text-muted");
      langEnBtn.classList.remove("active", "fw-bold");
      langEnBtn.classList.add("text-muted");
    } else {
      langEnBtn.classList.add("active", "fw-bold");
      langEnBtn.classList.remove("text-muted");
      langTrBtn.classList.remove("active", "fw-bold");
      langTrBtn.classList.add("text-muted");
    }
  }

  // Update text for all elements with data-i18n attribute
  const elements = document.querySelectorAll("[data-i18n]");
  elements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      // For inputs with placeholders
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        if (el.hasAttribute("placeholder")) {
          el.setAttribute("placeholder", translations[lang][key]);
        }
      } else {
        // For normal text elements
        // If the element has children (like icons), we only want to replace text node if possible
        // But for simplicity, we replace innerHTML if we have HTML inside, or just text.
        // If they use innerHTML, we should be careful not to overwrite child nodes like icons if they are placed inside the translated text.
        // It's safer to use innerHTML so we can include <br> etc if needed.
        el.innerHTML = translations[lang][key];
      }
    }
  });

  // Custom Event for dynamically loaded content (like projects from firebase)
  document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
}
