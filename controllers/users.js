const { default: mongoose } = require('mongoose');
const {
  CREATED,
  CAST_ERROR,
  NOT_FOUND_CODE,
  SERVER_ERROR,
} = require('../errors/constants');
const User = require('../models/user');

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ users }))
    .catch(() => res.status(SERVER_ERROR).send({ message: 'На сервере произошла ошибка' }));
};

module.exports.getUserById = (req, res) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CAST_ERROR) {
        res.status(CAST_ERROR).send({ message: `Переданы некорректные данные ${req.params.userId}.` });
      } else if (err instanceof mongoose.Error.NOT_FOUND_CODE) {
        res.status(NOT_FOUND_CODE).send({ message: `Пользователь ${req.params.userId} не найден` });
      } else {
        res.status(SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.addUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(CREATED).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(CAST_ERROR).send({ message: 'Переданы некорректные данные' });
      } else {
        res.status(SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.editUserData = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(CAST_ERROR).send({ message: 'Переданы некорректные данные' });
      } else if (err instanceof mongoose.Error.NOT_FOUND_CODE) {
        res.status(NOT_FOUND_CODE).send({ message: 'Пользователь не найден' });
      } else {
        res.status(SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.editUserAvatar = (req, res) => {
  User.findByIdAndUpdate(req.user._id, { avatar: req.body.avatar }, { new: 'true', runValidators: true })
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        res.status(CAST_ERROR).send({ message: 'Переданы некорректные данные' });
      } else if (err instanceof mongoose.Error.NOT_FOUND_CODE) {
        res.status(NOT_FOUND_CODE).send({ message: 'Пользователь не найден' });
      } else {
        res.status(SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};
