const firebaseAuth = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  // const token = req.headers.authorization?.split(' ')[0];
  const { token } = req.body;

  if (!token) {
    try {
      const decodedSession = await firebaseAuth.auth().verifySessionCookie();
      req.uid = decodedSession.uid;
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
    // return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decodedToken = await firebaseAuth.auth().verifyIdToken(token);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = verifyToken;
