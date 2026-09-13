import { Router } from 'express';
import { getMarketPrices } from '../controllers/marketPriceController.js';

const router = Router();

router.get('/', getMarketPrices);

export default router;
