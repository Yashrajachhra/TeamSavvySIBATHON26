const admin = require('firebase-admin');

let firebaseApp;

const initializeFirebase = () => {
    if (firebaseApp) return firebaseApp;

    try {
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

        if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
            firebaseApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('🔥 Firebase Admin initialized');
        } else {
            console.warn('⚠️  Firebase credentials not configured — auth will use JWT-only mode');
            firebaseApp = null;
        }
    } catch (error) {
        console.error('Firebase initialization error:', error.message);
        firebaseApp = null;
    }

    return firebaseApp;
};

const getFirebaseAuth = () => {
    if (!firebaseApp) return null;
    return admin.auth();
};

module.exports = { initializeFirebase, getFirebaseAuth, admin };
