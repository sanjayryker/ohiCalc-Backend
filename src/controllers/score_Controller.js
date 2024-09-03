// const mongoose = require('mongoose')
// const keyScore_model = require('../models/keyScore_model')
const category_dataset = require('../dataset/category_dataset');
// const keyScore_model = require('../models/keyScore_model');

const get_keyIndScore_EDI = async(req,res) =>{
    const keyScore_model = req.dbConnection.model('keyScore', require('../models/keyScore_model').schema)
    const id = req.user._id
    try {
        const data = await keyScore_model.find({ category: "EDI", user_id:id })
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({error: error.message })
    }
}

const get_keyIndScore_CDI = async(req,res) =>{
    const keyScore_model = req.dbConnection.model('keyScore', require('../models/keyScore_model').schema)
    const id = req.user._id
    try {
        const data = await keyScore_model.find({ category: "CDI" , user_id:id})
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json({error: error.message })
    }
}

const get_keyIndScore_IDI = async(req,res) =>{
    const keyScore_model = req.dbConnection.model('keyScore', require('../models/keyScore_model').schema)
    const id = req.user._id
    try {
        const data = await keyScore_model.find({ category: "IDI", user_id:id });
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
    const id = req.user._id
    
    const dbName = req.dbConnection.name
    try{
        const data =await keyScore_model.find({user_id:id})
        const categories = ["EDI","IDI","CDI"]
        const scores =["ediScore","idiScore","cdiScore"]

        const payload = {
            user_id:id,
            ediScore : '',
            idiScore : '',
            cdiScore : '',
            OhiScore : ''
        }

        categories.forEach((category) =>{
            const categoryData = data.filter(value => value.category === category);
            const categoryDataset = category_dataset.find(value => value.category === category);
            // console.log(`Processing category: ${category}`);
            // console.log('Filtered Data:', categoryData);
            // console.log('Dataset:', categoryDataset);


            if (category === 'EDI') {
                // console.log('EDI Data Length:', categoryData.length);
                // console.log('EDI Dataset KeyInd_Total:', categoryDataset ? categoryDataset.keyInd_Total : 'Dataset not found');
                payload.ediScore = calculateCategoryScore(categoryData, categoryDataset, dbName);
            } else if (category === 'CDI') {
                payload.cdiScore = calculateCategoryScore(categoryData, categoryDataset, dbName);
            } else if (category === 'IDI') {
                payload.idiScore = calculateCategoryScore(categoryData, categoryDataset, dbName);
            }
        })

        
        // OHI Score Calculation
        if(payload.ediScore !== null && payload.idiScore !== null && payload.cdiScore !== null){
            if(dbName === "Ohi-Values"){
                payload.OhiScore = (payload.ediScore + payload.idiScore + payload.cdiScore)*33.33
            }else if(dbName === "Ohi-Weight-Values"){

                // const data = await catScoreModel.findOne({id:1})
                // if(data && data.edi_weight && data.edi_weight && data.edi_weight){
                //     payload.OhiScore = payload.ediScore*data.edi_weight + payload.idiScore*data.idi_weight + payload.cdiScore*data.cdi_weight 
                // }else{
                    // payload.OhiScore = 1
                // }
                const data = await catScoreModel.findOne({user_id:id})
                if(data){
                    if( data.edi_weight && data.edi_weight && data.edi_weight){
                        payload.OhiScore = payload.ediScore*data.edi_weight + payload.idiScore*data.idi_weight + payload.cdiScore*data.cdi_weight 
                    }else{
                        payload.OhiScore = 0
                    }
                }else{
                    payload.OhiScore = 0
                }
            }
        }
        
        const catData = await catScoreModel.find({user_id:id})
        
        if(catData.length > 0){
           await catScoreModel.findOneAndUpdate({user_id:id},payload,{new:true})
           res.status(200).json(payload)
        }else{
            await catScoreModel.create(payload)
            res.status(200).json(payload)
        }

        for(let i=0;i<categories.length;i++){
            const ECI_model = req.dbConnection.model(`${categories[i]}_value`, require(`../models/${categories[i]}_model`).schema)  // TO choose which model(edi,cdi,idi) to update
            await ECI_model.updateMany(
                {category:categories[i], user_id:id},
                {$set:{category_score: payload[scores[i]]}}
            )
        }

    }catch(error){
        res.status(500).json({error:error.message})
    }
}

const post_KeyInd_Weight = async(req,res) =>{
    const path = req.body.path
    const weights = req.body.weights
    const id = req.user._id

    const keyScore_model = req.dbConnection.model('keyScore', require('../models/keyScore_model').schema)
    const ECI_model = req.dbConnection.model(`${path}_value`, require(`../models/${path}_model`).schema)  // TO choose which model(edi,cdi,idi) to update
    
    try{
        const datas = await keyScore_model.find({category:path, user_id:id}).sort({keyInd : 1})
        
        const modelData = await ECI_model.find({category:path, user_id:id}).sort({keyInd : 1})
        
        // const modelData = await 
        for(i=0; i< datas.length; i++){
            const keyInd = datas[i].keyInd
            const weight = weights[i]

            await Promise.all([
                keyScore_model.updateMany(
                    { category: path, keyInd: keyInd, user_id:id },
                    { $set: { keyInd_weight: weight } }
                ),
                ECI_model.updateMany(
                    { category: path, keyInd: keyInd, user_id:id },
                    { $set: { keyInd_weight: weight } }
                )
            ])

        }
        const updatedDatas = await keyScore_model.find({ category: path, user_id:id }).sort({ keyInd: 1 })

        res.status(201).json(updatedDatas)  
    }catch(err){
        res.status(500).json({err:err.message})
    }
}

const get_KeyInd_Weight = async(req,res) =>{
    const id = req.user._id
    try{
        const keyScore_model = req.dbConnection.model('keyScore', require('../models/keyScore_model').schema)
        const path = req.body.path
        const data = await keyScore_model.find({category:path, user_id:id}).sort({keyInd:1});
        res.status(200).json(data)
    }catch(err){
        res.status(500).json({err:err.message})
    }
    
}

const post_Category_Weight = async (req,res) =>{
    const id = req.user._id
    try{
        const catScoreModel = req.dbConnection.model('categoryScore', require('../models/catScoreModel').schema)

        const data = await catScoreModel.findOneAndUpdate({user_id:id},req.body,{new:true})

        const dataset = ["EDI","IDI","CDI"]
        const dataArray =[req.body.edi_weight, req.body.idi_weight, req.body.cdi_weight]
       
        for(let i=0;i<dataset.length;i++){
            const ECI_model = req.dbConnection.model(`${dataset[i]}_value`, require(`../models/${dataset[i]}_model`).schema)  // TO choose which model(edi,cdi,idi) to update
            
            await ECI_model.updateMany(
                {category:dataset[i], user_id:id},
                {$set:{category_weight: dataArray[i]}}
            )
        }
        const ohiScore = data.edi_weight*data.ediScore + data.cdi_weight*data.cdiScore + data.idi_weight*data.idiScore
        res.status(200).json({msg:'Successfully Updated', data, ohiScore})
    }catch(err){
        res.status(500).json({err:err.message})
    }
}

const get_Category_Weight = async (req,res) =>{
    const id = req.user._id
    try{
        const catScoreModel = req.dbConnection.model('categoryScore', require('../models/catScoreModel').schema)
        const data = await catScoreModel.findOne({user_id:id})
        res.status(200).json(data)
    }catch{
        res.status(500).json({err:err.message})
    }
}  


module.exports = {get_keyIndScore_EDI,get_keyIndScore_IDI,get_keyIndScore_CDI,get_CategoryScore_All, post_KeyInd_Weight,get_KeyInd_Weight,post_Category_Weight,get_Category_Weight}
