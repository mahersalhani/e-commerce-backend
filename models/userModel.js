const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name is required"],
    },

    slug: {
      type: String,
      lowercase: true,
    },

    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
    },

    image: {
      type: String,
    },

    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [6, "password is too short"],
    },

    passwordResetCode: String,

    passwordResetCodeExpires: Date,

    passwordResetCodeVerify: Boolean,

    passwordChangedAt: Date,

    role: {
      type: String,
      enum: ["admin", "manger", "user"],
      default: "user",
    },

    active: {
      type: Boolean,
      default: true,
    },
    wishlist: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Product",
      },
    ],
    addresses: [
      {
        id: { type: mongoose.Schema.Types.ObjectId },
        alias: String,
        details: String,
        phone: String,
        city: String,
        postMessage: String,
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // hashing user password
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

const setImageUrl = (doc) => {
  // return image base url + image name

  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.image}`;
    doc.image = imageUrl;
  }
};

// findOne findAll and update
userSchema.post("init", (doc) => {
  setImageUrl(doc);
});

const User = mongoose.model("User", userSchema);

module.exports = User;
