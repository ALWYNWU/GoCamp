const express = require('express');
const router = express.Router();
const passport =require('passport')
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const checkReturnTo = require('../middleware')
const usersController = require('../controllers/usersController')

router.route('/register')
    .get(usersController.toRegister)

    .post(catchAsync(usersController.register))


router.route('/login')
    .get(usersController.toLogin)

    /**
     * passport.authenticate middleware
     * @failureFlash 如果登陆失败是否有flash
     * @keepSessionInfo true IMPORTANT 保留session 实现登陆玩回到当前页面
     */
    .post( passport.authenticate('local', 
                {failureFlash: true, 
                failureRedirect: '/login', 
                keepSessionInfo: true}), 
            usersController.login);

router.get('/logout', usersController.logout); 

module.exports = router;