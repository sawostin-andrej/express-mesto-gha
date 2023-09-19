const jwt = require('jsonwebtoken');
const UnAuthorizedError = require('../utils/constants/unAuthorizedError');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnAuthorizedError('Необходима авторизация.');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, 'token');
  } catch (err) {
    throw new UnAuthorizedError('Необходима авторизация.');
  }

  req.user = payload;

  next();
};
