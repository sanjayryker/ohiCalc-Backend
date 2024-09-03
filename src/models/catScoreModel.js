const mongoose = require('mongoose')

const catScoreSchema = new mongoose.Schema({
    ediScore: {type:String},
    idiScore :{type:String},
    cdiScore :{type:String},
    OhiScore :{type:String},
    edi_weight:{type:String},
    idi_weight:{type:String},
    cdi_weight:{type:String},
    user_id:{type:mongoose.Schema.Types.ObjectId, required:true},
},{ timestamps : true})

module.exports = mongoose.model('categoryScore',catScoreSchema)