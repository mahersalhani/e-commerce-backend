const asyncHandler = require("express-async-handler");
const { default: slugify } = require("slugify");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures/apiFeatures");
const { clearImage } = require("../helpers/clearImage");

exports.DeleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    await document.remove();

    res.status(204).json({ msg: "Delete succeded", data: document });
  });

exports.UpdateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, title, subcategories } = req.body;

    if (subcategories === "undefined") {
      req.body.subcategories = [];
    }
    if (title) {
      req.body.slug = slugify(title);
    }
    if (name) {
      req.body.slug = slugify(name);
    }

    console.log(req.body.expire);

    try {
      const document = await Model.findByIdAndUpdate(
        //
        id,
        req.body,
        { new: true }
      );

      if (!document) {
        const err = res.json(new ApiError(`No Document Found in This ID:${id}`, 404));
        return next(err);
      }

      await document.save();

      res.status(201).json({
        message: "Update Document Succeed",
        data: document,
      });
    } catch (err) {
      console.log(err);
    }
  });

exports.CreateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { name, title, colors } = req.body;

    if (typeof colors === "string") {
      req.body.colors = [colors];
    }

    if (title) {
      req.body.slug = slugify(title);
    } else {
      req.body.slug = slugify(name);
    }

    const newDocument = await Model.create(req.body);

    res.status(201).json({
      message: "New Document Created",
      data: newDocument,
    });
  });

exports.getOne = (Model, populationOption) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // 1) Build query
    let query = await Model.findById(id);

    if (populationOption) {
      query = await query.populate(populationOption);
    }

    // 2) Execute query
    if (!query) {
      const err = res.json(new ApiError("No Document Found", 404));
      return next(err);
    }

    res.status(200).json({
      message: "Getting Document Succeed",
      data: query,
    });
  });

exports.getAll = (Model, modelName = "") =>
  asyncHandler(async (req, res, next) => {
    let filter = {};
    if (req.filterObject) {
      filter = req.filterObject;
    }

    // Build query
    // const allResults = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      //
      .filter()
      .search(modelName)
      .limitFields()
      .sort();

    // Apply pagination after filter and search
    const docsCount = await Model.countDocuments(apiFeatures.mongooseQuery);
    apiFeatures.paginate(docsCount);

    // Execute query
    const { mongooseQuery, paginationResults } = apiFeatures;
    const documents = await mongooseQuery;

    res.status(200).json({
      message: "Getting Documents Succeed",
      results: docsCount,
      paginationResults,
      data: documents,
    });
  });

exports.deleteOneImage = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const imageUrl = await Model.findById(id).select("image");

    let filePath = "";

    if (imageUrl) {
      filePath = imageUrl.image.split(`${process.env.BASE_URL}/`);
    }

    clearImage(`uploads/${filePath[1]}`);

    next();
  });

exports.deleteMultipleImages = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const imagesUrl = await Model.findById(id).select("imageCover images -_id -category");

    const coverPath = imagesUrl.imageCover.split(`${process.env.BASE_URL}/`);

    const imagesPath = [];

    imagesUrl.images.forEach((image) => {
      const path = image.split(`${process.env.BASE_URL}/`);
      imagesPath.push(path);
    });

    imagesPath.forEach((image) => {
      clearImage(`uploads/${image[1]}`);
    });

    clearImage(`uploads/${coverPath[1]}`);

    next();
  });
