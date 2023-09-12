const { default: mongoose } = require('mongoose');
const Card = require('../models/card');
const {
  CastError,
  DocumentNotFoundError,
  ServerError,
} = require('../utils/constants');

module.exports.addCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(201).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(CastError).send({ message: err.message });
      } else {
        res.status(ServerError).send({ message: 'На сервере произошла ошибка' });
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
      if (err instanceof mongoose.Error.CastError) {
        res.status(CastError).send({ message: 'Некорректный _id карточки' });
      } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(DocumentNotFoundError).send({ message: 'Карточка не найдена' });
      } else {
        res.status(ServerError).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new DocumentNotFoundError('Карточка не найдена');
    })
    .then((likes) => res.send({ data: likes }))
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        res.status(CastError).send({ message: 'Некорректный _id карточки' });
      } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(DocumentNotFoundError).send({ message: 'Карточка не найдена.' });
      } else {
        res.status(ServerError).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail(() => {
      throw new DocumentNotFoundError('Карточка не найдена');
    })
    .then((likes) => res.send({ data: likes }))
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        res.status(CastError).send({ message: 'Некорректный _id карточки' });
      } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(DocumentNotFoundError).send({ message: 'Карточка не найдена.' });
      } else {
        res.status(ServerError).send({ message: 'На сервере произошла ошибка' });
      }
    });
};
