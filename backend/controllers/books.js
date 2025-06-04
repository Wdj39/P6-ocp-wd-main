const Book = require('../models/book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    averageRating: 0,
    ratings: []
  });
  book.save()
    .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
    .catch(error => res.status(400).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
}

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) {
        return res.status(404).json({ error: new Error('Livre non trouvé !') });
      }
      res.status(200).json(book);
    })
    .catch(error => res.status(500).json({ error }));
};

exports.updateBook = (req, res, next) => {
  let bookObject;

  // Cas 1 : une image est envoyée → on parse req.body.book
  if (req.file && req.body.book) {
    try {
      bookObject = {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
      };
    } catch (error) {
      return res.status(400).json({ message: 'Données JSON invalides', error });
    }
  }
  // Cas 2 : pas de fichier → on prend req.body tel quel
  else {
    bookObject = { ...req.body };
  }

  // Rechercher et sécuriser la modification
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) return res.status(404).json({ message: 'Livre non trouvé' });

      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Livre modifié !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) return res.status(404).json({ message: 'Livre non trouvé' });

      if (book.userId !== req.auth.userId) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      const filename = book.imageUrl.split('/images/')[1];
      const fs = require('fs');
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Livre supprimé !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.rateBook = (req, res, next) => {
  const { userId, rating } = req.body;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: 'Note invalide. Doit être entre 0 et 5.' });
  }

  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) return res.status(404).json({ message: 'Livre non trouvé' });

      const alreadyRated = book.ratings.find(r => r.userId === userId);
      if (alreadyRated) {
        return res.status(403).json({ message: 'Vous avez déjà noté ce livre.' });
      }

      // Ajouter la note
      book.ratings.push({ userId, grade: rating });

      // Recalculer la moyenne
      const sum = book.ratings.reduce((acc, r) => acc + r.grade, 0);
      book.averageRating = Math.round((sum / book.ratings.length) * 10) / 10;

      book.save()
        .then(updatedBook => res.status(200).json(updatedBook))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getBestRatedBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Tri décroissant
    .limit(3)
    .select('title averageRating imageUrl') // ⬅️ sélection des champs visibles
    .then(books => res.status(200).json(books))
    .catch(error => res.status(500).json({ error }));
};



// Récupérer un seul livre par ID (version renommée si besoin)
exports.getBestRatedBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
      res.status(200).json(book);
    })
    .catch(error => res.status(500).json({ error }));
};
