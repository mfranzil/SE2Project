const { Router } = require('express');

const PlaceLineService = require('@app/services/lines');
const UserService = require('@app/services/users');

const route = Router();

module.exports = async function (routes) {
    routes.use('/lines', route);

    route.post('/', async (req, res, next) => {
        try {
            let result = await PlaceLineService.place(req.query);
            res.status(201).json('Added review with id: ' + result);
            UserService.increaseInteractions(req.query.logged_user_id);
        } catch (e) {
            const error = new HTTPError(e.code || 500, 'Wrong line info: ' + e.message);
            console.log(e);
            next(error);
        }
    });

    route.get('/*', async (req, res, next) => {
        let result;

        if (req.path === "/") {
            try {
                result = await PlaceLineService.getAll(req.query);
                res.status(200).json(result);
                // inc
            } catch (e) {
                const error = new HTTPError(e.code || 500, 'Error while getting Lines: ' + e.message);
                next(error);
            }
        }
        else {
            try {
                result = await PlaceLineService.get(req.path.replace('/', ''));
                res.status(200).json(result);
                // inc
            } catch (e) {
                const error = new HTTPError(e.code || 500, 'Error while getting Line: ' + e.message);
                next(error);
            }
        }
    });
};
