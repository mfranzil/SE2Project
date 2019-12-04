const { Router } = require('express');

const UserService = require('@app/services/users');

const route = Router();

module.exports = async function (routes) {
    routes.use('/users', route);

    route.get('/', async (req, res, next) => {
        try {
            const users = await UserService.find(req.query);
            res.status(200).json(users);
        } catch (e) {
            const error = new Error('Failed to retrieve users: ' + e.message);
            error.httpStatusCode = 400;
            next(error);
        }
    });
};
