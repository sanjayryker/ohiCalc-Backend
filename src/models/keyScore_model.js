const mongoose = require('mongoose')

const keyScore_schema = new mongoose.Schema({
    category: { type: String, required: true},
    keyInd: { type: String, required: true},
    keyInd_name:{ type:String, required:true},
    keyInd_Score:{type:String, required:true},
    keyInd_weight:{type:String},
    user_id:{type:mongoose.Schema.Types.ObjectId, required:true},
},{ timestamps : true})

module.exports = mongoose.model('keyScore' ,keyScore_schema)