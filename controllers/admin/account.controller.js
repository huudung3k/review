const AccountAdminModel = require('../../models/account-admin.model');
const ForgotPasswordModel = require('../../models/forgot-password.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const generateHelper = require('../../helpers/generate.helper');
const sendMaileHelper = require('../../helpers/sendEmail.helper');
const ForgotPassword = require('../../models/forgot-password.model');

module.exports.login = (req,res) =>{
  res.render('admin/pages/login.pug',{
    pageTitle: "Login"
  });
}
module.exports.loginPost = async (req,res) =>{
  const {email, password,rememberPassword} = req.body;
  const existAccount = await AccountAdminModel.findOne({email : email});
  if(!existAccount){
    res.json(
      {
        code : "error",
        message : "Tài khoản không tồn tại !",
      }
    );
    return;
  }
  if(existAccount.status == "inactive"){
    res.json(
      {
        code : "error",
        message : "Tài khoản không hoạt động",
      }
    );
    return;
  }
  const isPasswordValid = await bcrypt.compare(password,existAccount.password);
  if(!isPasswordValid){
    res.json(
      {
        code : "error",
        message : "Sai mật khẩu !",
      }
    );
    return;    
  }
  const token = jwt.sign(
    {
      id : existAccount.id,
      email : existAccount.email
    },
    process.env.JWT_SECRET
    ,
    {
      expiresIn : rememberPassword ? '30d' : '1d'
    }
  );
  res.cookie("token",token,
    {
      maxAge : rememberPassword ? (30 * 24 * 60 * 60 * 1000) :( 24 * 60 * 60 * 1000),
      httpOnly : true,
      sameSite : "strict"
    }
  );
  res.json(
    {
      code : "success",
      message: "Đăng nhập thành công !"
    }
  )

}

module.exports.register = (req,res) =>{
  res.render('admin/pages/register.pug',{
    pageTitle: "Register"
  });
}

module.exports.registerInitial = (req,res) =>{
  res.render('admin/pages/register-initial.pug',{
    pageTitle: "Register initial"
  });
}
module.exports.registerPost = async (req,res) =>{
  const {fullName , email, password} = req.body;

  const existEmail = await AccountAdminModel.findOne({
    email:email
  });
  if(existEmail){
    res.json({
      code : "error",
      message : "Email đã tồn tại !"
    });
    return;
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newAccount = new AccountAdminModel({
  fullName : fullName,
  email : email,
  password : hashedPassword,
  status : "initial"
  });

  await newAccount.save();

  res.json({
    code : "success",
    message : "Dang ki thanh cong"
  })


}
module.exports.forgotPassword = (req,res) =>{
  res.render('admin/pages/forgot-password.pug',{
    pageTitle: "Forgot Password"
  });
}
module.exports.forgotPasswordPost = async (req,res) => {
  const {email} = req.body;
  const existAccount = await AccountAdminModel.findOne({email : email});
  if(!existAccount){
    res.json({
      code : "error",
      message : "Tài khoản không tồn tại "
    })
    return;
  }
  const otp = generateHelper.generateRandomNumber(process.env.OTP_LENGTH);
  const existEmailInForgotPassword = await ForgotPasswordModel.findOne({email : email});
  const newRecord = new ForgotPassword(
    {
      email : email,
      otp : otp,
      expireAt : Date.now() + 5 * 60 * 1000
    }
  );
  if(existEmailInForgotPassword){
    res.json(
      {
        code : "error",
        message : "Vui lòng gửi lại sau 5 phút !"
      }
    )
    return;
  }
  await newRecord.save();
  const subject =  "Mã OTP của quý khách là :";
  const text = `Mã OTP của quý khách là ${otp}. Mã sẽ hết hạn sau 5 phút . Vui lòng không gửi cho ai khác.`;
  sendMaileHelper.sendMail(email,subject,text);

  res.json(
    {
      code : "success",
      message : "Đã gửi mã OTP qua email"
    }
  )
}
module.exports.otpPassword = (req,res) =>{
  res.render('admin/pages/otp-password.pug',{
    pageTitle: "Otp Password"
  });
}
module.exports.otpPasswordPost = async (req,res) =>{
  const {email,otp} = req.body;
  const existEmailInForgotPassword = await ForgotPasswordModel.findOne({email : email});
  if(!existEmailInForgotPassword){
    res.json(
      {
        code : "error",
        message : "Mã đã hết hạn !"
      }
    )
    return;
  }
  if(otp != existEmailInForgotPassword.otp){
    res.json(
      {
        code : "error",
        message : "Mã không chính xác, vui lòng nhập lại"
      }
    )
    return;
  }
  const existEmail = await AccountAdminModel.findOne({email : email});
  const token = jwt.sign(
    {
      id : existEmail.id,
      email : existEmail.email
    },
    process.env.JWT_SECRET
    ,
    {
      expiresIn : "1d"
    }
  )
  res.cookie("token",token,
    {
      maxAge : 24 * 60 * 60 * 1000,
      httpOnly : true,
      sameSite : "strict"
    }
  );
  await ForgotPasswordModel.deleteOne({email : email});
  res.json(
    {
      code : "success",
      message : "Mã OTP chính xác"
    }
  )


}
module.exports.resetPassword = (req,res) =>{
  res.render('admin/pages/reset-password.pug',{
    pageTitle: "Reset Password"
  });
}
module.exports.resetPasswordPost = async (req,res) =>{
  try{
    const {password} = req.body;
    const {id} = req.account.id;
    // tim kiem banwg id se nhanh hon vi vos index
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);
    await AccountAdminModel.updateOne({_id : id},{password : hashedPassword});
    res.json(
      {
        code: "success",
        message : "Đã thay đổi mật khẩu "
      }
    )
  } catch(error){
    res.json(
      {
        code : "error",
        message : "Phiên đổi mật khẩu không hợp lệ hoặc đã hết hạn !"
      }
    )
  }
}

module.exports.logoutPost = (req,res) =>{
  res.clearCookie("token");
  res.json({
    code : "success",
    message : "Đăng xuất thành công"
  })
}