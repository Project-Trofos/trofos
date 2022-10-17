import express from 'express'
import { Action } from '@prisma/client'
import { isAuthorizedRequest } from '../middleware/auth.middleware';
import user from '../controllers/user';

const router = express.Router();

// Get all users
router.get('/', isAuthorizedRequest(Action.read_users, null), user.getAll);

router.post('/', isAuthorizedRequest(Action.create_users, null), user.create);

export default router;