const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

module.exports.petSchema = Joi.object({
  pet: Joi.object({
    title: Joi.string().escapeHTML(),
    species: Joi.string().escapeHTML(),
    breed: Joi.string().escapeHTML(),
    identifier: Joi.number(),
    pattern: Joi.string().escapeHTML(),
    color: Joi.array().items(Joi.string()),
    firstcolor: Joi.string().escapeHTML(),
    secondcolor: Joi.string().escapeHTML(),
    thirdcolor: Joi.string().escapeHTML(),
    coat: Joi.string().escapeHTML(),
    size: Joi.string().escapeHTML(),
    age: Joi.string().escapeHTML(),
    gender: Joi.string().escapeHTML(),
    petStatus: Joi.string().escapeHTML(),
    // location: Joi.string().required().escapeHTML(),
    latitude: Joi.number(),
    longitude: Joi.number(),
    lostdate: Joi.date().greater("01-01-2023").required(),
    description: Joi.string().required().escapeHTML(),
  }),
  deleteImages: Joi.array(),
});

module.exports.commentSchema = Joi.object({
  comment: Joi.object({
    // rating: Joi.number().required().min(0).max(5),
    // latitude: Joi.number(),
    // longitude: Joi.number(),
    body: Joi.string().required().escapeHTML(),
  }).required(),
});
