import { Request, Response } from "express";
import { marketSession } from "./session.controller";

export class StateController {
    static async getState(req: Request, res: Response) {
        try {
            const state = marketSession.stateStore.toJSON();

            const rawStocks = (Array.isArray(state.stocks)
                ? state.stocks
                : Object.values(state.stocks || {})) as any[];

            const sortedStocks = rawStocks.sort((a: any, b: any) =>
                a.symbol.localeCompare(b.symbol)
            );

            state.stocks = sortedStocks;
            res.json(state);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to fetch state' });
        }
    }
}