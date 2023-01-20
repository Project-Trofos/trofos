import express from 'express';
import { Action } from '@prisma/client';
import { isAuthorizedRequest } from '../middleware/auth.middleware';
import role from '../controllers/role';

const router = express.Router();

router.get('/', isAuthorizedRequest(null, null), role.getAllRoles);

// Get all actions
router.get('/actions', isAuthorizedRequest(null, null), role.getAllActions);

// Get role and their actions
router.get('/actionsOnRoles', isAuthorizedRequest(null, null), role.getRoleActions);

// Add action to role
router.post('/actionsOnRoles', isAuthorizedRequest(Action.admin, null), role.addActionToRole);

// Remove action from role
router.delete('/actionsOnRoles', isAuthorizedRequest(Action.admin, null), role.removeActionFromRole);

// Update user role
router.post('/userRole', isAuthorizedRequest(Action.admin, null), role.updateUserRole);

export default router;
