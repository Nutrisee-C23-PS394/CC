const { nanoid } = require('nanoid');
const firebaseAuth = require('../config/firebase');
const db = require('../config/database');

const id = nanoid(12);

const signUp = async (req, res) => {
  const { name, userEmail, userPassword } = req.body;
  let signUpRes;
  try {
    signUpRes = await firebaseAuth.auth().createUser({
      uid: id,
      displayName: name,
      email: userEmail,
      password: userPassword,
    });

    const newQuery = `INSERT INTO users (uid, name, email, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`;
    const insertValue = [signUpRes.uid, name, userEmail];
    await db.query(newQuery, insertValue);
    res.status(201).redirect(307, '/api/login');
    // .json({ status: '201', data: { uid: signUpRes.uid, Name: signUpRes.displayName } })
    // .redirect(307, '/api/login');
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      res.status(409).json({ message: 'The email address is already exist' });
    } else if (error.code === 'auth/invalid-password') {
      res.status(400).json({ message: 'The password at least 6 characters.' });
    } else {
      await firebaseAuth.auth().deleteUser(signUpRes.uid);
      res.status(500).json({ message: error.code });
    }
  }
};

const login = async (req, res) => {
  res.status(200).json({ status: 200, message: 'request success' });
};

module.exports = { signUp, login };
