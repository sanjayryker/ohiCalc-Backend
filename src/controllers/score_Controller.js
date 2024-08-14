// const mongoose = require('mongoose')
// const keyScore_model = require('../models/keyScore_model')
const category_dataset = require('../dataset/category_dataset');
const keyScore_model = require('../models/keyScore_model');

const get_keyIndScore_EDI = async(req,res) =>{
    const keyScore_model = req.dbConnection.model('keyScore', require('../models/keyScore_model').schema);
    try {
        const data = await keyScore_model.find({ category: "EDI" });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: error.message })
    }
}

const get_keyIndScore_CDI = async(req,res) =>{
    const keyScore_model = req.dbConnection.model('keyScore', require('../models/keyScore_model').schema);
    try {
        const data = await keyScore_model.find({ category: "CDI" });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: error.message });
    }
}

const get_keyIndScore_IDI = async(req,res) =>{
    const keyScore_model = req.dbConnection.model('keyScore', require('../models/keyScore_model').schema);
    try {
        const data = await keyScore_model.find({ category: "IDI" });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({error: error.message });
    }
}

const calculateCategoryScore = (data, dataset, dbName) => {
    if (data.length === dataset.keyInd_Total) {
        const sortedData = data.sort((a, b) => Number(a.keyInd) - Number(b.keyInd));
        if(dbName === "Ohi-Values"){
            const weightedScores = sortedData.map((value) => value.keyInd_Score * dataset.keyInd_Weight / 100)
            return weightedScores.reduce((a, b) => a + b, 0);
        }else if(dbName === "Ohi-Weight-Values"){
            const weightedScores = sortedData.map((value) => value.keyInd_Score * value.keyInd_weight / 100)
            return weightedScores.reduce((a, b) => a + b, 0);       
        }
    }
    return null;
};

const get_CategoryScore_All = async(req,res) =>{
    const keyScore_model = req.dbConnection.model('keyScore', require('../models/keyScore_model').schema)
    const catScoreModel = req.dbConnection.model('categoryScore', require('../models/catScoreModel').schema)
    try{
        const data =await keyScore_model.find()

        const categories = ["EDI","IDI","CDI"]

        const payload = {
            id:1,
            ediScore : '',
            idiScore : '',
            cdiScore : '',
            OhiScore : ''
        }


        categories.forEach((category) =>{
            const categoryData = data.filter(value => value.category === category);
            const categoryDataset = category_dataset.find(value => value.category === category);
            const dbName = req.dbConnection.name
            if (category === 'EDI') {
                payload.ediScore = calculateCategoryScore(categoryData, categoryDataset, dbName);
            } else if (category === 'CDI') {
                payload.cdiScore = calculateCategoryScore(categoryData, categoryDataset, dbName);
            } else if (category === 'IDI') {
                payload.idiScore = calculateCategoryScore(categoryData, categoryDataset, dbName);
            }
        })

        // OHI Score Calculation
        if(payload.ediScore !== null && payload.idiScore !== null && payload.idiScore !== null){
            payload.OhiScore = (payload.ediScore + payload.idiScore + payload.cdiScore)*33.33
        }
        
        const catData = await catScoreModel.find({id:1})

        if(catData.length > 0){
           await catScoreModel.findOneAndUpdate({id:1},payload,{new:true})
           res.status(200).json(payload)
        }else{
            await catScoreModel.create(payload)
            res.status(200).json(payload)
        }       

    }catch(error){
        res.status(500).json({error:error.message})
    }
}

const post_KeyInd_Weight = async(req,res) =>{

    const keyScore_model = req.dbConnection.model('keyScore', require('../models/keyScore_model').schema)
    const path = req.body.path
    const weights = req.body.weights
    try{
        const datas = await keyScore_model.find({category:path})
        const sortedDatas = datas.sort((a,b) => Number(a.keyInd)-Number(b.keyInd))
        for(i=0; i< sortedDatas.length; i++){
            const keyInd = sortedDatas[i].keyInd
            const weight = weights[i]

            await keyScore_model.updateMany(
                {keyInd : keyInd},
                {$set:{keyInd_weight: weight}}
                )
        }
        const updatedDatas = await keyScore_model.find({ category: path }).sort({ keyInd: 1 });
        res.status(201).json(updatedDatas)
    }catch(err){
        res.status(500).json({err:err.message})
    }
}

const get_KeyInd_Weight = async(req,res) =>{

    const keyScore_model = req.dbConnection.model('keyScore', require('../models/keyScore_model').schema)
    const path = req.body.path
    const data = await keyScore_model.find({category:path}).sort({keyInd:1});
    res.status(200).json(data)
}


module.exports = {get_keyIndScore_EDI,get_keyIndScore_IDI,get_keyIndScore_CDI,get_CategoryScore_All, post_KeyInd_Weight,get_KeyInd_Weight}
