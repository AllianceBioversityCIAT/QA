import "reflect-metadata";
require('module-alias/register')
import { createConnection, ConnectionManager, Connection } from "typeorm";
import express from "express";
import { Response } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import Routes from "./routes/IndexRoute";
import config from "./config/config";
const { handleError } = require('./_helpers/ErrorHandler');
const parentDir = require('path').resolve(process.cwd(), '../');
const morgan = require('morgan');


// Connects to the Database -> then starts the express
createConnection()
    .then(() => {
        // Create a new express application instance
        const app = express();
        // Call midlewares
        app.use(morgan('dev'))
        app.use(cors());
        app.use(helmet(
            { frameguard: false }
        ));
        app.use(bodyParser.json());
        // app.use(express.static(parentDir + '/CGIAR-QA-front/dist/qa-app'));



        //Set all routes from routes folder
        app.use("/api", Routes);
        app.get("/", (req, res) => {
            res.status(200).json({ msg: 'Welcome to QA API! 🖥' });
        });
        // app.get('/', (req, res) => {
        //     res.sendFile(parentDir + "/CGIAR-QA-front/dist/qa-app/index.html")
        // });
        // // 404 catch 
        // app.all('*', (req: any, res: any) => {
        //     console.log(`[TRACE] Server 404 request: ${req.originalUrl}`);
        //     res.status(200).sendFile(parentDir + "/CGIAR-QA-front/dist/qa-app/index.html");
        // });

        //Handle Errors
        app.use((err, req, res, next) => {
            res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            handleError(err, res);
        });
        let server = app.listen(config.port, config.host, () => {
            console.log(`Current parent directory: ${parentDir} `);
            console.log(`Server started on port ${config.port} and host ${config.host}!`);
        });
    })
    .catch(error => {
        console.log('createConnection', error)
    });