const express = require('express');
const router = express.Router();
const bookCtrl = require('../controllers/books');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

// 🟢 Routes publiques
router.get('/', bookCtrl.getAllBooks);                      // Tous les livres
router.get('/:id', bookCtrl.getOneBook);                    // Livre par ID

// 🔒 Routes authentifiées
router.post('/', auth, multer, bookCtrl.createBook);        // Créer un livre
router.put('/:id', auth, multer, bookCtrl.updateBook);      // Modifier un livre
router.delete('/:id', auth, bookCtrl.deleteBook);           // Supprimer un livre
router.post('/:id/rating', auth, bookCtrl.rateBook);        // Noter un livre

// ⭐ Routes de notation
router.get('/bestrating', auth, bookCtrl.getBestRatedBooks);       // Top 3 livres
router.get('/bestrating/:id', auth, bookCtrl.getBestRatedBook);    // Détail d’un top livre (utile si besoin)

module.exports = router;
