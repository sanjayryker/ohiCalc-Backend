const express = require('express')
const { get_keyIndScore_EDI, get_keyIndScore_CDI, get_keyIndScore_IDI,get_CategoryScore_All } = require('../controllers/score_Controller')
const router = express.Router()

router.get('/keyIndScore/EDI',get_keyIndScore_EDI)
router.get('/keyIndScore/CDI',get_keyIndScore_CDI)
router.get('/keyIndScore/IDI',get_keyIndScore_IDI)
router.get('/CategoryScore/all',get_CategoryScore_All)

module.exports = router