import express from 'express';
import { Action } from '@prisma/client';
import project from '../controllers/project';
import { isAuthorizedRequest } from '../middleware/auth.middleware';
import projectPolicy from '../policies/project.policy';

const router = express.Router();

// Get all projects
router.get('/', isAuthorizedRequest(Action.read_project, projectPolicy.POLICY_NAME), project.getAll);

// Create project
router.post('/', isAuthorizedRequest(Action.create_project, null), project.create);

// Get project by projectId
router.get('/:projectId', isAuthorizedRequest(Action.read_project, projectPolicy.POLICY_NAME), project.get);

// Update project by projectId
router.put('/:projectId', isAuthorizedRequest(Action.update_project, projectPolicy.POLICY_NAME), project.update);

// Delete project by projectId
router.delete('/:projectId', isAuthorizedRequest(Action.delete_project, projectPolicy.POLICY_NAME), project.remove);

// Get all users of a project
router.get('/:projectId/user', isAuthorizedRequest(Action.read_project, projectPolicy.POLICY_NAME), project.getUsers);

// Add a user to a project
router.post('/:projectId/user', isAuthorizedRequest(Action.update_project, projectPolicy.POLICY_NAME), project.addUser);

// Remove a user from a project
router.delete(
  '/:projectId/user',
  isAuthorizedRequest(Action.update_project, projectPolicy.POLICY_NAME),
  project.removeUser,
);

// Get backlog statuses by projectId
router.get(
  '/:projectId/backlogStatus',
  isAuthorizedRequest(Action.read_project, projectPolicy.POLICY_NAME),
  project.getBacklogStatus,
);

// Create backlog status by projectId
router.post(
  '/:projectId/backlogStatus',
  isAuthorizedRequest(Action.update_project, projectPolicy.POLICY_NAME),
  project.createBacklogStatus,
);

// Update backlog status by projectId
router.put(
  '/:projectId/backlogStatus',
  isAuthorizedRequest(Action.update_project, projectPolicy.POLICY_NAME),
  project.updateBacklogStatus,
);

// Delete backlog status by projectId
router.delete(
  '/:projectId/backlogStatus',
  isAuthorizedRequest(Action.update_project, projectPolicy.POLICY_NAME),
  project.deleteBacklogStatus,
);

export default router;
