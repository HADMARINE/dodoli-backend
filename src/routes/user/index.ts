import express from 'express';
const router = express.Router();

import bodyParser from 'body-parser';
import throwError from '../../lib/throwError';
import util from 'util';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// const User = require('../../lib/models/User');
import User, { UserDocument } from '../../lib/models/User';

router.use(bodyParser.json());

router.get('/', (req: any, res: any) => {
  const date: Date = new Date();
  res.send(date);
});

router.post('/', async (req, res, next) => {
  try {
    const { uid, password, nickname, email } = req.body;
    if (!uid || !password || !nickname || !email) {
      return throwError('필수 항목이 입력되지 않았습니다', 400);
    }
    // tslint:disable-next-line: await-promise
    const duplicateUserVerify: any = await User.findOne().or([
      { uid },
      { nickname },
      { email }
    ]);
    if (duplicateUserVerify) {
      return throwError('이미 존재하는 유저입니다.', 422);
    }
    const randomBytes: Function = util.promisify(crypto.randomBytes);
    const pbkdf2: Function = util.promisify(crypto.pbkdf2);

    const buf: string = (await randomBytes(64)).toString('base64');
    const key: string = (
      await pbkdf2(password, buf, 100000, 64, 'sha512')
    ).toString('base64');

    if (process.env.EXAMINE_PASSWORD) {
      const testKey: string = (
        await pbkdf2(password, buf, 100000, 64, 'sha512')
      ).toString('base64');
      if (testKey !== key) {
        return throwError('암호화 검증에 실패했습니다.', 500);
      }
    }

    const user = new User({
      uid: uid,
      password: key,
      nickname: nickname,
      enckey: buf,
      email: email,
      data: []
    });

    await user.save();

    res.status(201).send(true);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/modify', async (req, res, next) => {
  try {
    res.send('id : ' + req.params.id + ' ||| NOT READY...');
  } catch (e) {
    next(e);
  }
});

router.post('/overlap', async (req, res, next) => {
  try {
    const { type, content } = req.body;

    if (!type || !content) {
      return throwError('필수 항목이 입력되지 않았습니다.', 400);
    }
    const typeArray: Array<String> = ['uid', 'nickname', 'email'];

    if (typeArray.indexOf(type) !== -1) {
      return throwError('입력 값이 잘못되었습니다', 400);
    }

    const query: Object = { [type]: content };

    const user: Object = User.findOne(query);

    let status: number;
    if (user) {
      status = 409;
    } else {
      status = 200;
    }
    res.status(status).json({ overlap: !!user });
  } catch (e) {
    next(e);
  }
});

router.post('/data', async (req, res, next) => {
  const token: any = req.headers['x-access-token'];

  try {
    const tokenValue: any =
      jwt.verify(token, process.env.TOKEN_KEY || 'tokenkey') || JSON.parse('');

    // tslint:disable-next-line: await-promise
    const user: any = await User.findOne({ uid: tokenValue.userId }).select(
      'uid nickname email data'
    );

    console.log(user.uid);

    res.status(200).json(user);
  } catch (e) {
    return throwError('데이터를 읽어오는 데 실패했습니다.', 403);
  }
});

module.exports = router;
