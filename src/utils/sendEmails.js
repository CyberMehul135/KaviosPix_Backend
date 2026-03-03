const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = ({ to, subject, html }) => {
  transporter.sendMail({
    from: `"KaviosPix" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log("Mail sended successfully");
};

module.exports = sendEmail;

// sendEmail(
//   "mehulrathod9254@gmail.com",
//   "Testing Nodemailer",
//   "This is testing mail from KaviosPix App 2.",
// );
