const mongoose = require('mongoose')
const idiModel = require('../models/IDI_model')
const idi_dataset = require('../dataset/idi_dataset')
const keyScore_model = require('../models/keyScore_model')

const add_Idi_Data = async(req,res) =>{

    let keyIndicatorScore = null

    const keyScoreCalc = async(keyInd) =>{
        const allData = await idiModel.find({keyInd})
        const comparingData = idi_dataset.find((data) => data[`keyInd${keyInd}`])  
            //Calculation
            if(allData.length == comparingData[`keyInd${keyInd}`].subInd_total){
                const sortedData = allData.sort((a,b) => Number(a.ind)-Number(b.ind))
                const ind_Weight = comparingData[`keyInd${keyInd}`].ind_Weight
                const indScoreXweight = sortedData.map((data) => data.ind_score*ind_Weight/100)
                keyIndicatorScore = indScoreXweight.reduce((a,b) => {return a+b},0)

                //Payload
                const keyIndData = {
                    category:"IDI",
                    keyInd: keyInd,
                    keyInd_name:comparingData[`keyInd${keyInd}`].name,
                    keyInd_Score:keyIndicatorScore,
                }

                //Update or Create
                const findSimilarData = await keyScore_model.findOne({category:"IDI", keyInd})
                if(!findSimilarData){ await keyScore_model.create(keyIndData)}
                else{ await keyScore_model.findOneAndUpdate({category:"IDI", keyInd},keyIndData,{new:true})}
            }
    }
    

    try{
        const {keyInd,ind} = req.body
        const data = await idiModel.findOne({keyInd, ind})

            if(data){
                const updatedData = await idiModel.findOneAndUpdate({keyInd, ind},req.body,{new:true})
                await keyScoreCalc(keyInd)
                console.log(keyIndicatorScore)
                res.status(201).json({message:"Updated Successfully", data:updatedData,keyScore:keyIndicatorScore})
            }else{
                const data = await idiModel.create(req.body)
                const {keyInd} = req.body
                await keyScoreCalc(keyInd)
                res.status(200).json({message:"Created Successfully",data,keyScore:keyIndicatorScore})
            }

    }catch(error){
        res.status(400).json({msg : error.message})
    }  
}

const get_Idi_Data = async(req,res) =>{

    const {category,key,ind} = req.body

    const keyInd_num = key.slice(-1)
    const ind_num = ind.slice(-1)

    try{
        const data = await idiModel.findOne({keyInd:keyInd_num,ind:ind_num}) 
        res.status(200).json(data)
    }catch(err){
        res.status(400).json({msg : err.message})
    }  
}

module.exports = {get_Idi_Data,add_Idi_Data}