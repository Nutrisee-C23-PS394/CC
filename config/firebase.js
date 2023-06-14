// const client = require('firebase/app');
const client = require('@firebase/app');
const admin = require('firebase-admin');
const path = require('path');

const adminKey = path.resolve('./serviceAccountKey.json');

const firebaseConfig = {
  apiKey: 'AIzaSyDwf7KicoE9O_SuM6bYZUVVU-Vu8_cRbpg',
  authDomain: 'nutrisee-c23-ps394.firebaseapp.com',
  projectId: 'nutrisee-c23-ps394',
  storageBucket: 'nutrisee-c23-ps394.appspot.com',
  messagingSenderId: '929669962486',
  appId: '1:929669962486:web:a3a2d015881cbd5ddfead7',
  measurementId: 'G-DNY4SF5NN4',
};

const firebaseAPP = client.initializeApp(firebaseConfig);

admin.initializeApp({
  credential: admin.credential.cert(adminKey),
});

module.exports = { admin, firebaseAPP };
