import express from 'express';
import project from '../controllers/project';


const router = express.Router();

// Get all projects
router.get('/', project.getAll);

// Create project
router.post('/', project.create);

// Get project by projectId
router.get('/:projectId', project.get);

// Update project by projectId
router.put('/:projectId', project.update);

// Delete project by projectId
router.delete('/:projectId', project.remove);

// Get all users of a project
router.get('/:projectId/user', project.getUsers);

// Add a user to a project
router.post('/:projectId/user', project.addUser);

// Remove a user from a project
router.delete('/:projectId/user', project.removeUser);


export default router;