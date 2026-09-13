import { Router } from 'express';
import {
	getMarketAnalysis,
	getMarkets,
	getMarketByCrop,
} from '../controllers/marketController.js';

const router = Router();

router.get('/', getMarkets);
router.get('/:crop', getMarketByCrop);
router.post('/analysis', getMarketAnalysis);

export default router;
