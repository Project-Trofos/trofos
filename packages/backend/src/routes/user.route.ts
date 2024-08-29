import express from 'express';
import { Action } from '@prisma/client';
import { hasAuth } from '../middleware/auth.middleware';
import user from '../controllers/user';

const router = express.Router();

// Get all users
router.get('/', hasAuth(Action.read_users, null), user.getAll);

// Query for userEmail
router.get('/:userEmail', user.queryEmail);

router.post('/', hasAuth(Action.create_users, null), user.create);

export default router;
