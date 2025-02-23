import { Action } from '@prisma/client';
import express from 'express';
import multer from 'multer';
import announcement from '../controllers/announcement';
import course from '../controllers/course';
import milestone from '../controllers/milestone';
import { hasAuth, hasAuthForCourse } from '../middleware/auth.middleware';
import coursePolicy from '../policies/course.policy';
import projectPolicy from '../policies/project.policy';

const router = express.Router();
const upload = multer({ dest: 'tmp/csv' });

// Get all courses
router.get('/', hasAuth(null, coursePolicy.POLICY_NAME), course.getAll);

// Create course
router.post('/', hasAuth(Action.create_course, coursePolicy.POLICY_NAME), course.create);

// Create course
router.post('/bulk', hasAuth(Action.create_course, coursePolicy.POLICY_NAME), course.bulkCreate);

// Create project and attach or create course
router.post('/project', hasAuth(Action.create_course, null), course.addProjectAndCourse);

// Get milestone
router.get('/:courseId/milestone/:milestoneId', hasAuthForCourse(Action.read_course, null), milestone.get);

// List milestone
router.get('/:courseId/milestone', hasAuthForCourse(Action.read_course, null), milestone.list);

// Create milestone
router.post('/:courseId/milestone', hasAuthForCourse(Action.create_course, null), milestone.create);

// Update milestone
router.put('/:courseId/milestone/:milestoneId', hasAuthForCourse(Action.create_course, null), milestone.update);

// Delete milestone
router.delete('/:courseId/milestone/:milestoneId', hasAuthForCourse(Action.create_course, null), milestone.remove);

// Get announcement
router.get('/:courseId/announcement/:announcementId', hasAuthForCourse(Action.read_course, null), announcement.get);

// List announcement
router.get('/:courseId/announcement', hasAuthForCourse(Action.read_course, null), announcement.list);

// Create announcement
router.post('/:courseId/announcement', hasAuthForCourse(Action.create_course, null), announcement.create);

// Update announcement
router.put(
  '/:courseId/announcement/:announcementId',
  hasAuthForCourse(Action.create_course, null),
  announcement.update,
);

// Delete announcement
router.delete(
  '/:courseId/announcement/:announcementId',
  hasAuthForCourse(Action.create_course, null),
  announcement.remove,
);

// Get course
router.get('/:courseId', hasAuthForCourse(Action.read_course, coursePolicy.POLICY_NAME), course.get);

// Update course
router.put('/:courseId', hasAuthForCourse(Action.update_course, coursePolicy.POLICY_NAME), course.update);

// Delete course
router.delete('/:courseId', hasAuthForCourse(Action.delete_course, coursePolicy.POLICY_NAME), course.remove);

// Get all users of a course
router.get('/:courseId/user', hasAuthForCourse(Action.read_course, coursePolicy.POLICY_NAME), course.getUsers);

// Add a user to a course
router.post('/:courseId/user', hasAuthForCourse(Action.update_course, coursePolicy.POLICY_NAME), course.addUser);

// Remove a user from a course
router.delete('/:courseId/user', hasAuthForCourse(Action.update_course, coursePolicy.POLICY_NAME), course.removeUser);

// Get all projects of a course
router.get('/:courseId/project', hasAuthForCourse(Action.read_course, projectPolicy.POLICY_NAME), course.getProjects);

// Add a project to a course
router.post('/:courseId/project', hasAuthForCourse(Action.update_course, coursePolicy.POLICY_NAME), course.addProject);

// Remove a project from a course
router.delete(
  '/:courseId/project',
  hasAuthForCourse(Action.update_course, coursePolicy.POLICY_NAME),
  course.removeProject,
);

// Import course data via a csv file
router.post(
  '/:courseId/import/csv',
  hasAuthForCourse(Action.update_course, coursePolicy.POLICY_NAME),
  upload.single('file'),
  course.importCsv,
);

// Archive a course by courseId
router.put(
  '/:courseId/archive',
  hasAuthForCourse(Action.update_course, coursePolicy.POLICY_NAME),
  course.archiveCourse,
);

// Unarchive a course by courseId
router.put(
  '/:courseId/unarchive',
  hasAuthForCourse(Action.update_course, coursePolicy.POLICY_NAME),
  course.unarchiveCourse,
);

// Import project assignments via a csv file
router.post(
  '/:courseId/import/projectAssignments',
  hasAuthForCourse(Action.update_course, coursePolicy.POLICY_NAME),
  upload.single('file'),
  course.importProjectAssignments,
);

export default router;
