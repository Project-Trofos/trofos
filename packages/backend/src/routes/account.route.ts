import express from 'express';
import multer from 'multer';
import account from '../controllers/account';
import { hasAuth } from '../middleware/auth.middleware';
import userPolicy from '../policies/user.policy';
import { checkFeatureFlag } from '../middleware/feature_flag.middleware';
import { Feature } from '@prisma/client';

const router = express.Router();
const upload = multer();

router.post('/register', account.register);

router.post('/login', account.loginUser);

router.post('/login/oauth2', account.oauth2Login);

router.post('/logout', hasAuth(null, null), account.logoutUser);

router.get('/userInfo', hasAuth(null, null), account.getUserInfo);

router.post('/changePassword', hasAuth(null, userPolicy.POLICY_NAME), account.changePassword);

router.post('/updateUser', hasAuth(null, userPolicy.POLICY_NAME), account.updateUser);

router.post('/generateSAMLReq/student', checkFeatureFlag(Feature.sso_login), account.generateSAMLRequest);

router.post('/generateSAMLReq/staff', checkFeatureFlag(Feature.sso_login), account.generateSAMLRequestStaff);

router.post('/callback/saml', checkFeatureFlag(Feature.sso_login), upload.none(), account.processSAMLResponse);

export default router;
