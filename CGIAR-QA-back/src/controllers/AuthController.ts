import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { getRepository, getConnection } from "typeorm";
import { validate } from "class-validator";

import config_ from "@config/config";

import { QAUsers } from "@entity/User";
import { QAGeneralConfiguration } from "@entity/GeneralConfig";
import { RolesHandler } from "@helpers/RolesHandler";
import Util from "@helpers/Util";
import { QACycle } from "@entity/Cycles";
let ActiveDirectory = require('activedirectory');

const { ErrorHandler } = require("@helpers/ErrorHandler")

class AuthController {
    static login = async (req: Request, res: Response, next: NextFunction) => {
        const { username, password } = req.body;
        try {
            const user = await Util.login(username, password);
            res.status(200).json({ data: user })
        } catch (error) {
            console.log(error);

            return res.status(400).json(error);
        }


    };


    static tokenLogin = async (req: Request, res: Response) => {
        try {
            //Check if username and password are set
            let { crp_id, token } = req.body;

            if (!(crp_id && token)) {
                res.status(404).json({ message: 'Not authorized.' })
            }
            let queryRunner = getConnection().createQueryBuilder();

            const [query, parameters] = await queryRunner.connection.driver.escapeQueryWithParameters(
                `SELECT
                    *, (SELECT id FROM qa_crp WHERE crp_id = '${crp_id}') AS qa_crp_id
                FROM
                    qa_token_auth
                WHERE
                    crp_id = :crp_id
                AND
                    token = :token
                AND 
                    DATE(expiration_date) >= CURDATE()
                    `,
                { crp_id, token },
                {}
            );

            let r = await queryRunner.connection.query(query, parameters);
            // console.log('token', r, query, parameters)
            if (r.length == 0) {
                res.status(400).json({ data: [], message: 'Invalid token' });
                return;
            }
            let auth_token = r[0];
            let user = await Util.createOrReturnUser(auth_token);
           

            res.status(200).json({ data: user, message: 'CRP Logged' })

        } catch (error) {
            console.log(error)
            res.status(400).json(error)
            // next(error)
        }
    }

    static changePassword = async (req: Request, res: Response) => {
        //Get ID from JWT
        const id = res.locals.jwtPayload.userId;

        //Get parameters from the body
        const { oldPassword, newPassword } = req.body;
        if (!(oldPassword && newPassword)) {
            throw new ErrorHandler(400, 'Passwords are not the same.');
        }

        //Get user from the database
        const userRepository = getRepository(QAUsers);
        let user: QAUsers;
        try {
            user = await userRepository.findOneOrFail(id);
        } catch (id) {
            throw new ErrorHandler(401, 'User not found.');
        }

        //Check if old password matchs
        if (!user.checkIfUnencryptedPasswordIsValid(oldPassword)) {
            throw new ErrorHandler(401, 'Password does not match.');
        }

        //Validate de model (password lenght)
        user.password = newPassword;
        const errors = await validate(user);
        if (errors.length > 0) {
            throw new ErrorHandler(400, errors);
        }
        //Hash the new password and save
        user.hashPassword();
        user = await userRepository.save(user);
        delete user.password;

        res.status(200).send({ data: user });
    };

    static createGeneralConfig = async (req: Request, res: Response) => {
        //get body data
        // console.log(req.body)
        let { end_date, start_date, role, status, peer_review_paper_guideline, policies_guideline, almetrics_guideline,
            anual_report_guideline, innovations_guideline, partnerships_guideline, capdev_guideline, uptake_guideline, oicr_guideline } = req.body;
        try {
            const configRepository = getRepository(QAGeneralConfiguration);
            let config = new QAGeneralConfiguration();
            config.end_date = end_date;
            config.start_date = start_date;
            config.status = status;
            config.role = role;
            config.anual_report_guideline = anual_report_guideline;
            config.innovations_guideline = innovations_guideline;
            config.partnerships_guideline = partnerships_guideline;
            config.capdev_guideline = capdev_guideline;
            config.peer_review_paper_guideline = peer_review_paper_guideline;
            config.policies_guideline = policies_guideline;
            config.almetrics_guideline = almetrics_guideline;
            config.uptake_guideline = uptake_guideline;
            config.oicr_guideline = oicr_guideline;


            config = await configRepository.save(config);

            res.status(200).send({ data: config });

        } catch (error) {
            console.log(error)
            res.status(400).send({ data: error, message: 'Configuration can not be created' });
        }
    }

    static validateAD(qa_user, password) {
        console.log(config_.active_directory)
        let ad = new ActiveDirectory(config_.active_directory);

        let ad_user = qa_user.email;

        return new Promise((resolve, reject) => {
            ad.authenticate(ad_user, password, (err, auth) => {
                console.log(err);
                console.log(auth);

                if (err) {
                    if (err.errno == "ENOTFOUND") {
                        let notFound = {
                            'errno': 'SERVER_NOT_FOUND',
                            'description': 'Domain Controller Server not found'
                        };
                        reject(notFound);
                    }
                }

                if (auth) {
                    console.log('Authenticated AD!');
                    resolve(auth)
                }

                else {
                    console.log('Authentication failed!');
                    
                    let err = {
                        'errno': 'INVALID_CREDENTIALS',
                        'description': 'The supplied credential is invalid'
                    };
                    reject(err);
                }

            })
        });
    }

}
export default AuthController;