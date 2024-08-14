const edi_dataset = require('../dataset/edi_dataset')

const add_Edi_Data = async(req,res) =>{

    let keyIndicatorScore = null
    const ediModel = req.dbConnection.model('EDI_value', require('../models/EDI_model').schema)
    const keyScore_model = req.dbConnection.model('keyScore', require('../models/keyScore_model').schema)
    // console.log(req.dbConnection.name)

    const keyScoreCalc = async(keyInd,reqBody) =>{

        const allData = await ediModel.find({keyInd})
        const similarData = allData.find((val) => val.ind == reqBody.ind)

        if(similarData){
            const indexNum = allData.indexOf(similarData)
            allData.splice(indexNum,1,reqBody)
        }else{
            allData.push(reqBody)
        }

        const comparingData = edi_dataset.find((data) => data[`keyInd${keyInd}`]) 
            //Calculation
            if(allData.length == comparingData[`keyInd${keyInd}`].Ind_total){
                const sortedData = allData.sort((a,b) => Number(a.ind)-Number(b.ind))
                
                if(req.dbConnection.name === "Ohi-Values"){
                    const ind_Weight = comparingData[`keyInd${keyInd}`].ind_Weight
                    const indScoreXweight = sortedData.map((data) => data.ind_score*(ind_Weight)/100)
                    keyIndicatorScore = indScoreXweight.reduce((a,b) => {return a+b},0)
                }else if(req.dbConnection.name === "Ohi-Weight-Values"){
                    const ind_Weight = sortedData.map((data) => data.ind_weight)
                    const isWeightHundred = ind_Weight.reduce((a,b) => {return Number(a)+Number(b)}, 0)
                    if (Math.round(isWeightHundred) !== 100) {
                        throw new Error("Weights must add up to 100.");
                    }
                    const indScoreXweight = sortedData.map((data,index) => data.ind_score*ind_Weight[index]/100)
                    keyIndicatorScore = indScoreXweight.reduce((a,b) => {return a+b},0)
                }            

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
                await keyScoreCalc(keyInd,req.body)
                const updatedData = await ediModel.findOneAndUpdate({keyInd, ind},req.body,{new:true})
                res.status(201).json({message:"Updated Successfully", data:updatedData,keyScore:keyIndicatorScore})
            }else{
                const {keyInd} = req.body
                await keyScoreCalc(keyInd,req.body)
                const data = await ediModel.create(req.body)
                res.status(200).json({message:"Created Successfully",data,keyScore:keyIndicatorScore})
            }

    }catch(error){
        res.status(400).json({msg : error.message})
    }  
}

const get_Edi_Data = async(req,res) =>{
    const ediModel = req.dbConnection.model('EDI_value', require('../models/EDI_model').schema);
    const {key,ind} = req.body
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