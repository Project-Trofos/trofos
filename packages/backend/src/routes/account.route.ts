import express from 'express';
import account from '../controllers/account';
import { isAuthorizedRequest } from '../middleware/auth.middleware';
import userPolicy from '../policies/user.policy';

const router = express.Router();

router.post('/login', account.loginUser);

router.post('/logout', account.logoutUser);

router.get('/userInfo', isAuthorizedRequest(null, null), account.getUserInfo);

router.post('/changePassword', isAuthorizedRequest(null, userPolicy.POLICY_NAME), account.changePassword);


export default router;