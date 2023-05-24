const admin = require('firebase-admin');
const path = require('path');

const adminKey = path.resolve('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(adminKey),
});

module.exports = admin;
