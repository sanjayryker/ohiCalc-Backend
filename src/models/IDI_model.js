const mongoose = require('mongoose')

const valueSchema = new mongoose.Schema({
    subInd: { type: Number, required: true },
    subInd_name: { type: String, required: true },
    best: { type: Number },
    worst: { type: Number },
    current: { type: Number},
    normalized_value: { type: Number },
    weight: { type: String },
},{_id:false})

const idi_Schema = new mongoose.Schema({
    category: { type: String, required: true },
    keyInd_name:{ type:String, required:true},
    keyInd: { type: String, required: true },
    keyInd_weight:{ type: String},
    keyInd_score:{ type: Number},
    keyInd_status: { type: Boolean, default: false},
    ind_name: { type: String, required: true },
    ind: { type: String, required: true },
    ind_weight:{type : String},
    ind_score: { type: Number, required: true },
    category_score:{ type: Number},
    category_weight:{ type: Number},
    status: { type: Boolean, required: true},
    user_id:{type:mongoose.Schema.Types.ObjectId, required:true},
    values: [valueSchema]
} , { timestamps : true})

module.exports = mongoose.model('IDI_value',idi_Schema)   