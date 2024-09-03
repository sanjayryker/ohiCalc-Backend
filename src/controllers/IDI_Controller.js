const idi_dataset = require('../dataset/idi_dataset')

const add_Idi_Data = async(req,res) =>{

    let keyIndicatorScore = null
    let keyIndicatorLength = false

    const idiModel = req.dbConnection.model('IDI_value', require('../models/IDI_model').schema)
    const keyScore_model = req.dbConnection.model('keyScore', require('../models/keyScore_model').schema)
    // console.log(req.dbConnection.name)

    const keyScoreCalc = async(keyInd,reqBody, id) =>{

        const allData = await idiModel.find({keyInd, user_id:id})
        const similarData = allData.find((val) => val.ind == reqBody.ind)
        if(similarData){
            const indexNum = allData.indexOf(similarData)
            allData.splice(indexNum,1,reqBody)
        }else{
            allData.push(reqBody)
        }

        const comparingData = idi_dataset.find((data) => data[`keyInd${keyInd}`]) 
            //Calculation
            if(allData.length == comparingData[`keyInd${keyInd}`].Ind_total){
                const sortedData = allData.sort((a,b) => Number(a.ind)-Number(b.ind))
                keyIndicatorLength = true
                
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
                    category:"IDI",
                    keyInd: keyInd,
                    keyInd_name:comparingData[`keyInd${keyInd}`].name,
                    keyInd_Score:keyIndicatorScore,
                    user_id:id
                }

                //Update or Create
                const findSimilarData = await keyScore_model.findOne({category:"IDI", keyInd,user_id:id})
                if(!findSimilarData){ await keyScore_model.create(keyIndData)}
                else{ await keyScore_model.findOneAndUpdate({category:"IDI", keyInd, user_id:id},keyIndData,{new:true})}

                await idiModel.updateMany(
                    {category:"IDI", keyInd : keyInd, user_id:id},
                    { $set: {keyInd_score: keyIndicatorScore}}
                    )
            }
    }
    
    try{
        const {keyInd,ind} = req.body
        const id = req.user._id
        const data = await idiModel.findOne({keyInd, ind, user_id:id})

            if(data){
                await keyScoreCalc(keyInd,req.body, id)
                const updatedData = await idiModel.findOneAndUpdate({keyInd, ind, user_id:id},req.body,{new:true})
                res.status(201).json({message:"Updated Successfully", data:updatedData,keyScore:keyIndicatorScore, keyLength :keyIndicatorLength})
            }else{
                const {keyInd} = req.body
                await keyScoreCalc(keyInd,req.body, id)
                const data = await idiModel.create(req.body)
                res.status(200).json({message:"Created Successfully",data,keyScore:keyIndicatorScore, keyLength :keyIndicatorLength})
            }

    }catch(error){
        res.status(400).json({msg : error.message})
    }  
}

const get_Idi_Data = async(req,res) =>{
    const idiModel = req.dbConnection.model('IDI_value', require('../models/IDI_model').schema);
    const {key,ind} = req.body
    const id = req.user._id
    const keyInd_num = key.slice(-1)
    const ind_num = ind.slice(-1)

    try{
        const data = await idiModel.findOne({keyInd:keyInd_num,ind:ind_num, user_id:id}) 
        res.status(200).json(data)
    }catch(err){
        res.status(400).json({msg : err.message})
    }  
}

module.exports = {get_Idi_Data,add_Idi_Data}