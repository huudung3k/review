const Joi = require('joi');
module.exports = (req,res,next) => {
  const schema = Joi.object(
    {
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
      )
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