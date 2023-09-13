const { default: mongoose } = require('mongoose');
const Card = require('../models/card');
const {
  CAST_ERROR,
  NOT_FOUND_CODE,
  SERVER_ERROR,
} = require('../errors/constants');

module.exports.addCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(CAST_ERROR).send({ message: 'Переданы некорректные данные' });
      } else {
        res.status(SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail()
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CAST_ERROR) {
        res.status(CAST_ERROR).send({ message: 'Переданы некорректные данные' });
      } else if (err instanceof mongoose.Error.NOT_FOUND_CODE) {
        res.status(NOT_FOUND_CODE).send({ message: 'Карточка не найдена' });
      } else {
        res.status(SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((likes) => res.send({ data: likes }))
    .catch((err) => {
      if (err instanceof mongoose.Error.CAST_ERROR) {
        res.status(CAST_ERROR).send({ message: 'Переданы некорректные данные' });
      } else if (err instanceof mongoose.Error.NOT_FOUND_CODE) {
        res.status(NOT_FOUND_CODE).send({ message: 'Карточка не найдена' });
      } else {
        res.status(SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((likes) => res.send({ data: likes }))
    .catch((err) => {
      if (err instanceof mongoose.Error.CAST_ERROR) {
        res.status(CAST_ERROR).send({ message: 'Переданы некорректные данные' });
      } else if (err instanceof mongoose.Error.NOT_FOUND_CODE) {
        res.status(NOT_FOUND_CODE).send({ message: 'Карточка не найдена' });
      } else {
        res.status(SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};
