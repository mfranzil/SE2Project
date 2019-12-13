const { Router } = require('express');

const RetrieveService = require('@app/services/retrieveNearbyLines');

const route = Router();

module.exports = async function (routes) {
    routes.use('/retrieve', route);

    route.get('/', async (req, res, next) => {
        try {
            const result = await RetrieveService.retrieve(req.query);
            res.status(200).json(result);
        } catch (e) {
            const error = new Error('Wrong retrieving info: ' + e.message);
            error.status = e.code || 500;
            next(error);
        }
    });
};