import {Request, Response, Router} from 'express';

const router = Router();

router.get('/', (req: Request, resp: Response) => {
  resp.json({message: 'Api entrypoint'});
});

export default router;