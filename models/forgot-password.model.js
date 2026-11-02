const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    email : String,
    otp : String,
    expireAt:{
      type: Date,
      expires : 0
    }
  },
  {
    timestamps : true
  }
)

const ForgotPassword = new mongoose.model('ForgotPassword',schema,'forgot-password');
module.exports = ForgotPassword;