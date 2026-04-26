const firebaseConfig = {
    apiKey: "AIzaSyAwJD6tm7J_ULD-DE07kxbv_dplSqfj8aA",
    authDomain: "aksis-website-f5868.firebaseapp.com",
    projectId: "aksis-website-f5868",
    storageBucket: "aksis-website-f5868.firebasestorage.app",
    messagingSenderId: "214519271211",
    appId: "1:214519271211:web:6686abac5cc3e3320cbf6e",
    measurementId: "G-2M05ZCGDW1"
};

// Firebase başlatma
firebase.initializeApp(firebaseConfig);

// Servisleri dışa aktarma
const db = firebase.firestore();
const auth = firebase.auth();
