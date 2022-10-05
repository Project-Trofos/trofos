import express from 'express';
import { Action } from '@prisma/client';
import project from '../controllers/project';
import { isAuthorizedRequest } from '../middleware/auth.middleware';
import policyProject from '../policies/policyProject';

const router = express.Router();

// Get all projects
router.get('/', isAuthorizedRequest(Action.read_project, policyProject.POLICY_NAME), project.getAll);

// Create project
router.post('/', isAuthorizedRequest(Action.create_project, null), project.create);

// Get project by projectId
router.get('/:projectId', isAuthorizedRequest(Action.read_project, policyProject.POLICY_NAME), project.get);

// Update project by projectId
router.put('/:projectId', isAuthorizedRequest(Action.update_project, policyProject.POLICY_NAME), project.update);

// Delete project by projectId
router.delete('/:projectId', isAuthorizedRequest(Action.delete_project, policyProject.POLICY_NAME), project.remove);

// Get all users of a project
router.get('/:projectId/user', isAuthorizedRequest(Action.read_project, policyProject.POLICY_NAME), project.getUsers);

// Add a user to a project
router.post('/:projectId/user', isAuthorizedRequest(Action.update_project, policyProject.POLICY_NAME), project.addUser);

// Remove a user from a project
router.delete('/:projectId/user', isAuthorizedRequest(Action.update_project, policyProject.POLICY_NAME), project.removeUser);


export default router;