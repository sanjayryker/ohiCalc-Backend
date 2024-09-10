const jwt = require('jsonwebtoken')

const createToken = (_id) =>{
    return jwt.sign({_id},process.env.SECRET,{expiresIn:'3d'})
}

const loginUser = async(req,res) =>{
    const user_model = req.dbConnection.model('User', require('../models/user_model').schema)
    const {email,password} = req.body
    
    try{
        const user = await user_model.login(email,password)
        const userId = user._id
        const userName = user.name
        //create Token
        const token = createToken(user._id)
        res.status(200).json({email,token, userId, userName})

    }catch(error){
        res.status(400).json({error:error.message})
    }
}

const signupUser = async(req,res) =>{
    const user_model = req.dbConnection.model('User', require('../models/user_model').schema)
    const {email, password, name} = req.body

    try{
        const user = await user_model.signup(email,password,name)
        const userId = user._id
        const userName = user.name
        //Create Token 
        const token = createToken(user._id)

        res.status(200).json({email, token, userId, userName})
    }catch(error){
        res.status(400).json({error:error.message})
    } 
}

const forgotPassword = async(req,res) =>{
    const user_model = req.dbConnection.model('User', require('../models/user_model').schema)
    const {email} = req.body
    try {
        const result = await user_model.forgotPassword(email);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

const resetPassword = async (req,res) =>{
    const user_model = req.dbConnection.model('User', require('../models/user_model').schema)

    const {id, token} = req.params
    const {password} = req.body

    try{
        const result = await user_model.resetPassword(id,token,password)
        return res.status(200).json(result)
    }catch(error){
        return res.status(400).json({status: "error", message: error.message})
    }
}

module.exports = { signupUser, loginUser, forgotPassword, resetPassword}