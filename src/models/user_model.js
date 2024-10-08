const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

const user_schema = new mongoose.Schema({
    email:{ type:String, required:true, unique:true},
    password:{ type:String, required:true},
    name:{type:String},
    user:{type:String},
    isVerified:{type:Boolean, default:false},
}, { timestamps : true})

//Static Signup Method
user_schema.statics.signup = async function(email,password,name) {
  
  let user;
    //Validation
    if(!email || !password || !name){
        throw Error('All fields must be filled')
    }

    if(!validator.isEmail(email)){
      throw Error('Email is not valid')
    }
    if(!validator.isStrongPassword(password)){
      throw Error("Password not strong enough")
    }

    const exists = await this.findOne({email})

    if(exists && exists.isVerified){
      throw Error('Email already in use')
    }

    if(exists && !exists.isVerified){  

      const updatedAt = new Date(exists.updatedAt)
      const currentTime = new Date()
      const diffInMs = currentTime - updatedAt
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      console.log(diffInMinutes)

      if(diffInMinutes >20){
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password,salt)
        user = await this.findByIdAndUpdate(exists._id,{password: hash, name:password, user:name, updatedAt: new Date()},{new:true}) 
        return user; 
      }

      if(diffInMinutes <=20){
        throw Error('Verification mail sent already. check your email')
      }
      
    }
    
    if(!exists){
      const salt = await bcrypt.genSalt(10)
      const hash = await bcrypt.hash(password,salt)
      user = await this.create({email,password: hash, name:password, user:name})

      return user
    }
    
    return user
}

// Static Login Method
user_schema.statics.login = async function(email,password){
    if(!email || !password){
        throw Error('All fields must be filled')
    }

    const user = await this.findOne({email})

    if(!user){
        throw Error('User does not exist')
    }

    const match = await bcrypt.compare(password, user.password)

    if(!match){
        throw Error("Incorrect password")
    }

    if(user && !user.isVerified){
      throw Error("User does not exist. Please signup !")
    }

    return user
    
}

// Static forgotPassword method
user_schema.statics.forgotPassword = async function(email){
    if(!email){
        throw Error ('Enter email')
    }

    const user = await this.findOne({email})
    if(!user){
        throw Error ('User does not exist')
    }
    
    const token = jwt.sign({_id:user._id},process.env.SECRET,{expiresIn:'5m'})

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sanjaypandian08@gmail.com',
          pass: 'vovcjcipuopaqeba'
        }
      })

      var mailOptions = {
        from: 'sanjaypandian08@gmail.com',
        to: email,
        subject: 'Reset Password Link',
        html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
      </head>
      <body>
        <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
          <div style="margin: 50px auto; width: 70%; padding: 20px 0">
            <div style="border-bottom: 1px solid #eee">
              <a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600">Community Engagement @TIGS</a>
            </div>
            <p style="font-size: 1.1em">Hi ${user.user},</p>
            <p>Use the following link to complete your Password Recovery Procedure. The link is valid for 5 minutes</p>
            <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">
              <a href="https://ohicalc-frontend.onrender.com/reset_password/${user._id}/${token}" style="color: #fff; text-decoration: none;">Reset Password</a>
            </h2>
            <p style="font-size: 0.9em;">Regards,<br />Community Engagement @TIGS</p>
            <hr style="border: none; border-top: 1px solid #eee" />
            <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
              <p>Community Engagement </p>
              <p>TIGS</p>
              <p>Bengaluru</p>
            </div>
          </div>
        </div>
      </body>
      </html>`
      };
      

      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(new Error('An error occurred while sending the email.'));
            } else {
                resolve({ status: "Success", message: "Reset password email sent successfully." });
            }
        });
    });


} 

//Static resetPass method
user_schema.statics.resetPassword = async function(id,token,password){

    if(!validator.isStrongPassword(password)){
        throw Error("Password is not strong enough")
    }

    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.SECRET, async (err) => {
            if (err) {
                return reject(new Error("Token is invalid or has expired"))
            } else {
                try {
                    const salt = await bcrypt.genSalt(10)
                    const hash = await bcrypt.hash(password, salt)
                    const user = await this.findByIdAndUpdate(id, { password: hash, name : password })
                    resolve({ status: "success", message: "Password has been successfully reset" })
                } catch (error) {
                    reject(new Error("Failed to reset password. Please try again."))
                }
            }
        })
    })

}

// statics verifyEmail 
user_schema.statics.verifyEmail = async function(verifyToken, email, userName, userId){

    // if(!email){
    //     throw Error ('Enter email')
    // }
    // const user = await this.findOne({email})
    // if(user){
    //     throw Error ('User already exist')
    // }

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'sanjaypandian08@gmail.com',
          pass: 'vovcjcipuopaqeba'
        }
      })

      var mailOptions = {
        from: 'sanjaypandian08@gmail.com',
        to: email,
        subject: 'Email verification',
        html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
      </head>
      <body>
        <div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2">
          <div style="margin: 50px auto; width: 70%; padding: 20px 0">
            <div style="border-bottom: 1px solid #eee">
              <a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600">Community Engagement @TIGS</a>
            </div>
            <p style="font-size: 1.1em">Hi ${userName},</p>
            <p>Use the following link to complete your Email Verification. The link is valid for 20 minutes</p>
            <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">
              <a href="https://ohicalc-frontend.onrender.com/signinVerification/${verifyToken}" style="color: #fff; text-decoration: none;">Verify Email</a>
            </h2>
            <p style="font-size: 0.9em;">Regards,<br />Community Engagement @TIGS</p>
            <hr style="border: none; border-top: 1px solid #eee" />
            <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300">
              <p>Community Engagement </p>
              <p>TIGS</p>
              <p>Bengaluru</p>
            </div>
          </div>
        </div>
      </body>
      </html>`
      }
      

      return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(new Error('An error occurred while sending the email.'));
            } else {
                resolve({ status: "Success", message: "Verification email sent successfully." });
            }
        });
    });


} 

module.exports = mongoose.model('User',user_schema)