const { Router } = require('express');

const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) { return cb(err); }
            cb(null, raw.toString('hex') + path.extname(file.originalname));
        })
    }
})

const upload = multer({ storage: storage });
const PhotoService = require('@app/services/photos');
const route = Router();

module.exports = async function (routes) {
    routes.use('/photo', route);

    route.get('/', async(req, res, next) => {
        try {
            let idRichiesta = req.query.photo_review_id;

            let result = await PhotoService.getByReviewId(idRichiesta);
            res.status(200).json(result);
        } catch (e) {
            let error = new Error('Error while getting photo: ' + e.message);
            error.status = e.code || 500;
            next(error);
        }
    });


    route.post('/', upload.single('review_image'), async (req, res, next) => {
        try {
            if(!req.file){
                throw Error('Please provide an image');
            }
            const photo_path = req.file.path;
            let result = await PhotoService.add(req.query.photo_review_id, photo_path);
            res.status(201).json(result);
        } catch (e) {
            let error = new Error('Error while inserting Photo: ' + e.message);
            error.status = e.code || 500;
            next(error);
        }
    });
};
