import "reflect-metadata";
require("module-alias/register");
import { createConnection, ConnectionManager, Connection } from "typeorm";
import express from "express";
import urlencoded from "express";
import { Response } from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import Routes from "./routes/IndexRoute";
import config from "./config/config";
const { handleError } = require("./_helpers/ErrorHandler");
const parentDir = require("path").resolve(process.cwd(), "../");
const morgan = require("morgan");

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

createConnection()
  .then(() => {
    const app = express();
    app.use(morgan("dev"));
    app.use(cors(corsOptions));
    app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    app.use(helmet({ frameguard: false }));
    app.use(bodyParser.json());

    app.use("/api", Routes);
    app.get("/", (req, res) => {
      res.status(200).json({ msg: "Welcome to QA API! 🖥" });
    });

    // app.use((err, req, res, next) => {
    //   res.setHeader("Cross-Origin-Resource-Policy", "same-site");
    //   res.setHeader("Content-Type", "application/json; charset=utf-8");
    //   handleError(err, res);
    // });
    let server = app.listen(config.port, config.host, () => {
      console.log(`Current parent directory: ${parentDir} `);
      console.log(
        `Server started on port ${config.port} and host ${config.host}!`
      );
    });
  })
  .catch((error) => {
    console.log("createConnection", error);
  });
