const express = require('express')
const {signupUser , loginUser, forgotPassword} = require('../controllers/user_Controller')
const router = express.Router()

router.post('/login', loginUser);

router.post('/signup', signupUser);

router.post('/forgotPassword',forgotPassword);

module.exports = router