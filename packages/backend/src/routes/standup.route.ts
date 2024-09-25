import { Action } from '@prisma/client';
import express from 'express';
import standUp from '../controllers/standup';
import { hasAuthForProject } from '../middleware/auth.middleware';
import projectPolicy from '../policies/project.policy';

// Get projectId from parent route
const router = express.Router({ mergeParams: true});

// Create a stand up
router.post(
  '/createStandUp',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  standUp.createStandUp,
);

// Get all stand ups of a project
router.get('/', hasAuthForProject(Action.read_project, projectPolicy.POLICY_NAME), standUp.getStandUpHeaders);

// Update stand up
router.put(
  '/updateStandUp',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  standUp.updateStandUp,
);

// Delete stand up
router.delete(
  '/deleteStandUp/:standUpId',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  standUp.deleteStandUp,
);

router.post('/createNote', hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME), standUp.addStandUpNote);

router.get(
  '/getNotes/:standUpId',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  standUp.getStandUp,
);
router.get(
  '/getAllNotes',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  standUp.getStandUps,
);
router.delete(
  '/deleteStandUpNote/:noteId',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  standUp.deleteStandUpNote,
);

export default router;
