const passwordHash = require('password-hash');
const Users = require('../../models/users');
const jwt = require('jsonwebtoken');
const config = require('../../utils/config');

async function handle_request(msg, callback) {
    let response = {};
    let err = {};
    const email_id = msg.email_id;
    const ERROR_MSG = "Invalid Email or Password";
    try {
        let user = await Users.findOne({
            email_id: email_id
        });

        if (!user) {
            err.status = 400;
            err.data = ERROR_MSG
            return callback(err, null);
        } else {
            const validPassword = await passwordHash.verify(msg.password, user.password);
            if (!validPassword) {
                err.status = 400;
                err.data = ERROR_MSG;
                return callback(err, null);
            } else {
                const payload = {
                    _id: user._id, first_name: user.first_name, last_name: user.last_name,
                    user_name: user.user_name, email_id: user.email_id
                };
                const token = jwt.sign(payload, config.secret, {
                    expiresIn: 900000 // in seconds
                });
                response.status = 200;
                response.data = token;
                return callback(null, response);
            }
        }
    } catch (error) {
        console.log(error);
        err.status = 500;
        err.data = "Internal Server Error";
        return callback(err, null);
    }
};

exports.handle_request = handle_request;