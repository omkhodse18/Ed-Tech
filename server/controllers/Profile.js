const Profile = require('../models/Profile');
const User = require('../models/User');

exports.updateDetails = async(req, res) => {
    try {
        // fetch data
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;

        // Get user id
        const userId = req.user.id;

        // Validation
        if(!contactNumber || !gender || !userId){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            });
        }

        // Find profile
        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        // Update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber; 

        await profileDetails.save();

        // Return res
        return res.status(200).json({
            success:true,
            message:"Profile updated successfully",
            profileDetails
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to update profile",
            error:error.message
        })
    }
};

// deleteAccount
exports.deleteAccount = async(req, res) => {
    try {
        // get ID
        const userId = req.user.id;

        // Validation
        const userDetails = await User.findById(userId);
 
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }

        // delete profile
        const profileId = userDetails.additionalDetails;
        await Profile.findByIdAndDelete({_id:profileId});
        
        // TODO : Unenrolled user from all enrolled courses
        
        // Delete user
        await User.findByIdAndDelete({_id:userId});


        // Return res
        return res.status(200).json({
            success:true,
            message:"Profile deleted successfully",
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to delete profile",
            error:error.message
        })
    }
}

exports.getAllUserDetails = async(req, res) => {
    try {
        // Fetch data
        const id = req.user.id;

        // validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        // Return res
        return res.status(200).json({
            success:true,
            message:"User data fetch successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            error:error.message
        })
    }
}