const router = require('express').Router();
const users = require('./users');
const cards = require('./cards');
const signupRouter = require('./signup');
const signinRouter = require('./signin');
const auth = require('../middlewares/auth');

const { NotFoundError } = require('../utils/constants/notFoundError');

router.use('/signup', signupRouter);
router.use('/signin', signinRouter);
router.use(auth);
router.use('/users', users);
router.use('/cards', cards);

router.use('*', (req, res, next) => {
  next(new NotFoundError('Страница не найдена.'));
});

module.exports = router;
