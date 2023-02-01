import express from 'express';
import { Action } from '@prisma/client';
import project from '../controllers/project';
import { hasAuth, hasAuthForProject } from '../middleware/auth.middleware';
import projectPolicy from '../policies/project.policy';

const router = express.Router();

// Get all projects
router.get('/', hasAuth(Action.read_project, projectPolicy.POLICY_NAME), project.getAll);

// Create project
router.post('/', hasAuth(Action.create_project, null), project.create);

// Get project by projectId
router.get('/:projectId', hasAuthForProject(Action.read_project, projectPolicy.POLICY_NAME), project.get);

// Update project by projectId
router.put('/:projectId', hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME), project.update);

// Delete project by projectId
router.delete('/:projectId', hasAuthForProject(Action.delete_project, projectPolicy.POLICY_NAME), project.remove);

// Get all users of a project
router.get('/:projectId/user', hasAuthForProject(Action.read_project, projectPolicy.POLICY_NAME), project.getUsers);

// Add a user to a project
router.post('/:projectId/user', hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME), project.addUser);

// Remove a user from a project
router.delete(
  '/:projectId/user',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  project.removeUser,
);

// Get backlog statuses by projectId
router.get(
  '/:projectId/backlogStatus',
  hasAuthForProject(Action.read_project, projectPolicy.POLICY_NAME),
  project.getBacklogStatus,
);

// Create backlog status by projectId
router.post(
  '/:projectId/backlogStatus',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  project.createBacklogStatus,
);

// Update backlog status by projectId
router.put(
  '/:projectId/backlogStatus',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  project.updateBacklogStatus,
);

// Delete backlog status by projectId
router.delete(
  '/:projectId/backlogStatus',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  project.deleteBacklogStatus,
);

// Get git url by projectId
router.get(
  '/:projectId/gitLink',
  isAuthorizedRequest(Action.read_project, projectPolicy.POLICY_NAME),
  project.getGitLink,
);

// Add git url by projectId
router.post(
  '/:projectId/gitLink',
  isAuthorizedRequest(Action.update_project, projectPolicy.POLICY_NAME),
  project.addGitLink,
);

// Update git url by projectId
router.put(
  '/:projectId/gitLink',
  isAuthorizedRequest(Action.update_project, projectPolicy.POLICY_NAME),
  project.updateGitLink,
);

// Delete git url by projectId
router.delete(
  '/:projectId/gitLink',
  isAuthorizedRequest(Action.update_project, projectPolicy.POLICY_NAME),
  project.deleteGitLink,
);

export default router;
