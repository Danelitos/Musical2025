import { Router } from 'express';
import { getTheater, getSeats, reserveSeats } from '../controladores/theater.js';

const router = Router();

router.get('/theater', getTheater);
router.get('/seats', getSeats);
router.post('/reserve', reserveSeats);

export default router;
