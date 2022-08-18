const categoryRoute = require("./categoryRoutes");
const subCategoryRoute = require("./subCategoryRoutes");
const brandsRoute = require("./brandRoutes");
const productsRoute = require("./productRoutes");
const userRoute = require("./userRoute");
const authRoute = require("./authRoutes");
const reviewRoute = require("./reviewRoute");
const wishlistRoutes = require("./wishlistRoutes");
const addressesRoutes = require("./addressesRoutes");
const couponRoutes = require("./couponRoutes");
const cartRoutes = require("./cartRoutes");
const orderRoutes = require("./orderRoutes");

const mountRoutes = (app) => {
  app.use("/api/v1/categories", categoryRoute);
  app.use("/api/v1/subcategories", subCategoryRoute);
  app.use("/api/v1/brands", brandsRoute);
  app.use("/api/v1/products", productsRoute);
  app.use("/api/v1/users", userRoute);
  app.use("/api/v1/auth", authRoute);
  app.use("/api/v1/reviews", reviewRoute);
  app.use("/api/v1/wishlist", wishlistRoutes);
  app.use("/api/v1/addresses", addressesRoutes);
  app.use("/api/v1/coupons", couponRoutes);
  app.use("/api/v1/cart", cartRoutes);
  app.use("/api/v1/orders", orderRoutes);
};

module.exports = mountRoutes;
