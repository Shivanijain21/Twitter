"use strict";
const express = require("express");
const router = express.Router();
const kafka = require("../kafka/client");
const passwordHash = require('password-hash');
const pool = require('../utils/mysqlConnection');
const uploadFileToS3 = require('../utils/awsImageUpload');
const { checkAuth } = require("../utils/passport");
const { validateProfile } = require("../validations/profileValidations");
const { validatePassword } = require("../validations/passwordValidations");
const { STATUS_CODE, MESSAGES } = require('../utils/constants');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }

})
const upload = multer({ storage });
express().use(express.static('public'));

router.get("/:user_id", async (req, res) => {
    let msg = {};
    msg.route = "get_profile";
    msg.user_id = req.params.user_id;

    kafka.make_request("profile", msg, function (err, results) {
        if (err) {
            res.status(err.status).send(err.data);
        }
        else {
            res.status(results.status).send(results.data);
        }
    });
});

router.post("/", upload.single('image'), async (req, res) => {
    const { error } = validateProfile(req.body);
    if (error) {
        res.status(STATUS_CODE.BAD_REQUEST).send(error.details[0].message);
    }
    let msg = req.body;
    msg.route = "update_profile";
    let imageUrl = "";
    if (req.file) {
        try {
            imageUrl = await uploadFileToS3(req.file, 'profile', msg.user_id);
            msg.user_image = imageUrl.Location;
        } catch (error) {
            console.log(error);
        }
    }
    console.log('Sending kafka request');
    kafka.make_request("profile", msg, function (err, results) {
        if (err) {
            res.status(err.status).send(err.data);
        }
        else {
            res.status(results.status).send(results.data);
        }
    });
});

router.post("/password", async (req, res) => {
    const { error } = validatePassword(req.body);
    if (error) {
        res.status(STATUS_CODE.BAD_REQUEST).send(error.details[0].message);
    }
    let hashedPassword = passwordHash.generate(req.body.password);
    let sql = `CALL Password_update('${req.body.user_id}', NULL, '${hashedPassword}');`;
    pool.query(sql, (err, sqlResult) => {
        if (err) {
            res.status(STATUS_CODE.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_SERVER_ERROR);
        }
        if (sqlResult && sqlResult.length > 0 && sqlResult[0][0].status === 'PASSWORD_UPDATED') {
            res.status(STATUS_CODE.SUCCESS).send(MESSAGES.SUCCESS);
        }
        else {
            res.status(STATUS_CODE.UNAUTHORIZED).send(MESSAGES.INVALID_CREDENTIALS);
        }
    });
});

module.exports = router;