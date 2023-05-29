/* eslint-disable camelcase */
const { nanoid } = require('nanoid');
// const fbAuth = require('@firebase/auth');
const firebaseAuth = require('../config/firebase');
const db = require('../config/database');

const uuid = nanoid(12);

const signUp = async (req, res) => {
  const { name, userEmail, userPassword } = req.body;
  let signUpRes;
  try {
    signUpRes = await firebaseAuth.auth().createUser({
      uid: uuid,
      displayName: name,
      email: userEmail,
      password: userPassword,
    });
    const token = await firebaseAuth.auth().createCustomToken(signUpRes.uid);
    const newQuery = `INSERT INTO users (uid, name, email) VALUES (?, ?, ?)`;
    // const newQuery = `INSERT INTO users (uid, name, email, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())`;
    const insertValue = [signUpRes.uid, name, userEmail];
    await db.query(newQuery, insertValue);
    // fbAuth.signInWithCustomToken();
    res.setHeader('Authorization', `Bearer ${token}`);
    // firebaseAuth.auth().
    // const sessionCookie = await firebaseAuth.auth().createSessionCookie(token, { expiresIn: 60 * 60 * 24 * 14 });
    // res.set('Set-Cookie', `session=${sessionCookie}; Path=/; HttpOnly; Secure; SameSite=None`);

    res.status(200).json({ message: 'Login successful', userToken: token });
    // res.status(201).redirect(307, '/api/login');
    // .json({ status: '201', data: { uid: signUpRes.uid, Name: signUpRes.displayName } })
    // .redirect(307, '/api/login');
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      res.status(409).json({ message: 'The email address is already exist' });
    } else if (error.code === 'auth/invalid-password') {
      res.status(400).json({ message: 'The password at least 6 characters.' });
    } else {
      await db.query('DELETE FROM users where uid = ?', signUpRes.uid);
      await firebaseAuth.auth().deleteUser(signUpRes.uid);
      res.status(500).json({ message: error.code });
    }
  }
};

const login = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const expiresIn = 60 * 60 * 24 * 14; // token berlaku untuk 2 minggu
  try {
    const sessionCookie = await firebaseAuth.auth().createSessionCookie(token, expiresIn); // Set cookie expiration time (e.g., 2 weeks)

    res.set('Set-Cookie', `session=${sessionCookie}; Path=/; HttpOnly; Secure; SameSite=None`);

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
  // res.status(200).json({ status: 200, message: 'request success' });
};

// mendapatkan userInfo
const userInfo = async (req, res) => {
  // const uid = req.uid;
  const { uid } = req.body;
  // ui = user_info, a = allergy
  try {
    const getUserInfoQuery =
      'SELECT height, weight, DATE_FORMAT(birth, "%Y-%m-%d") AS birth FROM user_info WHERE user_id = ?';
    const getUserAllergyQuery =
      'SELECT a.* FROM user_allergy ua INNER JOIN allergy a ON ua.allergy_id = a.id WHERE ua.user_id = ?';

    const [userInfoResult, userAllergyResult] = await Promise.all([
      db.query(getUserInfoQuery, [uid]),
      db.query(getUserAllergyQuery, [uid]),
    ]);

    res.status(200).json({
      userInfo: userInfoResult[0],
      userAllergy: userAllergyResult,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error });
  }
  // res.json({ message: 'Access granted!', uid });
  // await firebaseAuth.auth().verifyIdToken();
  // const searchQuery =
  // await db.query();
};

