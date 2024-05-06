require('dotenv').config();
const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//sendOTP
 exports.sendOTP = async(req, res) => {
    try {
        // fetch email from req body
        const {email} = req.body;

        // Chk if user already exist
        const checkUserPresent = await User.findOne({email})

        // User already exits
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User already exits"
            })
        }

        // Generate otp
        let otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false, 
                specialChars:false});

        console.log("OTP generated : ",otp);

        // Ensure otp is unique
        // Check unique otp or not
        const result = await OTP.findOne({otp: otp});

        // OTP already exits, so generate otp until its unique || {Brute force}
        while(result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false, 
                specialChars:false});
         
            result = await OTP.findOne({otp: otp});    
        }

        const otpPayload = {email, otp};

        // Create an entry in DB for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        return res.status(200).json({
            success:true,
            message:"OTP sent successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
 }
 

//signup
exports.signUp = async(req, res) => {
    try {
        // Data fetch from req body
        const {
            firstName,
            lastName, 
            email, 
            password, 
            confirmPassword, 
            accountType, 
            contactNumber,
            otp
        } = req.body;

        
        // Validation
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }
        
        // Password matching
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and confirm password doest not match"
            })
        }

        // Check if User already exist or not
        const existingUser = await User.findOne({email});

        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already registered"
            })
        }

        // Find most recent otp for the user
        const recentOTP = await OTP.findOne({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOTP);

        // Validate otp
        if(recentOTP.length == 0){
            //OTP not found
            return res.status(400).json({
                success:false,
                message:"OTP not found"
            })
        } 
        else if(otp !== recentOTP.otp){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP"
            })
        }

        // Password hashed
        const hashedPassword = await bcrypt.hash(password,10);

        // Create entry in DB
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        })

        const user = await User.create({
            firstName, 
            lastName, 
            email, 
            contactNumber, 
            password:hashedPassword, 
            accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        // return res
        return res.status(200).json({
            success:true,
            message:"User is registered successfully",
            user
        });

    } catch (error) {
        console.log(error);
        
        return res.status(500).json({
            success:false,
            message:"User cannot be registered. Please try again."
        })
    }
}

//login
exports.login = async(req, res) => {
    try {
        //Fetch data from req body
        const {email, password} = req.body; 

        // Validate data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are required. Please try again."
            })
        }
        
        // check if user exist or not
        const user = await User.findOne({email}).populate("additionalDetails");

        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered. Please Sign up first."
            })
        }


        // Generate jwt, after password matching
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email:user.email,
                id: user._id,
                accountType: user.accountType,
            }
            
            // Token generate
            const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn:"2h"});

            user.token = token;
            user.password = undefined;
        
            // Create cookie
            const options = {
                expires: new Date(Date.now + 3 * 24 * 60 * 60 * 1000),  //3days
                httpOnly: true
            }
    
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully"
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Incorrect password"
            })
        }

        // send response
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login failed. Please try again"
        })
    }
}

//change password
exports.changePassword = async(req, res) => {
    try {
        // Fetch data from req body (oldPass, newPass, confirmPass)

        //Validation (empty , pass matching)

        // update pass in DB

        // Mail send - pass updated

        // return res

    } catch (error) {
        
    }
}
