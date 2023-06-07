const { nanoid } = require('nanoid');
const db = require('../config/database');

const uuid = nanoid(12);

const getHistoryFood = async (req, res) => {
  const { uid } = req.body;
  try {
    const existingFoodHistoryUserQuery = 'SELECT * FROM food_records WHERE user_id = ?';
    const existingFoodHistoryUserInfo = await db.query(existingFoodHistoryUserQuery, [uid]);

    if (existingFoodHistoryUserInfo.length === 0) {
      res.status(404).send({ status: 'Not Found', message: 'User food history not found' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Something when wrong from server. please try again' });
  }
};

const historyFood = async (req, res) => {
  const { uid, breakfast, lunch, dinner } = req.body;
  try {
    const existingFoodHistoryUserQuery = 'SELECT * FROM food_records WHERE user_id = ?';
    const existingFoodHistoryUserInfo = await db.query(existingFoodHistoryUserQuery, [uid]);

    if (existingFoodHistoryUserInfo.length === 0) {
      res.status(404).send({ status: 'Not Found', message: 'User food history not found' });
    }

    if (existingFoodHistoryUserInfo.length > 0) {
      const updateFoodHistoryUserQuery =
        'UPDATE food_records SET breakfast = ?, lunch = ?, dinner = ? WHERE user_id = ?';
      const updateFoodHistoryUserResult = await db.query(updateFoodHistoryUserQuery, [breakfast, lunch, dinner, uid]);
      res.status(200).json({ status: 'update food history success', foodHistory: updateFoodHistoryUserResult[0] });
    } else {
      const updateFoodHistoryUserQuery =
        'INSERT INTO food_records (uid, breakfast, lunch, dinner, user_id) VALUES (?, ?, ?, ?, ?)';
      const insertFoodHistoryUserResult = await db.query(updateFoodHistoryUserQuery, [
        uuid,
        breakfast,
        lunch,
        dinner,
        uid,
      ]);
      res.status(201).json({ status: 'insert food history success', foodHistory: insertFoodHistoryUserResult[0] });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

// mendapatkan semua list alergi yang ada di database
const alergi = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM alergi');
    res
      .status(result.length === 0 ? 404 : 200)
      .send(result.length === 0 ? { message: 'Requested Data is Unavailable' } : { result });
  } catch (error) {
    res.status(500).json({ status: 500, message: 'Something when wrong from server. Please try again' });
  }
};

module.exports = { historyFood, getHistoryFood, alergi };
