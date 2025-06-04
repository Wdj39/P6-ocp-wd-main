const express = require('express');
const router = express.Router();
const bookCtrl = require('../controllers/books');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// ⭐ Routes de notation (🔁 Doivent être placées en premier)
router.get('/bestrating', auth, bookCtrl.getBestRatedBooks);
router.get('/bestrating/:id', auth, bookCtrl.getBestRatedBook); // facultatif

// 🟢 Routes publiques
router.get('/', bookCtrl.getAllBooks);                      // Tous les livres
router.get('/:id', bookCtrl.getOneBook);                    // Livre par ID

// 🔒 Routes authentifiées
router.post('/', auth, multer, bookCtrl.createBook);        // Créer un livre
router.put('/:id', auth, multer, bookCtrl.updateBook);      // Modifier un livre
router.delete('/:id', auth, bookCtrl.deleteBook);           // Supprimer un livre
router.post('/:id/rating', auth, bookCtrl.rateBook);        // Noter un livre

module.exports = router;
