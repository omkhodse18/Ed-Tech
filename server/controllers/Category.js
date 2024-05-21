const Category = require('../models/Category');

// createCategory
exports.createCategory = async(req, res) => {
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
        const categoryDetails = await Category.create({
            name: name,
            description: description
        });

        return res.status(200).json({
            success:true,
            message:"Category Created successfully"
        })


    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// showAllCategory
exports.showAllCategory = async(req, res) => {
    try {
        // We dont parameter to find, but make sure all entry should have name, description
        const allCategory = await Category.find({},{name:true, description:true});

        return res.status(200).json({
            success:true,
            message:"All tags are returned successfully",
            allCategory
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// categoryPageDetails
exports.categoryPageDetails = async(req, res) => {
    try {
        // get category id
        const {categoryId} = req.body;

        // get courses for specified id
        const selectedCategory = await Category.findById(categoryId).populate("courses").exec();

        // validation
        if(!selectedCategory){
            return res.status(404).json({
                success:false,
                message:"Data not found"
            })
        }

        // get courses for different category
        const differentCategories = await Category.find({_id: {$ne: categoryId}})
                                    .populate("courses").exec(); // ne = not equal

        // get top selling courses - pending

        // return res
        return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories
            },
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
}
