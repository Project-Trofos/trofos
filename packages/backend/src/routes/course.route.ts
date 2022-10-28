import { Action } from '@prisma/client';
import express from 'express';
import course from '../controllers/course';
import { isAuthorizedRequest } from '../middleware/auth.middleware';
import coursePolicy from '../policies/course.policy';
import projectPolicy from '../policies/project.policy';

const router = express.Router();

// Get all courses
router.get('/', isAuthorizedRequest(Action.read_course, coursePolicy.POLICY_NAME), course.getAll);

// Create course
router.post('/', isAuthorizedRequest(Action.create_course, coursePolicy.POLICY_NAME), course.create);

// Create course
router.post('/bulk', isAuthorizedRequest(Action.create_course, coursePolicy.POLICY_NAME), course.bulkCreate);

// Create project and attach or create course
router.post('/project', isAuthorizedRequest(Action.create_course, null), course.addProjectAndCourse);

// Get course
router.get(
  '/:courseYear/:courseSem/:courseId',
  isAuthorizedRequest(Action.read_course, coursePolicy.POLICY_NAME),
  course.get,
);

// Update course
router.put(
  '/:courseYear/:courseSem/:courseId',
  isAuthorizedRequest(Action.update_course, coursePolicy.POLICY_NAME),
  course.update,
);

// Delete course
router.delete(
  '/:courseYear/:courseSem/:courseId',
  isAuthorizedRequest(Action.delete_course, coursePolicy.POLICY_NAME),
  course.remove,
);

// Get all users of a course
router.get(
  '/:courseYear/:courseSem/:courseId/user',
  isAuthorizedRequest(Action.read_course, coursePolicy.POLICY_NAME),
  course.getUsers,
);

// Add a user to a course
router.post(
  '/:courseYear/:courseSem/:courseId/user',
  isAuthorizedRequest(Action.update_course, coursePolicy.POLICY_NAME),
  course.addUser,
);

// Remove a user from a course
router.delete(
  '/:courseYear/:courseSem/:courseId/user',
  isAuthorizedRequest(Action.update_course, coursePolicy.POLICY_NAME),
  course.removeUser,
);

// Get all projects of a course
router.get(
  '/:courseYear/:courseSem/:courseId/project',
  isAuthorizedRequest(Action.read_course, projectPolicy.POLICY_NAME),
  course.getProjects,
);

// Add a project to a course
router.post(
  '/:courseYear/:courseSem/:courseId/project',
  isAuthorizedRequest(Action.update_course, coursePolicy.POLICY_NAME),
  course.addProject,
);

// Remove a project from a course
router.delete(
  '/:courseYear/:courseSem/:courseId/project',
  isAuthorizedRequest(Action.update_course, coursePolicy.POLICY_NAME),
  course.removeProject,
);

export default router;
