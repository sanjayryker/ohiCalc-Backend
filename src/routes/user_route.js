const express = require('express')
const {signupUser , loginUser, forgotPassword, resetPassword,verifySignup} = require('../controllers/user_Controller')
const router = express.Router()

router.post('/login', loginUser);

router.post('/signup', signupUser)

router.post('/verifySignup',verifySignup)

router.post('/forgotPassword',forgotPassword);

router.post('/resetPassword/:id/:token',resetPassword)

module.exports = router