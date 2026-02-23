import { Request, Response } from "express";
import { marketSession } from "./session.controller";

export class StateController {
    static async getState(req: Request, res: Response) {
        try {
            const state = marketSession.stateStore.toJSON();

            res.json(state);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to fetch state' });
        }
    }
}