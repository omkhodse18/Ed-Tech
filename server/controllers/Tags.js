const Tag = require('../models/Tags');

// createTag

exports.createTag = async(req, res) => {
    try {
        // fetch data
        const {name, description} = req.body;

        // Validation
        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }

        //create entry in Tag db
        const tagDetails = await Tag.create({
            name: name,
            description: description
        });

        return res.status(200).json({
            success:true,
            message:"Tag Created successfully"
        })


    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// getAllTags
exports.showAlltags = async(req, res) => {
    try {
        // We dont parameter to find, but make sure all entry should have name, description
        const allTags = await Tag.find({},{name:true, description:true});

        return res.status(200).json({
            success:true,
            message:"All tags are returned successfully",
            allTags
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
