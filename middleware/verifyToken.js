const { admin } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
  // const token = req.headers.authorization?.split(' ')[1] || req.cookies.session;
  const { session } = req.cookies.session;
  // const expiresIn = 5 * 60 * 1000;

  if (!session) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  try {
    const decodedSession = await admin.auth().verifySessionCookie(session, true);

    req.body.uid = decodedSession.uid;

    next();
  } catch (error) {
    res.status(401).send({ error: 'Unauthorized', message: error });
  }
};

module.exports = verifyToken;
