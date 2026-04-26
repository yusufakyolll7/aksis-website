document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const errorMessage = document.getElementById('error-message');

    // Oturum kontrolü
    auth.onAuthStateChanged((user) => {
        if (user) {
            window.location.href = 'dashboard.html';
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = emailInput.value;
            const password = passwordInput.value;
            
            loginBtn.disabled = true;
            loginBtn.innerHTML = 'Giriş Yapılıyor...';
            errorMessage.classList.add('d-none');

            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Yönlendirme onAuthStateChanged ile yapılacak
                })
                .catch((error) => {
                    errorMessage.textContent = 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
                    errorMessage.classList.remove('d-none');
                    loginBtn.disabled = false;
                    loginBtn.innerHTML = 'Giriş Yap';
                });
        });
    }
});
