const { Schema, model } = require("mongoose");

const brandSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Brand require"],
      unique: [true, "Brand must be unique"],
      minLength: [3, "Name too short"],
      maxLength: [32, "Nane too long"],
    },

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
    const imageUrl = `${process.env.BASE_URL}/brands/${doc.image}`;
    doc.image = imageUrl;
  }
};

// findOne findAll and update
brandSchema.post("init", (doc) => {
  setImageUrl(doc);
});

//create
brandSchema.post("save", (doc) => {
  setImageUrl(doc);
});

module.exports = model("Brand", brandSchema);
