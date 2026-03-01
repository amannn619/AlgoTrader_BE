import { Request, Response } from 'express';
import { TriggerModel } from '../../db/models/Trigger.model';
import { marketSession } from './session.controller';
import { SensexModel } from '../../db/models/Sensex.model';

export class TriggerController {

  static async getAllTriggers(req: Request, res: Response) {
    try {

      const page = Number(req.query.page ?? 0);
      const limit = Number(req.query.limit ?? 0);
      const actionsParam = req.query.actions as string | undefined;
      const symbolsParam = req.query.symbols as string | undefined;

      const query: any = {};

      if (symbolsParam) {
        query.symbol = symbolsParam.split(',');
      }

      if (actionsParam) {
        const actions = actionsParam.split(',');
        query.action = actions;
      }

      const skip = page * limit;

      const [items, total] = await Promise.all([
        TriggerModel
          .find(query)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        TriggerModel.countDocuments(query)
      ])

      res.json({ items, total })
    }
    catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch triggers' });
    }

  }

  static async getTriggers(req: Request, res: Response) {
    try {
      const symbol = req.params.symbol;
      const page = Number(req.query.page ?? 0);
      const limit = Number(req.query.limit ?? 10);
      const actionsParam = req.query.actions as string | undefined;

      if (!symbol) {
        return res.status(400).json({ message: 'symbol is required' });
      }

      const query: any = { symbol };

      if (actionsParam) {
        const actions = actionsParam.split(',');
        query.action = { $in: actions };
      }

      const skip = page * limit;

      const [items, total] = await Promise.all([
        TriggerModel
          .find(query)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        TriggerModel.countDocuments(query)
      ]);

      res.json({ items, total });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch triggers' });
    }
  }

  static async getLatestTriggersByStock(req: Request, res: Response) {
    try {
      const page = Number(req.query.page ?? 0);
      const limit = Number(req.query.limit ?? 0);
      const actionsParam = req.query.actons as string | undefined;

      const latestTriggers = await TriggerModel.aggregate([
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: '$symbol',
            latestDoc: { $first: '$$ROOT' }
          }
        },
        { $replaceRoot: { newRoot: '$latestDoc' } },
      ]);

      const triggerMap = new Map();
      latestTriggers.forEach((trigger) => {
        triggerMap.set(trigger.symbol, trigger);
      })

      const activeStocksMap = marketSession.stateStore.getAllStocks();

      const allSymbols = new Set([
        ...Array.from(activeStocksMap.keys()),
        ...triggerMap.keys()
      ])

      let combinedList = Array.from(allSymbols).map(symbol => {
        const trigger = triggerMap.get(symbol);
        if (trigger) {
          return trigger;
        }
        else {

          const activeStock = activeStocksMap.get(symbol);
          const currentPrice = activeStock ? activeStock.currPrice : 0;
          const basePrice = activeStock ? activeStock.basePrice : 0;
          return {
            symbol,
            action: "-",
            stockPrice: currentPrice,
            lastStockPrice: basePrice,
            sensexPrice: null,

            lastSensexPrice: null,

            stockDirection: "-",
            sensexDirection: "-",

            timestamp: null
          };
        }
      });

      if (actionsParam) {
        const actions = actionsParam.split(',');
        combinedList = combinedList.filter(item => actions.includes(item.action));
      }

      combinedList.sort((a, b) => a.symbol.localeCompare(b.symbol));

      const total = combinedList.length;
      const start = page * limit;
      const end = start + limit;
      const items = combinedList.slice(start, end);


      res.json({ items, total })
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch triggers' });
    }

  }

  static async getSensexTriggers(req: Request, res: Response) {
    try {

      const page = Number(req.query.page ?? 0);
      const limit = Number(req.query.limit ?? 0);

      const query: any = {};

      const skip = page * limit;

      const [items, total] = await Promise.all([
        SensexModel
          .find(query)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        SensexModel.countDocuments(query)
      ])

      res.json({ items, total })
    }
    catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch Sensex History' });
    }

  }
}
