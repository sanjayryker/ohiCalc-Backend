const mongoose = require('mongoose')
const cdiModel = require('../models/CDI_model')
const cdi_dataset = require('../dataset/cdi_dataset')
const keyScore_model = require('../models/keyScore_model')

const add_Cdi_Data = async(req,res) =>{

    try{
        const {keyInd,ind} = req.body

        try{
            const data = await cdiModel.findOne({keyInd, ind})

            if(data){
                const updatedData = await cdiModel.findOneAndUpdate({keyInd, ind},req.body,{new:true})
                
                let keyIndicatorscore = null
                // Calculate Key Indicator Weight
                const allData = await cdiModel.find({keyInd})
                const comparingData = cdi_dataset.find((data) => data[`keyInd${keyInd}`])

                if(allData.length == comparingData[`keyInd${keyInd}`].subInd_total){
                    const sortedData = allData.sort((a,b) => Number(a.ind)-Number(b.ind))
                    const weightedArray = comparingData[`keyInd${keyInd}`].keyInd_weight
                    const indScoreXweight = sortedData.map((data,index) => data.ind_score*weightedArray[index]/100) 
                    keyIndicatorscore = indScoreXweight.reduce((a,b) => {return a+b},0)

                    const keyIndData = {
                        category:"EDI",
                        keyInd: keyInd,
                        keyInd_name:comparingData[`keyInd${keyInd}`].name,
                        keyInd_Score:keyIndicatorscore,
                    }

                    try{
                        const findSimilarData = keyScore_model.find({category:"CDI",keyInd})
                        if(!findSimilarData){ await keyScore_model.create(keyIndData)}
                    }catch(err){res.status(400).json({msg : err.message})}
                }

                res.status(201).json({message:"Updated Successfully", data:updatedData,keyScore:keyIndicatorscore})
            }else{
                const data = await cdiModel.create(req.body)
                res.status(200).json({message:"Created Successfully",data}) 
            }
        }catch(err){
            res.status(400).json({msg : err.message})
        }

    }catch(error){
        res.status(400).json({msg : error.message})
    }  
}

const get_Cdi_Data = async(req,res) =>{

    const {category,key,ind} = req.body

    const keyInd_num = key.slice(-1)
    const ind_num = ind.slice(-1)

    try{
        const data = await cdiModel.findOne({keyInd:keyInd_num,ind:ind_num}) 
        res.status(200).json(data)
    }catch(err){
        res.status(400).json({msg : err.message})
    }  
}

module.exports = {get_Cdi_Data,add_Cdi_Data}