import express from 'express';
const router = express.Router();
import bodyParser from 'body-parser';
import crypto from 'crypto';
import util from 'util';

// Schema
import User from '../../lib/models/User';

const throwError = require('../../lib/throwError.js');

router.use(bodyParser.json());

router.post('/', async (req: any, res: any) => {
  const pbkdf2 = util.promisify(crypto.pbkdf2);

  const { id, password } = req.body;
  const user: any = await User.findOne({ id });

  if (!id || !password) throwError('필수 항목이 입력되지 않았습니다.', 500);
  if (!user) throwError('로그인에 실패했습니다.', 500);

  const cryptoPassword = await pbkdf2(password, user, 100000, 64, 'sha512');
});

module.exports = router;
