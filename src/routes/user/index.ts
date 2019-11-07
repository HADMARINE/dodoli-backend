import express from 'express';
const router = express.Router();

import bodyParser from 'body-parser';
const throwError = require('../../lib/throwError.js');

router.use(bodyParser.json());

router.get('/', (req: any, res: any) => {
  const date = new Date();
  res.send(date);
});

module.exports = router;
