const mongoose = require('mongoose')

const catScoreSchema = new mongoose.Schema({
    id: {type:Number || String, required:true},
    ediScore: {type:String , required:true},
    idiScore :{type:String , required:true},
    cdiScore :{type:String , required:true},
    OhiScore :{type:String , required:true} 
},{ timestamps : true})

module.exports = mongoose.model('categoryScore',catScoreSchema)