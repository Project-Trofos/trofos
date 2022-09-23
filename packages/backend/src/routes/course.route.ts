import express from 'express';
import course from '../controllers/course';

const router = express.Router();

// Get all courses
router.get('/', course.getAll);

// Create course
router.post('/', course.create);

// Create project and attach or create course
router.post('/project', course.addProjectAndCourse);

// Get course
router.get('/:courseYear/:courseSem/:courseId', course.get);

// Update course
router.put('/:courseYear/:courseSem/:courseId', course.update);

// Delete course
router.delete('/:courseYear/:courseSem/:courseId', course.remove);

// Get all users of a course
router.get('/:courseYear/:courseSem/:courseId/user', course.getUsers);

// Add a user to a course
router.post('/:courseYear/:courseSem/:courseId/user', course.addUser);

// Remove a user from a course
router.delete('/:courseYear/:courseSem/:courseId/user', course.removeUser);

// Get all projects of a course
router.get('/:courseYear/:courseSem/:courseId/project', course.getProjects);

// Add a user to a course
router.post('/:courseYear/:courseSem/:courseId/project', course.addProject);

// Remove a user from a course
router.delete('/:courseYear/:courseSem/:courseId/project', course.removeProject);

export default router;
