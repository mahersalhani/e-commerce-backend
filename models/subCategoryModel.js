const { Schema, model } = require("mongoose");

const subCategorySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Category require"],
      unique: [true, "Category must be unique"],
      minLength: [3, "Name too short"],
      maxLength: [32, "Nane too long"],
    },

    slug: {
      type: String,
      lowercase: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "SubCategory must be belong to perant category"],
    },
  },
  { timestamps: true }
);

module.exports = model("SubCategory", subCategorySchema);
