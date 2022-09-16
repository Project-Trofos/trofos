import express from 'express';
import authentication from '../controllers/authentication';

const router = express.Router();

router.post('/login', authentication.loginUser);

router.post('/logout', authentication.logoutUser);

router.get('/userInfo', authentication.getUserInfo);


export default router;