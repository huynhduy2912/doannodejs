const categoryModel = require('../schemas/category');

module.exports = {
    getAllCategories: async () => {
        return await categoryModel.find();
    },

    getCategoryById: async (id) => {
        return await categoryModel.findById(id);
    },

    createCategory: async (data) => {
        const newCategory = new categoryModel({ name: data.name });
        return await newCategory.save();
    },

    updateCategory: async (id, data) => {
        const update = {};
        if (data.name) update.name = data.name;
        return await categoryModel.findByIdAndUpdate(id, update, { new: true });
    },

    deleteCategory: async (id) => {
        return await categoryModel.findByIdAndDelete(id); // XÓA CỨNG
    }
};
