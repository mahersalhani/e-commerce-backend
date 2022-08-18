const { Schema, model } = require("mongoose");

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minLength: [3, "Title is too short"],
      maxLength: [100, "Title is too LONG"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minLength: [5, "description is too short"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      trim: true,
      required: [true, "Product Price is Required"],
      max: [2000000, "Price is Too Long"],
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: [String],
    images: [String],
    imageCover: {
      type: String,
      required: [true, "Image Covere is Required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product must be belong to category"],
    },
    subcategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "SubCategory",
      },
    ],
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "category",
    select: "name",
  });
  next();
});

const setImageUrl = (doc) => {
  // return image base url + image name

  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/products/cover/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }

  if (doc.images) {
    const images = [];

    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/products/images/${image}`;
      images.push(imageUrl);
    });

    doc.images = images;
  }
};

// findOne findAll and update
productSchema.post("init", (doc) => {
  setImageUrl(doc);
});

//create
productSchema.post("save", (doc) => {
  setImageUrl(doc);
});

module.exports = model("Product", productSchema);
