const express = require('express');
const router = express.Router();

const {userController, dashboardController} = require('../../../controllers');
const {adminAuthMiddleware} = require('../../../middlewares');
const {roleMiddleware} = require('../../../middlewares')


router.get('/getAllUsers',[adminAuthMiddleware.validateJWTtoken],userController.getAllUsers);
router.get('/getUserById',userController.getUserById);
router.post('/deleteUser',userController.deleteUser);
router.post('/createUser',[adminAuthMiddleware.validateJWTtoken],userController.adminAddUser);


// dashboard routes
router.get("/dashboard/stats", dashboardController.getDashboardStats);

module.exports = router;