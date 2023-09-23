const express = require('express');
const userController = require('../controllers/userController');
const router = express.Router();

router.post('/signup', userController.signUp);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/listOfCustomers', userController.listOfCustomers);
router.delete('/deleteCustomer/:id', userController.deleteCustomer);
router.put('/changeStatus/:id', userController.changeStatus);

module.exports = router;
