const bodyParser = require('body-parser');
const cors = require('cors');
const cookie = require('cookie-parser');

const routes = require('@app/routes');
const config = require('@app/config');

const Logger = require('@app/loaders/logger');

const auth = require('@app/services/isAuth');
// adapted from: https://github.com/santiq/bulletproof-nodejs/blob/master/src/loaders/express.ts

async function loader(app) {
    /**
     * Health Check endpoints
     */
    app.get('/status', (req, res) => {
        res.status(200).end();
    });
    app.head('/status', (req, res) => {
        res.status(200).end();
    });

    // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
    // It shows the real origin IP in the heroku or Cloudwatch logs
    app.enable('trust proxy');

    // Cookie parser for login auth
    app.use(cookie())

    // The magic package that prevents frontend developers going nuts
    // Alternate description:
    // Enable Cross Origin Resource Sharing to all origins by default
    app.use(cors());


    // Middleware to handle user login
    app.use((req, res, next) => {
        // When user is not logged in can access
        // only login and signup page
        if (req.path !== config.api.prefix + '/login' && req.path !== config.api.prefix + '/signup') {
            try {
                // If there are no token you are not logged
                if (auth.isAuth(req) == undefined) {
                    const err = new Error('Please Login first');
                    err['status'] = 401;
                    next(err);
                } else {
                    Logger.info("Logged with UserID: " + auth.isAuth(req));
                }
            }
            catch (e) {
                const error = new Error(e.message);

                // If LoginError -> expired or wrong token
                if (e.constructor === auth.LoginError) {
                    err['status'] = 403;
                }
                next(err);
            }
        }
        next();
    });

    // Middleware that transforms the raw string of req.body into json
    app.use(bodyParser.json());
    // Load API routes
    app.use(config.api.prefix, routes());



    /// catch 404 and forward to error handler
    app.use((req, res, next) => {
        const err = new Error('Not Found');
        err['status'] = 404;
        next(err);
    });

    /// error handlers
    app.use((err, req, res, next) => {
        /**
         * Handle 401 thrown by express-jwt library or 401 in general.
         */
        if (err.name === 'UnauthorizedError' || err.status === 401) {
            return res
                .status(err.status)
                .send({ message: err.message })
                .end();
        }
        return next(err);
    });
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
        res.status(err.status || 500);
        res.json({
            errors: {
                message: err.message
            }
        });
    });
}

module.exports = loader;
