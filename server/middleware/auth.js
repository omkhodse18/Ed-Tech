require('dotenv').config();
const User = require('../models/User');
const OTP = require('../models/OTP');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// auth
exports.auth = async(req, res, next) => {
    try {
        // Extract token
        const token = req.cookies.token 
        || req.body 
        || req.header("Authorization").replace("Bearer ", "");

        // Token is missing
        if(!token){
            return res.status(401).json({
                success:false,
                message:"Token is missing"
            });
        }

        //verifying the token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;

        } catch (error) {
            return res.status(401).json({
                success:false,
                message:"Token is invalid"
            });
        }

        next();
    } catch (error) {
        console.log(error);

        return res.status(401).json({
            success:false,
            message:"Something went wrong while validating token"
        });
    }
}

// isStudent
exports.isStudent = async(req, res, next) => {
    try {
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Students only"
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified. Please try again"
        })
    }
} 


// isInstructor
exports.isInstructor = async(req, res, next) => {
    try {
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Instructor only"
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified. Please try again"
        })
    }
} 

// isAdmin
exports.isAdmin = async(req, res, next) => {
    try {
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:"This is a protected route for Admin only"
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"User role cannot be verified. Please try again"
        })
    }
} 