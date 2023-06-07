const { getAuth, signInWithEmailAndPassword, signOut } = require('@firebase/auth');
const { nanoid } = require('nanoid');
const { admin } = require('../config/firebase');
const db = require('../config/database');

const fbAuth = getAuth();
const uuid = nanoid(12);

const signUp = async (req, res) => {
  const { name, userEmail, userPassword } = req.body;
  let signUpRes;
  try {
    signUpRes = await admin.auth().createUser({
      uid: uuid,
      displayName: name,
      email: userEmail,
      password: userPassword,
    });

    const newQuery = `INSERT INTO users (uid, name, email) VALUES (?, ?, ?)`;

    const insertValue = [signUpRes.uid, name, userEmail];
    await db.query(newQuery, insertValue);

    res.status(201).redirect(307, '/api/login');
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      res.status(409).json({ message: 'The email address is already exist' });
    } else if (error.code === 'auth/invalid-password') {
      res.status(400).json({ message: 'The password at least 6 characters.' });
    } else {
      await db.query('DELETE FROM users where uid = ?', signUpRes.uid);
      await admin.auth().deleteUser(signUpRes.uid);
      res.status(500).json({ message: error.code });
    }
  }
};

const logIn = async (req, res) => {
  const { userEmail, userPassword } = req.body;

  const expiresIn = 60 * 60 * 24 * 14 * 1000; // session berlaku untuk 2 minggu
  // const expiresIn = 5 * 60 * 1000;
  try {
    const signInUser = await signInWithEmailAndPassword(fbAuth, userEmail, userPassword);

    const token = await signInUser.user.getIdToken();
    const sessionCookie = await admin.auth().createSessionCookie(token, { expiresIn });

    res.set('Set-Cookie', `session=${sessionCookie}; Path=/; HttpOnly; Secure; SameSite=Strict`);

    res.status(200).send({ message: 'Login successful' });
  } catch (error) {
    res.status(400).send({ message: 'Wrong password or email' });
  }
};

const logOut = async (req, res) => {
  const { session } = req.cookies;

  try {
    const revokeSession = await admin.auth().verifySessionCookie(session, true);
    await admin.auth().revokeRefreshTokens(revokeSession.sub);
    await signOut(fbAuth);
    res.clearCookie('session');
    res.status(200).send({ message: 'Sign Out Successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Something when wrong from server. please try again' });
  }
};

module.exports = { signUp, logIn, logOut };
