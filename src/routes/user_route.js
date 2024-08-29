const express = require('express')
const {signupUser , loginUser} = require('../controllers/user_Controller')
const router = express.Router()

router.post('/login', loginUser)

router.post('/signup', signupUser)

module.exports = router