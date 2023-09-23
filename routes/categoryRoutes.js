const express = require('express');
const categoryController = require('../controllers/categoryController');
const router = express.Router();

router.post('/add', categoryController.addCategory);
router.get('/listOfCategories', categoryController.listOfCategories);
router.get('/allCategoriesNames', categoryController.allCategoriesNames);
router.delete('/deleteCategory/:id', categoryController.deleteCategory);
router.get('/getCategory/:id', categoryController.getCategory);
router.put('/updateCategory/:id', categoryController.updateCategory);

module.exports = router;
