import express from 'express';
import { Action } from '@prisma/client';
import project from '../controllers/project';
import { isAuthorizedRequest } from '../middleware/auth.middleware';


const router = express.Router();

// Get all projects
router.get('/', isAuthorizedRequest(Action.read_project), project.getAll);

// Create project
router.post('/', isAuthorizedRequest(Action.create_project), project.create);

// Get project by projectId
router.get('/:projectId', isAuthorizedRequest(Action.read_project), project.get);

// Update project by projectId
router.put('/:projectId', isAuthorizedRequest(Action.update_project), project.update);

// Delete project by projectId
router.delete('/:projectId', isAuthorizedRequest(Action.delete_project), project.remove);

// Get all users of a project
router.get('/:projectId/user', isAuthorizedRequest(Action.read_project), project.getUsers);

// Add a user to a project
router.post('/:projectId/user', isAuthorizedRequest(Action.update_project), project.addUser);

// Remove a user from a project
router.delete('/:projectId/user', isAuthorizedRequest(Action.update_project), project.removeUser);


export default router;