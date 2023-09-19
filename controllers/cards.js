const { default: mongoose } = require('mongoose');
const Card = require('../models/card');
const { BadRequestError } = require('../utils/constants/badRequestError');
const { NotFoundError } = require('../utils/constants/notFoundError');
const { ForBiddenError } = require('../utils/constants/forBiddenError');

module.exports.addCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError(err.message));
      } else {
        next(err);
      }
    });
};

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send(cards))
    .catch((err) => next(err));
};

module.exports.deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card.owner.equals(req.user._id)) {
        throw new ForBiddenError('Невозможно удалить карточку другого пользователя.');
      }
      Card.deleteOne(card)
        .orFail()
        .then(() => {
          res.send({ message: 'Карточка удалена.' });
        })
        .catch((err) => {
          if (err instanceof mongoose.Error.CastError) {
            next(new BadRequestError('Переданы некорректные данные.'));
          } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
            next(new NotFoundError('Карточка не найдена.'));
          } else {
            next(err);
          }
        });
    })
    .catch((err) => {
      if (err.name === 'TypeError') {
        next(new NotFoundError('Карточка не найдена.'));
      } else {
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .orFail()
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Переданы некорректные данные.'));
      } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Карточка не найдена.'));
      } else {
        next(err);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .orFail()
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        next(new BadRequestError('Переданы некорректные данные.'));
      } else if (err instanceof mongoose.Error.DocumentNotFoundError) {
        next(new NotFoundError('Карточка не найдена.'));
      } else {
        next(err);
      }
    });
};
