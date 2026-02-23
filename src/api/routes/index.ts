import { Router } from 'express';
import tradeRoutes from './trade.routes';
import triggerRoutes from './trigger.routes';
import sessionRoutes from './session.routes';
import stateRoutes from './state.routes';

const router = Router();

router.use('/trades', tradeRoutes);
router.use('/triggers', triggerRoutes);
router.use('/session', sessionRoutes);
router.use('/state', stateRoutes)

export default router;
