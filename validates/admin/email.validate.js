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