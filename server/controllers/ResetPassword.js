require('dotenv').config();
const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mailSender = require('../utils/mailSender');

// resetPasswordToken
exports.resetPasswordToken = async(req, res) => {
    try {
        // Fetch email from req body
        const email = req.body.email;

        // Check user for this email, email validation
        const user = await User.findOne({email: email});

        if(!user){
            return res.json({
                success:false,
                message:"Your email is not registered with us."
            })
        }

        // Token generate
        const token = crypto.randomUUID();

        // Update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate(
                                            {email:email},
                                            {
                                                token:token,
                                                resetPasswordExpires: Date.now() + 5*60*1000 //5 min
                                            },
                                            {
                                                new:true
                                            }
                                        );
        
        // Create URL
        const url = `http://localhost:3000/update-password/${token}`;

        // Send mail containing the url
        await mailSender(email, "Password Reset link", `Link - ${url}`);

        // Return res
        return res.json({
            success:true,
            message:"Email sent successfully. Please check mail to change password."
        })

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success:false,
            message:"Something went wrong while reseting password"
        })
    }
}

// Reset pass
exports.resetPassword = async(req, res) => {
    try {
        // fetch data (token, pass, confirm pass)
        const {token, password, confirmPassword} = req.body;

        // Validation
        if(password !== confirmPassword){
            return res.json({
                success:false,
                message:"Password not matching."
            });
        }

        // get user details
        const userDetails = await User.findOne({token: token});

        // if no entry - invalid token 
        if(!userDetails){
            return res.json({
                success:false,
                message:"Token invalid"
            });
        }

        // token time check | condition says -> if current time is less than expires time (Ex.: So if in DB entry created at 5pm then expires time is 5.05pm and current time is 6pm then token is expire)
        if(userDetails.resetPasswordExpires < Date.now()){
            // Token expires | token time expires
            return res.json({
                success:false,
                message:"Token is expired. Please regenerate token"
            });
        }

        // hash pass
        const hashedPassword = await bcrypt.hash(password, 10);

        // update pass
        await User.findOneAndUpdate({token: token},
                                    {password:hashedPassword},
                                    {new:true}
                                );

        // return res
        return res.status(200).json({
            success:true,
            message:"Password reset successfully."
        })
    } catch (error) {
        console.log(error);

        res.status(500).json({
            success:false,
            message:"Something went wrong while reseting password"
        })
    }
}
