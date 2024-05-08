const Course = require('../models/Course');
const { uploadImageToCloudinary } = require('../utils/imageUploader');
const SubSection = require('../models/SubSection');
const Section = require('../models/Section');

// Create subsection
exports.createSubSection = async(req, res) => {
    try {
        // Fetch data
        const {sectionId, title, timeDuration, description} = req.body;

        // Extract file
        const video = req.files.videoFile;

        // Validation
        if(!sectionId || !title || !timeDuration || !description || !video){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            });
        }

        // Upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);
        
        // Create subsection
        const subSectionDetails = await SubSection.create({
            title:title,
            timeDuration:timeDuration,
            description:description,
            videoUrl: uploadDetails.secure_url
        });
        
        // Update section with this subsection objectId
        const updatedSection = await Section.findByIdAndUpdate(
                                {_id:sectionId},
                                {
                                    $push:{
                                        subSection: subSectionDetails._id
                                    }
                                },
                                {new: true}
        );
        
        // Return res
        return res.status(200).json({
            success:true,
            message:"New sub-section created successfully.",
            updatedSection,
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Unable to create sub-section. Try again",
            error:error.message
        });
    }
}

// updateSubSection

// deleteSubSection