const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Route 
router.get('/getAllUser', adminController.getAllUser);
router.get('/getUserById/:id', adminController.getUserById);
router.post('/create', adminController.createAccount);
router.put('/changeRole/:id', adminController.changeRole);
router.delete("/deleteUser/:id", adminController.deleteUser);

router.get('/stats', adminController.getUserStats);

router.get('/getAllEvent', adminController.getAllEvent);



module.exports = router;