import express from 'express';
const router = express.Router();

import bodyParser from 'body-parser';
const throwError = require('../lib/throwError.js');
import util from 'util';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// const User = require('../../lib/models/User');
import User from '../../lib/models/User';

router.use(bodyParser.json());

router.get('/', (req: any, res: any) => {
  const date = new Date();
  res.send(date);
});

router.post('/', async (req: any, res: any, next: any) => {
  try {
    const { uid, password, nickname, email } = req.body;
    if (!uid || !password || !nickname || !email) {
      return throwError('필수 항목이 입력되지 않았습니다', 400);
    }
    // tslint:disable-next-line: await-promise
    const duplicateUserVerify = await User.findOne().or([
      { uid },
      { nickname },
      { email }
    ]);
    if (duplicateUserVerify) {
      return throwError('이미 존재하는 유저입니다.', 422);
    }
    const randomBytes = util.promisify(crypto.randomBytes);
    const pbkdf2 = util.promisify(crypto.pbkdf2);

    const buf = randomBytes(64);
    const key = pbkdf2(password, buf.toString(), 100000, 64, 'sha512');

    if (process.env.EXAMINE_PASSWORD) {
      const testKey = pbkdf2(password, buf.toString(), 100000, 64, 'sha512');
      if (testKey.toString() !== key.toString()) {
        return throwError('암호화 검증에 실패했습니다.', 500);
      }
    }

    const user = new User({
      uid: uid,
      password: key.toString(),
      nickname: nickname,
      enckey: buf.toString(),
      email: email,
      data: []
    });

    await user.save();

    res.status(201).json({ success: true });
  } catch (e) {
    next(e);
  }
});

router.post('/:id/modify', async (req: any, res: any, next: any) => {
  try {
    res.send('id : ' + req.params.id + ' ||| NOT READY...');
  } catch (e) {
    next(e);
  }
});

router.post('/overlap', async (req: any, res: any, next: any) => {
  try {
    const { type, content } = req.body;
    if (!type || !content) {
      return throwError('필수 항목이 입력되지 않았습니다.', 400);
    }
    const typeArray = ['uid', 'nickname', 'email'];

    if (typeArray.indexOf(type) !== -1) {
      return throwError('입력 값이 잘못되었습니다', 400);
    }

    const query = { [type]: content };

    const user = User.findOne(query);

    let status: number;
    if (user) {
      status = 409;
    } else {
      status = 201;
    }
    res.status(status).json({ overlap: !!user });
  } catch (e) {
    next(e);
  }
});

router.post('/data', (req: any, res: any, next: any) => {
  const token = req.body.token;
  try {
    const tokenValue = jwt.verify(token, process.env.TOKEN_KEY || 'tokenkey');

    User.findOne;
  } catch (e) {
    return throwError('토큰 검증에 실패했습니다.', 403);
  }
});

module.exports = router;
