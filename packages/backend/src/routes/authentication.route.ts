import express from 'express';
import authentication from '../controllers/authentication';
import { isAuthorizedRequest } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/login', authentication.loginUser);

router.post('/logout', authentication.logoutUser);

router.get('/userInfo', isAuthorizedRequest(null), authentication.getUserInfo);


export default router;