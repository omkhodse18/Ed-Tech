const mongoose = require('mongoose');
const mailsender = require('../utils/mailSender');
const emailTemplate = require("../mail/templates/emailVerificationTemplate");


const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },

    otp:{
        type:String,
        required:true,
    },

    createdAt:{
        type:Date,
        default:Date.now,
        expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time

    }
});

// Function to send mail

async function sendVerificationEmail(email, otp){
    try {
        const mailResponse = await mailsender(email,"Verification Email from StudyNotion", emailTemplate(otp));
        console.log("Email send successfully -> ", mailResponse.response);
    } catch (error) {
        console.log("Error occurred while sending email: ", error);
		throw error;
    }
}

// Before saving doc, send the verification email with current object data (this.);
OTPSchema.pre("save", async function(next){
    console.log("New document saved to database");

	// Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
	next();
});

module.exports = mongoose.model("OTP",OTPSchema);