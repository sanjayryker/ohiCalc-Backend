const {add_Cdi_Data,get_Cdi_Data} = require('../controllers/CDI_Controller')
const express = require('express')

const router = express.Router()

router.post('/postData',add_Cdi_Data);

router.post('/getData',get_Cdi_Data);

module.exports = router