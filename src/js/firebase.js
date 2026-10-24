import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

import { getFirestore } from "firebase/firestore";

/* =========================================================
FIREBASE CONFIGURATION
========================================================= */

const firebaseConfig = {
apiKey: "AIzaSyD_zLPF-ToqUjPajhxZuL1Uyn-qFNtw5xI",
authDomain: "crotchet-sjesales.firebaseapp.com",
projectId: "crotchet-sjesales",
storageBucket: "crotchet-sjesales.firebasestorage.app",
messagingSenderId: "560832389043",
appId: "1:560832389043:web:fe2207e734fe7d9d7575c6",
measurementId: "G-GQDXHMKS0Z"
};

/* =========================================================
INITIALIZE FIREBASE
========================================================= */

const app = initializeApp(firebaseConfig);

/* =========================================================
FIREBASE SERVICES
========================================================= */

export const auth = getAuth(app);

export const db = getFirestore(app);

export default app;
