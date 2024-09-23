const jwt = require('jsonwebtoken')

const createToken = (_id) =>{
    return jwt.sign({_id},process.env.SECRET,{expiresIn:'1d'})
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

// const signupUser = async(req,res) =>{
//     const user_model = req.dbConnection.model('User', require('../models/user_model').schema)
//     const {email, password, name} = req.body

//     try{
//         const user = await user_model.signup(email,password,name)
//         const userId = user._id
//         const userName = user.name
//         //Create Token 
//         const token = createToken(user._id)

//         res.status(200).json({email, token, userId, userName})
//     }catch(error){
//         res.status(400).json({error:error.message})
//     } 
// }

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

const signupUser = async(req,res) =>{
    const user_model = req.dbConnection.model('User', require('../models/user_model').schema)

    const {email, password, name} = req.body

    try{
        const user = await user_model.signup(email,password,name)
        const userId = user._id
        const userName = user.name
        //Create Token 
        const verifyToken = jwt.sign({ userId: user._id }, process.env.SECRET, { expiresIn: '20m' })  

        const result = await user_model.verifyEmail( verifyToken, email, userName, userId)
        return res.status(200).json(result)

    }catch(error){
        return res.status(400).json({status: "error", message: error.message});
    } 
}

const verifySignup = async(req,res) =>{

    const user_model = req.dbConnection.model('User', require('../models/user_model').schema)

    const {verifyToken} = req.body

    try{
        const verified = jwt.verify(verifyToken, process.env.SECRET)
        const user = await user_model.findById(verified.userId)
        

        if (!user) {
            return res.status(400).json({ message: 'Invalid token, Please signIn' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User is already verified' });
        }

        user.isVerified = true
        await user.save()

        const token = createToken(user._id)

        res.status(200).json({email: user.email, token, userId: user._id, userName: user.name})

        // const user = user_model.findById(id)

    } catch(error){

        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Token has expired. Please sign in again' });
        }

        return res.status(400).json({status: "error", message: error.message});
    }

}

module.exports = { signupUser, loginUser, forgotPassword, resetPassword, verifySignup}