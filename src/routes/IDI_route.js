const {add_Idi_Data,get_Idi_Data} = require('../controllers/IDI_Controller')
const express = require('express')

const router = express.Router()

router.post('/postData',add_Idi_Data);

router.post('/getData',get_Idi_Data);

module.exports = router