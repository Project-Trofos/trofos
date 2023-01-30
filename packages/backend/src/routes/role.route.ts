import express from 'express';
import { Action } from '@prisma/client';
import { hasAuth, hasAuthForCourse, hasAuthForProject } from '../middleware/auth.middleware';
import role from '../controllers/role';

const router = express.Router();

router.get('/', isAuthorizedRequest(null, null), role.getAllRoles);

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

// Get users and their role for a specific course
router.get('/courseUserRoles/:courseId', hasAuthForCourse(Action.read_course, null), role.getUserRolesForCourse);

// Get users and their role for a specific project
router.get('/projectUserRoles/:projectId', hasAuthForProject(Action.read_project, null), role.getUserRolesForProject);

// Update user role for a specific course
router.post('/courseUserRoles/:courseId', hasAuthForCourse(Action.update_course, null), role.updateUserRoleForCourse);

// Update user role for a specific project
router.post(
  '/projectUserRoles/:projectId',
  hasAuthForProject(Action.update_course, null),
  role.updateUserRoleForProject,
);

// Update user role
router.post('/userRole', isAuthorizedRequest(Action.admin, null), role.updateUserRole);

export default router;
