const SubCategory = require("../models/subCategoryModel");
const factory = require("./handlersFactory");

// Nested route
// Get /api/v1/categories/:catId/subCategories
exports.createFilterObj = (req, res, next) => {
  //Nested route

  let filterObject = {};

  if (req.params.catId) {
    filterObject = { product: req.params.catId };
  }

  req.filterObject = filterObject;

  next();
};

// Nested route
// POST /api/v1/categories/:catId/subCategories
exports.setCategoryIdToBody = (req, res, next) => {
  //Nested route
  if (!req.body.category) {
    req.body.category = req.params.catId;
  }
  next();
};

// @desc Get list of subcategories
// @route GET /api/v1/subcategories
// @access Public
exports.getSubCategories = factory.getAll(SubCategory);

// @desc Get spacific SubCategory by id
// @route GET /api/v1/subcategories/:id
// @access Public
exports.getSubCategory = factory.getOne(SubCategory);

// @desc Create subCategory
// @route POST /api/v1/subCategory
// @access Privet
exports.creatSubCategory = factory.CreateOne(SubCategory);

// @desc Update spacific subCategory by id
// @route PUT /api/v1/subcategories/:catId
// @access Privet
exports.updateSubCategory = factory.UpdateOne(SubCategory);

// @desc Delete spacific subcategory by id
// @route DELETE /api/v1/subcategories/:catId
// @access Privet
exports.deleteSubCategory = factory.DeleteOne(SubCategory);
