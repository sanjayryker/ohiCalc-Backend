const mongoose = require('mongoose')
const ediModel = require('../models/EDI_model')
const edi_dataset = require('../dataset/edi_dataset')
const keyScore_model = require('../models/keyScore_model')

const add_Edi_Data = async(req,res) =>{

    let keyIndicatorScore = null

    const keyScoreCalc = async(keyInd) =>{
        const allData = await ediModel.find({keyInd})
        const comparingData = edi_dataset.find((data) => data[`keyInd${keyInd}`])  
            //Calculation
            if(allData.length == comparingData[`keyInd${keyInd}`].subInd_total){
                const sortedData = allData.sort((a,b) => Number(a.ind)-Number(b.ind))
                const ind_Weight = comparingData[`keyInd${keyInd}`].ind_Weight
                const indScoreXweight = sortedData.map((data) => data.ind_score*ind_Weight/100)
                keyIndicatorScore = indScoreXweight.reduce((a,b) => {return a+b},0)

                //Payload
                const keyIndData = {
                    category:"EDI",
                    keyInd: keyInd,
                    keyInd_name:comparingData[`keyInd${keyInd}`].name,
                    keyInd_Score:keyIndicatorScore,
                }

                //Update or Create
                const findSimilarData = await keyScore_model.findOne({category:"EDI", keyInd})
                if(!findSimilarData){ await keyScore_model.create(keyIndData)}
                else{ await keyScore_model.findOneAndUpdate({category:"EDI", keyInd},keyIndData,{new:true})}
            }
    }
    

    try{
        const {keyInd,ind} = req.body
        const data = await ediModel.findOne({keyInd, ind})

            if(data){
                const updatedData = await ediModel.findOneAndUpdate({keyInd, ind},req.body,{new:true})
                await keyScoreCalc(keyInd)
                res.status(201).json({message:"Updated Successfully", data:updatedData,keyScore:keyIndicatorScore})
            }else{
                const data = await ediModel.create(req.body)
                const {keyInd} = req.body
                await keyScoreCalc(keyInd)
                res.status(200).json({message:"Created Successfully",data,keyScore:keyIndicatorScore})
            }

    }catch(error){
        res.status(400).json({msg : error.message})
    }  
}

const get_Edi_Data = async(req,res) =>{

    const {category,key,ind} = req.body
    const keyInd_num = key.slice(-1)
    const ind_num = ind.slice(-1)

    try{
        const data = await ediModel.findOne({keyInd:keyInd_num,ind:ind_num}) 
        res.status(200).json(data)
    }catch(err){
        res.status(400).json({msg : err.message})
    }  
}

module.exports = {get_Edi_Data,add_Edi_Data}