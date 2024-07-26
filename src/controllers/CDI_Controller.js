const mongoose = require('mongoose')
const cdiModel = require('../models/CDI_model')
const cdi_dataset = require('../dataset/cdi_dataset')
const keyScore_model = require('../models/keyScore_model')

const add_Cdi_Data = async(req,res) =>{

    let keyIndicatorScore = null

    const keyScoreCalc = async(keyInd) =>{
        const allData = await cdiModel.find({keyInd})
        const comparingData = cdi_dataset.find((data) => data[`keyInd${keyInd}`])  
            //Calculation
            if(allData.length == comparingData[`keyInd${keyInd}`].subInd_total){
                const sortedData = allData.sort((a,b) => Number(a.ind)-Number(b.ind))
                const ind_Weight = comparingData[`keyInd${keyInd}`].ind_Weight
                const indScoreXweight = sortedData.map((data) => data.ind_score*ind_Weight/100)
                keyIndicatorScore = indScoreXweight.reduce((a,b) => {return a+b},0)

                //Payload
                const keyIndData = {
                    category:"CDI",
                    keyInd: keyInd,
                    keyInd_name:comparingData[`keyInd${keyInd}`].name,
                    keyInd_Score:keyIndicatorScore,
                }

                //Update or Create
                const findSimilarData = await keyScore_model.findOne({category:"CDI", keyInd})
                if(!findSimilarData){ await keyScore_model.create(keyIndData)}
                else{ await keyScore_model.findOneAndUpdate({category:"CDI", keyInd},keyIndData,{new:true})}
            }
    }
    

    try{
        const {keyInd,ind} = req.body
        const data = await cdiModel.findOne({keyInd, ind})
        
            if(data){
                const updatedData = await cdiModel.findOneAndUpdate({keyInd, ind},req.body,{new:true})
                await keyScoreCalc(keyInd)
                console.log(keyIndicatorScore)
                res.status(201).json({message:"Updated Successfully", data:updatedData,keyScore:keyIndicatorScore})
            }else{
                const data = await cdiModel.create(req.body)
                const {keyInd} = req.body
                await keyScoreCalc(keyInd)
                res.status(200).json({message:"Created Successfully",data,keyScore:keyIndicatorScore})
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