const express = require('express');
const categoryController = require('../controllers/categoryController');
const router = express.Router();

router.post('/add', categoryController.addCategory);

module.exports = router;
