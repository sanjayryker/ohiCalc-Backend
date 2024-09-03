const jwt = require('jsonwebtoken')

const createToken = (_id) =>{
    return jwt.sign({_id},process.env.SECRET,{expiresIn:'3d'})
}

const loginUser = async(req,res) =>{
    const user_model = req.dbConnection.model('User', require('../models/user_model').schema)
    const {email,password} = req.body
    
    try{
        const user = await user_model.login(email,password)
    
        //create Token
        const token = createToken(user._id)
        res.status(200).json({email,token,user})

    }catch(error){
        res.status(400).json({error:error.message})
    }
}

const signupUser = async(req,res) =>{
    const user_model = req.dbConnection.model('User', require('../models/user_model').schema)
    const {email, password, name} = req.body

    try{
        const user = await user_model.signup(email,password,name)
        
        //Create Token 
        const token = createToken(user._id)

        res.status(200).json({email, token})
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

module.exports = { signupUser, loginUser, forgotPassword}