import express from 'express';
import { Action } from '@prisma/client';
import { hasAuth } from '../middleware/auth.middleware';
import user from '../controllers/user';

const router = express.Router();

// Get all users
router.get('/', hasAuth(Action.read_users, null), user.getAll);

// Query for userEmail
router.get('/:userEmail', hasAuth(Action.read_users, null), user.queryEmail);

// Create a user
router.post('/', hasAuth(Action.create_users, null), user.create);

// Delete a user (New Route)
router.delete('/:id', hasAuth(Action.admin, null), user.remove);

export default router;
