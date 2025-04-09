let jwt = require('jsonwebtoken')
let constants = require('../utils/constants')
let userController = require('../controllers/users');
const e = require('express');
module.exports = {
    check_authentication: async function (req, res, next) {
        if (req.headers && req.headers.authorization) {
            let authorization = req.headers.authorization;
            if (authorization.startsWith("Bearer")) {
                let token = authorization.split(" ")[1]
                let result = jwt.verify(token, constants.SECRET_KEY);
                if (result.expire > Date.now()) {
                    let user = await userController.GetUserByID(result.id);
                    req.user = user;
                    next();
                } else {
                    throw new Error("ban chua dang nhap")
                }
            } else {
                throw new Error("ban thieu Bearer ")
            }
        } else {
            throw new Error("Gan Authorization thong tin du lieu")
        }
    },
    check_authorization: function (roles) {
        return async function (req, res, next) {
            try {
                let roleOfUser = req.user.role.name;
                if (roles.includes(roleOfUser)) {
                    next();
                } else {
                    throw new Error("ban khong co quyen")
                }
            } catch (error) {
                next(error)
            }
        }
    },
    check_authentication_token: function (req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).send('Missing Authorization header');

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, constants.SECRET_KEY);
            req.user = decoded;
            req.token = token;
            next();
        } catch (err) {
            return res.status(401).send('Invalid token');
        }
    }

}