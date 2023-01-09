import express from 'express';
import { Action } from '@prisma/client';
import { hasAuth } from '../middleware/auth.middleware';
import role from '../controllers/role';

const router = express.Router();

// Get all actions
router.get('/actions', hasAuth(null, null), role.getAllActions);

// Get role and their actions
router.get('/actionsOnRoles', hasAuth(null, null), role.getRoleActions);

// Add action to role
router.post('/actionsOnRoles', hasAuth(Action.admin, null), role.addActionToRole);

// Remove action from role
router.delete('/actionsOnRoles', hasAuth(Action.admin, null), role.removeActionFromRole);

// Get role and their actions for a specific course
router.get('/userCourseRoles', hasAuth(null, null), role.getUserRoleActionsForCourse);

// Get role and their actions for a specific project
router.get('/userProjectRoles', hasAuth(null, null), role.getUserRoleActionsForProject);

export default router;
