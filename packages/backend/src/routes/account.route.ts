import express from 'express';
import account from '../controllers/account';
import { isAuthorizedRequest } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/login', account.loginUser);

router.post('/logout', account.logoutUser);

router.get('/userInfo', isAuthorizedRequest(null, null), account.getUserInfo);


export default router;