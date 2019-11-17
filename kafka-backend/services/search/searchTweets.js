"use strict";
const Tweets = require('../../models/tweets');
const { STATUS_CODE, MESSAGES } = require("../../utils/constants");

let searchTweets = async (msg, callback) => {
    let response = {};
    let err = {};
    try {
        let tweetRegex = new RegExp(msg.input, 'i')
        let tweets = await Tweets.find({ $or: [{ "hashtags": tweetRegex }] });
        if (!tweets) {
            err.status = STATUS_CODE.BAD_REQUEST;
            err.data = MESSAGES.ACTION_NOT_COMPLETE;
            return callback(err, null);
        }
        else {
            response.status = STATUS_CODE.SUCCESS;
            response.data = JSON.stringify(tweets);
            return callback(null, response);
        }
    } catch (error) {
        console.log(error);
        err.status = STATUS_CODE.INTERNAL_SERVER_ERROR;
        err.data = MESSAGES.INTERNAL_SERVER_ERROR;
        return callback(err, null);
    }
};
exports.searchTweets = searchTweets;