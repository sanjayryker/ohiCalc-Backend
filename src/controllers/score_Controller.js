const mongoose = require('mongoose')
const keyScore_model = require('../models/keyScore_model')

const get_keyIndScore_EDI = async(req,res) =>{
    try {
        const data = await keyScore_model.find({ category: "EDI" });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: error.message });
    }
}

const get_keyIndScore_CDI = async(req,res) =>{
    try {
        const data = await keyScore_model.find({ category: "CDI" });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: error.message });
    }
}

const get_keyIndScore_IDI = async(req,res) =>{
    try {
        const data = await keyScore_model.find({ category: "IDI" });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: error.message });
    }
}

module.exports = {get_keyIndScore_EDI,get_keyIndScore_IDI,get_keyIndScore_CDI}
