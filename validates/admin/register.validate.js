const Joi = require('joi');

module.exports = async (req,res,next) => {
  // cấu hình  dữ liệu được gửi cho backend chỉ  bao gồm 
  //các trường đã khai báo và phải thỏa đk tránh fe gửi các trường lung tung
  const schema = Joi.object({
    fullName: Joi.string().min(5).max(50).required().messages(
      {// kiếm tra lỗi theo key / value 
        "string.empty" : "Vui lòng nhâp họ tên !",
        "string.min" : "Họ tên phải có ít nhất 5 ký tự!",
        "string.max" : "Họ tên không được vượt quá 50 ký tự!"
      }
    ),
    email: Joi.string().email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'net'] }
        }).messages(
          {
            "string.empty" : "Vui lòng nhâp email !"
        }
      ),
    password: Joi.string().min(8).custom((value,helpers ) => {
      if(!/[A-Z]/.test(value)){
        return helpers.error("string.upperCase");
      }
      if(!/[a-z]/.test(value)){
        return helpers.error("string.lowerCase");
      }
      if(!/\d/.test(value)){
        return helpers.error("string.digit");
      }
      if(!/[@$!%*?&]/.test(value)){
        return helpers.error("string.special");
      }
      // nếu đủ điều kiện thì trả về dữ liệu
      return value;
    }).messages(
      {
          "string.empty" : "Vui lòng nhâp mật khẩu !",
          "string.min" : "Mật khẩu phải chứa ít nhất 8 ký tự!",
          "string.upperCase" : "Mật khẩu phải chứa ít nhất một chữ cái in hoa!",
          "string.lowerCase" : "Mật khẩu phải chứa ít nhất một chữ cái thường!",
          "string.digit" : "Mật khẩu phải chứa ít nhất một chữ số!",
          "string.scpecial" : "Mật khẩu phải chứa ít nhất một ký tự đặc biệt!"

      }
    ),
  });
  // lấy mỗi biến error, phá vỡ cấu 
  const {error} = schema.validate(req.body);
  if(error){
    const errorMessage = error.details[0].message;
    res.json({
      code : "error",
      message : errorMessage
    });
    return;
  }
  next();
}