// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
// BUG CORREGIDO: se importaba desde "firebase/auth/web-extension"
// que es exclusivo para extensiones de Chrome, NO para apps web normales.
// El import correcto es simplemente "firebase/auth".
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);