const Course = require('../models/Category');
const Tag = require('../models/Category');
require('dotenv').config();
const User = require('../models/User');
const {uploadImageToCloudinary} = require('../utils/imageUploader');

// createCourse
exports.createCourse = async(req, res) =>{
    try {
        // Fetch data
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;

        // get thumbnail
        const thumbnail = req.files.thumbnailImage;

        // validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            });
        }

        // Check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findById({userId});
        console.log("Instructor details -> ",instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructors details not found."
            });
        }

        // Check given tag valid or not
        const tagDetails = await Tag.findById({tag});

        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:"Tag details not found."
            });
        }

        // Upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // Create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag: tagDetails._id,
            thumbnail:thumbnailImage.secure_url
        });

        // Add the new course to user schema of instructor
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id},
            {
                $push:{
                    courses: newCourse._id
                }
            },
            {new: true}
        )

        // Update tag schema
        await Tag.findByIdAndUpdate(
            {_id : tagDetails._id},
            {
                $push:{
                    course: newCourse._id
                }
            },
            {new: true}
        );

        // return res
        return res.status(200).json({
            success:true,
            message:"New course created successfully",
            data:newCourse
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to create course",
            error:error.message
        })
    }
}

// getAllCourses
exports.showAllCourses = async(req, res) =>{
    try {
        const allCourses = await Course.find({}, 
                                            {
                                                courseName:true,
                                                price:true,
                                                thumbnail:true,
                                                instructor:true,
                                                ratingAndReviews:true,
                                                studentsEnrolled:true
                                            }
                                        ).populate("instructor").exec();

        return res.status(200).json({
            success:true,
            message:"All courses fetched successfully",
            data: allCourses
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to fetch all course",
            error:error.message
        });
    }
}

// getCourseDetails

exports.getCourseDetails = async(req, res) => {
    try {
        // Fetch data
        const {courseId} = req.body;

        // Validation
        const getCourseDetails = await Course.find({_id:courseId})
                                                .populate(
                                                    {
                                                        path:"instructor",
                                                        populate:{
                                                            path:"additionalDetails"
                                                        }                                                    
                                                    }
                                                )


        
    } catch (error) {
        
    }
}