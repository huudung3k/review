const nodemailer = require("nodemailer");
module.exports.sendMail = (email,subject,text) => {
// Create a transporter object
  const secure = process.env.GMAIL_SECURE == "true";
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: secure,  // false : http , true : https
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    }
  });

  // Configure the mailoptions object
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: subject,
    text:  text
  };

  // Send the email
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent: ', info.response);
    }
  });
}