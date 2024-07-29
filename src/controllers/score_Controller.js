const mongoose = require('mongoose')
const keyScore_model = require('../models/keyScore_model')
const category_dataset = require('../dataset/category_dataset')
const catScoreModel = require('../models/catScoreModel')

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

const calculateCategoryScore = (data, dataset) => {
    if (data.length === dataset.keyInd_Total) {
        const sortedData = data.sort((a, b) => Number(a.keyInd) - Number(b.keyInd));
        const weightedScores = sortedData.map((value) => value.keyInd_Score * dataset.keyInd_Weight / 100);
        return weightedScores.reduce((a, b) => a + b, 0);
    }
    return 0;
};

const get_CategoryScore_All = async(req,res) =>{
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

            if (category === 'EDI') {
                payload.ediScore = calculateCategoryScore(categoryData, categoryDataset);
            } else if (category === 'CDI') {
                payload.cdiScore = calculateCategoryScore(categoryData, categoryDataset);
            } else if (category === 'IDI') {
                payload.idiScore = calculateCategoryScore(categoryData, categoryDataset);
            }
        })

        // OHI Score Calculation
        payload.OhiScore = (payload.ediScore + payload.idiScore + payload.cdiScore)*33.33

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


module.exports = {get_keyIndScore_EDI,get_keyIndScore_IDI,get_keyIndScore_CDI,get_CategoryScore_All}
