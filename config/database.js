const { default: mongoose } = require("mongoose");

const dbConnection = () => {
  mongoose
    .connect(process.env.DB_URL)
    .then((con) => {
      console.log(`Database Connected: ${con.connection.host}`);
    })
    .catch((err) => {
      console.log(`Database Error: ${err}`);
      process.exit(1);
    });
};

module.exports = dbConnection;
