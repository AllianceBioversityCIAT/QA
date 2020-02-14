import { Router } from "express";
import { checkJwt } from "../middlewares/checkJwt";
import { checkRole } from "../middlewares/checkRole";

import IndicatorsController from "../controllers/IndicatorsController";
import { RolesHandler } from "../_helpers/RolesHandler";

const router = Router();



/***
 * 
 * Indicators
 * 
 */

// create role
router.post("/", [checkJwt, checkRole([RolesHandler.admin])], IndicatorsController.createIndicator);
// get all roles
router.get("/", [checkJwt, checkRole([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp, RolesHandler.guest])], IndicatorsController.getAllIndicators);
// get roles by user
router.get("/:id([0-9]+)", [checkJwt, checkRole([RolesHandler.admin, RolesHandler.assesor, RolesHandler.crp, RolesHandler.guest])], IndicatorsController.getIndicatorsByUser);
// edit role
router.patch("/:id([0-9]+)", [checkJwt, checkRole([RolesHandler.admin])], IndicatorsController.editIndicators);
// // delete role
router.delete("/:id([0-9]+)", [checkJwt, checkRole([RolesHandler.admin])], IndicatorsController.deleteIndicators);


export default router;