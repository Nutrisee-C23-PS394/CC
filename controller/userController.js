/* eslint-disable camelcase */
const { nanoid } = require('nanoid');
// const { getAuth } = require('@firebase/auth');
// const { admin } = require('../config/firebase');
const db = require('../config/database');

const uuid = nanoid(12);
// const fbAuth = getAuth();

// mendapatkan userInfo dan untuk parameter rekomendasi makanan
const userInfo = async (req, res) => {
  const { uid } = req.body;

  let age;
  try {
    const getUserInfoQuery =
      'SELECT height, weight, DATE_FORMAT(birth, "%Y-%m-%d") AS birth, gender FROM user_info WHERE user_id = ?';
    const getUserAllergyQuery =
      'SELECT a.* FROM user_allergy ua INNER JOIN allergy a ON ua.allergy_id = a.id WHERE ua.user_id = ?';

    const userInfoResult = await db.query(getUserInfoQuery, [uid]);

    if (userInfoResult.length === 0) {
      res.status(404).send({ status: '404', message: 'User information not found' });
    } else {
      const userAllergyResult = await db.query(getUserAllergyQuery, [uid]);
      const birthDate = new Date(userInfoResult[0].birth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
      }

      res.status(200).send({
        userInfo: { ...userInfoResult[0], userAge: age },
        userAllergy: userAllergyResult,
      });
    }
  } catch (error) {
    res.status(500).send({ status: 'error', message: 'Something when wrong from server. please try again' });
  }
};

// menyimpan informasi user kedalam database
const storeUser = async (req, res) => {
  const { height, weight, birth, uid, gender, allergy_id, allergy_name } = req.body;

  try {
    // Memulai transaksi
    await db.beginTransaction();

    // Memeriksa data user pada table user_info
    const existingUserInfoQuery = 'SELECT * FROM user_info WHERE user_id = ?';
    const existingUserInfoResult = await db.query(existingUserInfoQuery, [uid]);

    if (existingUserInfoResult.length > 0) {
      // jika ada, update
      const updateUserInfoQuery =
        'UPDATE user_info SET height = ?, weight = ?, birth = ?, gender = ? WHERE user_id = ?';
      // 'UPDATE user_info SET height = ?, weight = ?, birth = ?, updated_at = NOW() WHERE user_id = ?';
      await db.query(updateUserInfoQuery, [height, weight, birth, gender.toLowerCase(), uid]);
    } else {
      // jika belum, tambahkan
      const insertUserInfoQuery =
        'INSERT INTO user_info (uid, height, weight, birth, gender, user_id) VALUES (?, ?, ?, ?, ?, ?)';
      // 'INSERT INTO user_info (uid, height, weight, birth, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())';
      await db.query(insertUserInfoQuery, [uuid, height, weight, birth, gender.toLowerCase(), uid]);
    }

    // Hapus user_allergy record terlebih dahulu
    const deleteUserAllergyQuery = 'DELETE FROM user_allergy WHERE user_id = ?';
    await db.query(deleteUserAllergyQuery, [uid]);

    // Memasukan kembali data user_allergy jika ada
    const insertedAllergyIds = [];
    const allergyQueries = [];

    if (allergy_id) {
      allergy_id.forEach((item) => {
        const { id } = item;
        if (!insertedAllergyIds.includes(id)) {
          insertedAllergyIds.push(id);
          const insertUserAllergyQuery = 'INSERT INTO user_allergy (allergy_id, user_id) VALUES (?, ?)';
          allergyQueries.push(db.query(insertUserAllergyQuery, [id, uid]));
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
            return db.query(insertUserAllergyQuery, [existingAllergyId, uid]);
          }
        } else {
          const insertAllergyQuery = 'INSERT INTO allergy (name) VALUES (?) ON DUPLICATE KEY UPDATE id = id';
          const insertAllergyResult = await db.query(insertAllergyQuery, [name]);
          const newAllergyId = insertAllergyResult.insertId;
          insertedAllergyIds.push(newAllergyId);
          const insertUserAllergyQuery = 'INSERT INTO user_allergy (allergy_id, user_id) VALUES (?, ?)';
          return db.query(insertUserAllergyQuery, [newAllergyId, uid]);
        }
      });

      allergyQueries.push(...existingAllergyPromises);
    }

    await Promise.all(allergyQueries);

    // Commit transaksi
    await db.commit();

    // pengecekan kembali data pada user_info dan user_allergy
    const getUserInfoQuery =
      'SELECT height, weight, DATE_FORMAT(birth, "%Y-%m-%d") AS birth, gender FROM user_info WHERE user_id = ?';
    const getUserAllergyQuery =
      'SELECT a.* FROM user_allergy ua INNER JOIN allergy a ON ua.allergy_id = a.id WHERE ua.user_id = ?';

    const [userInfoResult, userAllergyResult] = await Promise.all([
      db.query(getUserInfoQuery, [uid]),
      db.query(getUserAllergyQuery, [uid]),
    ]);

    res.status(200).send({
      message: 'User info and user allergies added/updated successfully',
      userInfo: userInfoResult[0],
      userAllergy: userAllergyResult,
    });
  } catch (err) {
    await db.rollback();
    res.status(500).send({ status: 'error', message: 'Something when wrong from server. please try again' });
  }
};

// const testHeaders = async (req, res) => {
//   const { uid, userCred } = req.body;
//   try {
//     const tokenTemp = await fbAuth.currentUser.getIdToken();
//     const sessionCookie = await admin.auth().createSessionCookie(tokenTemp, { expiresIn: 5 * 60 * 1000 });

//     res.set('Set-Cookie', `session=${sessionCookie}; Path=/; HttpOnly; Secure; SameSite=Strict`);
//     res.status(200).send({ message: 'Request success', userid: uid, userInfo: userCred, tokenUser: tokenTemp });
//   } catch (error) {
//     console.log(error);
//   }
// };

// const testSession = async (req, res) => {
//   const { uid, user, decoded } = req.body;
//   try {
//     const tokenTemp = await fbAuth.currentUser.getIdToken();

//     res
//       .status(200)
//       .json({ message: 'Request success', userid: uid, userInfo: user, userToken: tokenTemp, userDecoded: decoded });
//   } catch (error) {
//     res.json({ message: error });
//   }
// };

module.exports = { userInfo, storeUser };
