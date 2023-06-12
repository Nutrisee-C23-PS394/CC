// const client = require('firebase/app');
const client = require('@firebase/app');
const admin = require('firebase-admin');
const path = require('path');

const adminKey = path.resolve('./serviceAccountKey.json');

const firebaseConfig = {};

const firebaseAPP = client.initializeApp(firebaseConfig);

admin.initializeApp({
  credential: admin.credential.cert(adminKey),
});

module.exports = { admin, firebaseAPP };
