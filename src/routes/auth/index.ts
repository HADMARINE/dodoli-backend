import express from 'express';
const router = express.Router();
import bodyParser from 'body-parser';
import crypto from 'crypto';
import util from 'util';
import jwt from 'jsonwebtoken';

// Schema
import User, { UserDocument } from '../../lib/models/User';

import throwError from '../../lib/throwError';

router.use(bodyParser.json());

router.post('/', async (req: any, res: any, next: any) => {
  try {
    const pbkdf2: Function = util.promisify(crypto.pbkdf2);

    const { uid, password } = req.body;
    if (!uid || !password) throwError('필수 항목이 입력되지 않았습니다.', 500);

    // tslint:disable-next-line: await-promise
    const user: any = await User.findOne({ uid });

    if (!user) throwError('로그인에 실패했습니다.', 500);

    const cryptoPassword: string = (
      await pbkdf2(password, user.enckey, 100000, 64, 'sha512')
    ).toString('base64');

    if (user.password !== cryptoPassword) {
      throwError('로그인에 실패했습니다.', 500);
    }

    const payload: object = {
      userId: user.uid,
      nickname: user.nickname,
      _id: user._id
    };
    const tokenExpireTime: number = 10800;

    const jwtSettings: object = {
      expiresIn: tokenExpireTime,
      issuer: process.env.NODE_ENV === 'development' ? '*' : 'dodoli.net'
    };

    const result: string = jwt.sign(
      payload,
      process.env.TOKEN_KEY || 'tokenkey',
      jwtSettings
    );
    res.status(200).json({ token: result });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
