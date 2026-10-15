window.addEventListener("scroll", function() {
  let navbar = document.querySelector(".navbar");
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

// Mobilde menüden bir bağlantıya (ör. #iletisim) basınca açık menüyü kapat
document.querySelectorAll("#menu .nav-link:not(.dropdown-toggle), #menu .dropdown-item").forEach(link => {
  link.addEventListener("click", () => {
    const menu = document.getElementById("menu");
    if (menu.classList.contains("show") && typeof bootstrap !== "undefined") {
      bootstrap.Collapse.getOrCreateInstance(menu).hide();
    }
  });
});

const counters = document.querySelectorAll('.counter');

const startCounter = (counter) => {
  const target = +counter.getAttribute('data-target');
  const increment = target / 100;
  // Binlik ayırıcı dile göre: TR "2.000.000", EN "2,000,000"
  const locale = localStorage.getItem('lang') === 'en' ? 'en-US' : 'tr-TR';
  let count = 0;

  const updateCounter = () => {
    count = Math.min(target, Math.ceil(count + increment));
    counter.innerText = count.toLocaleString(locale);

    if (count < target) {
      setTimeout(updateCounter, 20);
    }
  };

  updateCounter();
};

// Sayaçlar ekrana geldiğinde bir kez saysın (sayfa açılır açılmaz değil)
if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));
} else {
  counters.forEach(startCounter);
}