const { Schema, model } = require("mongoose");

//1-Create Schema
const categorySchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Category require"],
      unique: [true, "Category must be unique"],
      minLength: [3, "Name too short"],
      maxLength: [32, "Nane too long"],
    },

    //A and B => name.com/a-and-b
    slug: {
      type: String,
      lowercase: true,
    },

    image: String,
  },
  { timestamps: true }
);

const setImageUrl = (doc) => {
  // return image base url + image name

  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
    doc.image = imageUrl;
  }
};

// findOne findAll and update
categorySchema.post("init", (doc) => {
  setImageUrl(doc);
});

//create
categorySchema.post("save", (doc) => {
  setImageUrl(doc);
});

//2-Create model
module.exports = model("Category", categorySchema);
