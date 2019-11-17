const Joi = require("joi");

//Validation for Tweet API
function validateTweet(user) {
    const schema = {
        user_id: Joi.string().required(),
        tweet_text: Joi.string()
    };

    return Joi.validate(user, schema);
}

exports.validateTweet = validateTweet;
