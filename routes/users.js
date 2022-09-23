const express = require('express');
const router = express.Router();
const passport =require('passport')
const catchAsync = require('../utils/catchAsync');
const usersController = require('../controllers/usersController')

router.route('/register')

    /**
     * Route to register page
     * Endpoint: /register ===> GET
     */
    .get(usersController.toRegister)

    /**
     * Register new user
     * Endpoint: /register ===> POST
     */
    .post(catchAsync(usersController.register))

router.route('/login')

    /**
     * Route to login page
     * Endpoint: /login ===> GET
     */
    .get(usersController.toLogin)

    /**
     * User Login
     * passport.authenticate middleware
     * @failureFlash: If login fails, if there is a flash
     * @keepSessionInfo: true IMPORTANT keep session (After login, return to the page before login)
     */
    .post( passport.authenticate('local', 
                {failureFlash: true, 
                failureRedirect: '/login', 
                keepSessionInfo: true}), 
            usersController.login);

/**
 * User logout
 * Endpoint: /logout ===> GET
 */
router.get('/logout', usersController.logout); 

// Export module
module.exports = router;