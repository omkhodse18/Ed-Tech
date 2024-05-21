const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

//createRating
exports.createrating = async(req,res) => {
    try {
        // get user id
        const userId = req.user.id;

        // get data from user body
        const {rating, review, courseId} = req.body;

        // chk if user enrolled or not
        const courseDetails = await Course.findOne({_id: courseId, 
            studentsEnrolled:{$elemMatch: {$eq: userId}}}
        );


        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: "Students is not enrolled in this course."
            })
        }

        // chk if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId,
        });

        if(alreadyReviewed){
            return res.status(403).json({
                success:false,
                message:"Course is already review by the user"
            })
        }

        // create rating and review
        const ratingReview = await RatingAndReview.create({
            rating, review, 
            course: courseId, 
            user:userId
        })

        // update course with this rating
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            {_id:courseId},
            {
                $push:{
                    ratingAndReviews:ratingReview._id
                }
            },
            {new:true}
        )

        console.log(updatedCourseDetails);

        // return response
        return res.status(200).json({
            success:true,
            message: "Rating and review successfully created",
            ratingReview
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}


//getAverageRating
exports.getAverageRating = async(req, res) => {
    try {
        // get course id
        const {courseId} = req.body.courseId;

        // Calculate avg rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: new mongoose.Types.ObjectId(courseId),
                },
                $group:{
                    _id:null,   // whatever entries are come, wrapped in single group
                    averageRating: {$avg: "$rating"}
                }
            }
        ])

        // Return rating
        if(result.length > 0){
            return res.status(200).json({
                success:true,
                averageRating: result[0].averageRating
            })
        }

        // If no review/rating exist
        return res.status(400).json({
            success:false,
            message:"Average rating is 0, No ratings given till now",
            averageRating:0

        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}


//getAllRatingReview

exports.getAllRating = async(req, res) => {
    try {
        const allReviews = await RatingAndReview.find({}).
                                sort({rating: "desc"})
                                .populate({
                                    path:"user",
                                    select:"firstName lastName email image"
                                })
                                .populate({
                                    path:"course",
                                    select:"courseName"
                                })
                                .exec();  
                                
        return res.status(200).json({
            success:true,
            message:"All reviews fetched successfully",
            data:allReviews
        })                        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}