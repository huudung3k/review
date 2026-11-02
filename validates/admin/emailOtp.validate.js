const Joi = require('joi');
module.exports = (req,res,next) => {
  const schema = Joi.object(
    {
      email: Joi.string().email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'net', 'vn'] }
      }).required().messages({
          "string.empty": "Vui lòng nhập email!",
          "string.email": "Định dạng email không hợp lệ!"
      }),
      otp: Joi.string().length(parseInt(process.env.OTP_LENGTH)).pattern(/^[0-9]+$/).required().messages({
        "string.empty": "Vui lòng nhập mã OTP!",
        "string.length": `Mã OTP phải có đúng ${process.env.OTP_LENGTH} chữ số!`,
        "string.pattern.base": "Mã OTP chỉ được chứa các chữ số từ 0-9!"
    })
    }
  );
  const {error} = schema.validate(req.body);
  if(error){
    const errorMessage = error.details[0].message;
        res.json(
      {
        code : "error",
        message : errorMessage
      }
    );
    return;
  }
  next();
}