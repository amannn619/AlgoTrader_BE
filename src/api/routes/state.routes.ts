import { Router } from "express";
import { StateController } from "../controllers/state.controller";

const router = Router();

router.get('/', StateController.getState);

export default router;