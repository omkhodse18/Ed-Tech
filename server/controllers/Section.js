const Section = require('../models/Section');
const Course = require('../models/Course');

// Create section
exports.createSection = async(req, res) => {
    try {
        // Fetch data
        const {sectionName, courseId} = req.body;

        // Validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            });
        }

        // Create section
        const newSection = await Section.create({sectionName});

        // Add to courseSchema || Update course with section ObjectID
        const updatedCourseDetails = await Course.findByIdAndUpdate({courseId},
                    {
                        $push:{
                            courseContent:newSection._id
                        }
                    },
                    {new:true}
                );

        // return res
        return res.status(200).json({
            success:true,
            message:"New section created successfully.",
            updatedCourseDetails,
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to create section. Try again",
            error:error.message
        });
    }
}

// updateSection
exports.updateSection = async(req, res) => {
    try {
        // Fetch data
        const {sectionName, sectionId} = req.body;

        // Validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            });
        }

        // Update data
        const updatedSectionDetails = await Section.findByIdAndUpdate(sectionId, 
                                                {sectionName},
                                                {new:true}
                                            );

        // return res
        return res.status(200).json({
            success:true,
            message:"Section updated successfully.",
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to update section. Try again",
            error:error.message
        });
    }
}

// deleteSection
exports.deleteSection = async(req, res) => {
    try {
        // fetch section id - assuming sending ID in params
        const {sectionId} = req.params

        // findbyIDandDelete
        await Section.findByIdAndDelete(sectionId);

        

        // return res
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully.",
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to delete section. Try again",
            error:error.message
        });
    }
}