const {add_Edi_Data,get_Edi_Data} = require('../controllers/EDI_Controller')
const express = require('express')

const router = express.Router()

router.post('/postData',add_Edi_Data);

router.post('/getData',get_Edi_Data);

module.exports = router