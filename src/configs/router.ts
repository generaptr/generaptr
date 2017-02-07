import {Router} from 'express';
import indexController from '../controllers/indexController';

const router = Router();

router.use('/', indexController);

export default router;