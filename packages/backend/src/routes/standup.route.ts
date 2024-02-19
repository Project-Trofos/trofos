import { Action, StandUpNote } from '@prisma/client';
import express from 'express';
import standUp from '../controllers/standup';
import { hasAuthForProject } from '../middleware/auth.middleware';
import projectPolicy from '../policies/project.policy';

const router = express.Router();

// Create a stand up
router.post(
  '/createStandUp',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  standUp.createStandUp,
);

// Get all stand ups of a project
router.get('/:projectId', hasAuthForProject(Action.read_project, projectPolicy.POLICY_NAME), standUp.getStandUps);

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
  standUp.getStandUpNotes,
);
router.delete(
  '/deleteStandUpNote/:noteId',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  standUp.deleteStandUpNote,
);

export default router;
