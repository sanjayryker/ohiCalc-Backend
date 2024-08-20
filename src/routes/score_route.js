const express = require('express')
const { get_keyIndScore_EDI, get_keyIndScore_CDI, get_keyIndScore_IDI,get_CategoryScore_All,post_KeyInd_Weight,get_KeyInd_Weight,get_Category_Weight,post_Category_Weight } = require('../controllers/score_Controller')
const router = express.Router()

router.get('/keyIndScore/EDI',get_keyIndScore_EDI)
router.get('/keyIndScore/CDI',get_keyIndScore_CDI)
router.get('/keyIndScore/IDI',get_keyIndScore_IDI)
router.get('/CategoryScore/all',get_CategoryScore_All)
router.post('/keyIndWeight/get',get_KeyInd_Weight)
router.post('/keyIndWeight/post',post_KeyInd_Weight)
router.post('/categoryWeight/post',post_Category_Weight)
router.get('/categoryWeight/get',get_Category_Weight)

module.exports = router