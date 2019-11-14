import express from 'express';
const router = express.Router();

import bodyParser from 'body-parser';
import throwError from '../lib/throwError';

router.use(bodyParser.json());

router.get('/', (req: any, res: any) => {
  const date = new Date();
  res.send(date);
});

module.exports = router;
