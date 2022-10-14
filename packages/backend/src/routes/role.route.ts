import express from 'express';
import { isAuthorizedRequest } from '../middleware/auth.middleware';
import role from '../controllers/role';

const router = express.Router();

// Get all actions
router.get('/actions', isAuthorizedRequest(null, null), role.getAllActions);

// Get role and their actions
router.get('/actionsOnRoles', isAuthorizedRequest(null, null), role.getRoleActions);

// Add action to role
router.post('/actionsOnRoles', isAuthorizedRequest(null, null), role.addActionToRole);

// Remove action from role
router.delete('/actionsOnRoles', isAuthorizedRequest(null, null), role.removeActionFromRole);

export default router;