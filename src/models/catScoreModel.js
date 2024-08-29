const mongoose = require('mongoose')

const catScoreSchema = new mongoose.Schema({
    id: {type:Number || String, required:true},
    ediScore: {type:String , required:true},
    idiScore :{type:String , required:true},
    cdiScore :{type:String , required:true},
    OhiScore :{type:String , required:true},
    edi_weight:{type:String},
    idi_weight:{type:String},
    cdi_weight:{type:String},
    id:{type:Number, required:true},
},{ timestamps : true})

module.exports = mongoose.model('categoryScore',catScoreSchema)