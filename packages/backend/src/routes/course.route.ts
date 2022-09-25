import { Action } from '@prisma/client';
import express from 'express';
import course from '../controllers/course';
import { isAuthorizedRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Get all courses
router.get('/', isAuthorizedRequest(Action.read_course), course.getAll);

// Create course
router.post('/', isAuthorizedRequest(Action.create_course), course.create);

// Create project and attach or create course
router.post('/project', isAuthorizedRequest(Action.create_course), course.addProjectAndCourse);

// Get course by courseId
router.get('/:courseId', isAuthorizedRequest(Action.read_course), course.get);

// Update course by courseId
router.put('/:courseId', isAuthorizedRequest(Action.update_course), course.update);

// Delete course by courseId
router.delete('/:courseId', isAuthorizedRequest(Action.delete_course), course.remove);

// Get all users of a course
router.get('/:courseId/user', isAuthorizedRequest(Action.read_course), course.getUsers);

// Add a user to a course
router.post('/:courseId/user', isAuthorizedRequest(Action.update_course), course.addUser);

// Remove a user from a course
router.delete('/:courseId/user', isAuthorizedRequest(Action.update_course), course.removeUser);

// Get all projects of a course
router.get('/:courseId/project', isAuthorizedRequest(Action.read_course), course.getProjects);

// Add a project to a course
router.post('/:courseId/project', isAuthorizedRequest(Action.update_course), course.addProject);

// Remove a project from a course
router.delete('/:courseId/project', isAuthorizedRequest(Action.update_course), course.removeProject);

export default router;