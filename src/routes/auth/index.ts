import express from 'express';
const router = express.Router();
import bodyParser from 'body-parser';
import crypto from 'crypto';
import util from 'util';
import jwt from 'jsonwebtoken';

// Schema
import User from '../../lib/models/User';

const throwError = require('../../lib/throwError.js');

router.use(bodyParser.json());

router.post('/', async (req: any, res: any, next: any) => {
  try {
    const pbkdf2 = util.promisify(crypto.pbkdf2);

    const { id, password } = req.body;
    const user: any = await User.findOne({ id });

    if (!id || !password) throwError('필수 항목이 입력되지 않았습니다.', 500);
    if (!user) throwError('로그인에 실패했습니다.', 500);

    const cryptoPassword = await pbkdf2(
      password,
      user.enckey,
      100000,
      64,
      'sha512'
    );

    if (user.password !== cryptoPassword) {
      throwError('로그인에 실패했습니다.', 500);
    }

    const payload = {
      userId: user.uid,
      nickname: user.nickname,
      _id: user._id
    };
    const tokenExpireTime = Date.now() + 10800;

    const jwtSettings = {
      expiresIn: tokenExpireTime,
      issuer: 'dodoli.net'
    };

    const result = jwt.sign(
      payload,
      process.env.TOKEN_KEY || 'tokenkey',
      jwtSettings
    );
    res.status(201).json({ token: result });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