// menyimpan informasi user kedalam database
const storeUser = async (req, res) => {
  const { height, weight, birth, user_id, allergy_id, allergy_name } = req.body;

  try {
    // Memulai transaksi
    await db.beginTransaction();

    // Memeriksa data user pada table user_info
    const existingUserInfoQuery = 'SELECT * FROM user_info WHERE user_id = ?';
    const existingUserInfoResult = await db.query(existingUserInfoQuery, [user_id]);

    if (existingUserInfoResult.length > 0) {
      // jika ada, update
      const updateUserInfoQuery = 'UPDATE user_info SET height = ?, weight = ?, birth = ? WHERE user_id = ?';
      // 'UPDATE user_info SET height = ?, weight = ?, birth = ?, updated_at = NOW() WHERE user_id = ?';
      await db.query(updateUserInfoQuery, [height, weight, birth, user_id]);
    } else {
      // jika belum, tambahkan
      const insertUserInfoQuery = 'INSERT INTO user_info (uid, height, weight, birth, user_id) VALUES (?, ?, ?, ?, ?)';
      // 'INSERT INTO user_info (uid, height, weight, birth, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())';
      await db.query(insertUserInfoQuery, [uuid, height, weight, birth, user_id]);
    }

    // Hapus user_allergy record terlebih dahulu
    const deleteUserAllergyQuery = 'DELETE FROM user_allergy WHERE user_id = ?';
    await db.query(deleteUserAllergyQuery, [user_id]);

    // Memasukan kembali data user_allergy jika ada
    const insertedAllergyIds = [];
    const allergyQueries = [];

    if (allergy_id) {
      allergy_id.forEach((item) => {
        const { id } = item;
        if (!insertedAllergyIds.includes(id)) {
          insertedAllergyIds.push(id);
          const insertUserAllergyQuery = 'INSERT INTO user_allergy (allergy_id, user_id) VALUES (?, ?)';
          allergyQueries.push(db.query(insertUserAllergyQuery, [id, user_id]));
        }
      });
    }

    if (allergy_name) {
      const existingAllergyPromises = allergy_name.map(async (allergy) => {
        const { name } = allergy;
        const existingAllergyQuery = 'SELECT id FROM allergy WHERE name = ?';
        const existingAllergyResult = await db.query(existingAllergyQuery, [name]);

        if (existingAllergyResult.length > 0) {
          const existingAllergyId = existingAllergyResult[0].id;
          if (!insertedAllergyIds.includes(existingAllergyId)) {
            insertedAllergyIds.push(existingAllergyId);
            const insertUserAllergyQuery = 'INSERT INTO user_allergy (allergy_id, user_id) VALUES (?, ?)';
            return db.query(insertUserAllergyQuery, [existingAllergyId, user_id]);
          }
        } else {
          const insertAllergyQuery = 'INSERT INTO allergy (name) VALUES (?) ON DUPLICATE KEY UPDATE id = id';
          const insertAllergyResult = await db.query(insertAllergyQuery, [name]);
          const newAllergyId = insertAllergyResult.insertId;
          insertedAllergyIds.push(newAllergyId);
          const insertUserAllergyQuery = 'INSERT INTO user_allergy (allergy_id, user_id) VALUES (?, ?)';
          return db.query(insertUserAllergyQuery, [newAllergyId, user_id]);
        }
      });

      allergyQueries.push(...existingAllergyPromises);
    }

    await Promise.all(allergyQueries);

    // Commit transaksi
    await db.commit();

    // pengecekan kembali data pada user_info dan user_allergy
    const getUserInfoQuery =
      'SELECT height, weight, DATE_FORMAT(birth, "%Y-%m-%d") AS birth FROM user_info WHERE user_id = ?';
    const getUserAllergyQuery =
      'SELECT a.* FROM user_allergy ua INNER JOIN allergy a ON ua.allergy_id = a.id WHERE ua.user_id = ?';

    const [userInfoResult, userAllergyResult] = await Promise.all([
      db.query(getUserInfoQuery, [user_id]),
      db.query(getUserAllergyQuery, [user_id]),
    ]);

    res.status(200).json({
      message: 'User info and user allergies added/updated successfully',
      userInfo: userInfoResult[0],
      userAllergy: userAllergyResult,
    });
  } catch (err) {
    await db.rollback();
    res.status(500).json({ message: 'Something went wrong. Please try again!', error: err });
  }
};

// const testHeaders = async (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   res.status(200).json({ message: 'Request success', userToken: token });
// }

module.exports = { signUp, login, userInfo, storeUser };
