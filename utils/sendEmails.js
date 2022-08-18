const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1)Create transporter
  const transporter = nodemailer.createTransport({
    service: "hotmail",
    host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT, // if secure false port = 587 else port = 456
    // secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define email options
  const emailOptions = {
    from: `E-shop App <${process.env.EMAIL_USER}>`,
    to: "slhany2000@gmail.com",
    subject: options.subject,
    html: options.message,
  };

  // 3) Send email
  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
