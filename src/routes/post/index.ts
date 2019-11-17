import express from 'express';
import throwError from '../../lib/throwError';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import User, { UserDocument } from '../../lib/models/User';
import Post, { PostDocument } from '../../lib/models/Post';

const router = express.Router();

router.use(bodyParser.json());

router.get('/user/:postid', async (req, res, next) => {
  try {
    const postId: any = req.params.postid || undefined;

    if (!postId) {
      return throwError('필수 항목이 입력되지 않았습니다.', 500);
    }

    let post;

    try {
      // tslint:disable-next-line: await-promise
      post = await Post.findOne({ _id: postId });
    } catch (e) {
      return throwError('게시글이 존재하지 않습니다.', 404);
    }
    if (post === null) {
      return throwError('게시글이 존재하지 않습니다.', 404);
    }

    res.status(200).json(post);
  } catch (e) {
    next(e);
  }
});

router.get('/user', async (req, res, next) => {
  const token: any = req.headers['x-access-token'];
  const limit: number = parseInt(req.query.limit) || 10;
  const skip: number = parseInt(req.query.skip) || 0;

  try {
    let userInfo: any;
    try {
      userInfo =
        jwt.verify(token, process.env.TOKEN_KEY || 'tokenkey') ||
        JSON.parse('');
    } catch (e) {
      return throwError('토큰 검증에 실패했습니다', 403);
    }

    // tslint:disable-next-line: await-promise
    const post: any = await Post.find()
      .where('user')
      .equals(userInfo.userId)
      .sort(' -date')
      .skip(skip)
      .limit(limit);

    if (!post.toString()) {
      return throwError('데이터가 존재하지 않습니다.', 404);
    }
    res.status(200).json(post);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, data, hashtags } = req.body;
    const token: any = req.headers['x-access-token'];
    if (!title || !data || !token || !hashtags) {
      return throwError('필수 항목이 입력되지 않았습니다.', 500);
    }

    let user: any;
    try {
      user = jwt.verify(token, process.env.TOKEN_KEY || 'tokenkey');
    } catch (e) {
      return throwError('토큰 검증에 실패했습니다.', 403);
    }

    const post = new Post({
      title,
      data,
      user: user.userId,
      hashtags,
      date: Date.now()
    });

    await post.save();

    res.status(201).send(true);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
