import express from 'express';
import course from '../controllers/course';

const router = express.Router();

// Get all courses
router.get('/', course.getAll);

// Create course
router.post('/', course.create);

// Get course by courseId
router.get('/:courseId', course.get);

// Update course by courseId
router.put('/:courseId', course.update);

// Delete course by courseId
router.delete('/:courseId', course.remove);

// Get all users of a course
router.get('/:courseId/user', course.getUsers);

// Add a user to a course
router.post('/:courseId/user', course.addUser);

// Remove a user from a course
router.delete('/:courseId/user', course.removeUser);

// Get all projects of a course
router.get('/:courseId/project', course.getProjects);

// Add a user to a course
router.post('/:courseId/project', course.addProject);

// Remove a user from a course
router.delete('/:courseId/project', course.removeProject);

export default router;