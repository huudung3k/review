const Joi = require('joi');
module.exports.createPost = (req,res,next) => {
  const schema = Joi.object({
    name: Joi.string().required().messages(
      {
        "string.empty" : "Vui lòng nhập tên danh mục !"
      }
    ),
    category: Joi.string().allow(""),
    position:Joi.string().allow(""),
    status : Joi.string().allow(""),
    avatar: Joi.string().allow(),
    priceAdult : Joi.number().allow(""),
    priceChildren : Joi.number().allow(""),
    priceBaby : Joi.number().allow(""),
    priceNewAdult : Joi.number().allow(""),
    priceNewChildren : Joi.number().allow(""),
    priceNewBaby : Joi.number().allow(""),
    stockAdult : Joi.number().allow(""),
    stockChildren : Joi.number().allow(""),
    stockBaby : Joi.number().allow(""),
    locations : Joi.string().allow(""),
    time : Joi.string().allow(""),
    vehicle : Joi.string().allow(""),
    departureDate : Joi.string().allow(""),
    information : Joi.string().allow(""),
    schedules: Joi.string().allow("")
  })
  const {error} = schema.validate(req.body);
  if(error){
    const errorMessage = error.details[0].message;
    res.json({
      code : "error",
      message : errorMessage
    })
    return;
  }
  next();
}