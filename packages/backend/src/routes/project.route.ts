import express from 'express';
import { Action } from '@prisma/client';
import project from '../controllers/project';
import { hasAuth, hasAuthForProject } from '../middleware/auth.middleware';
import projectPolicy from '../policies/project.policy';
import feedbackPolicy from '../policies/feedback.policy';
import feedback from '../controllers/feedback';
import standupRouter from './standup.route';
import projectAssignment from '../controllers/projectAssignment';
import issue from '../controllers/issue';

const router = express.Router();

router.use('/:projectId/standup', standupRouter);

// Get all projects
router.post('/list', hasAuth(Action.read_project, projectPolicy.POLICY_NAME), project.getAll);

// Create project
router.post('/', hasAuth(Action.create_project, null), project.create);

// Get project by projectId
router.get('/:projectId', hasAuthForProject(Action.read_project, projectPolicy.POLICY_NAME), project.get);

// Update project by projectId
router.put('/:projectId', hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME), project.update);

// Delete project by projectId
router.delete('/:projectId', hasAuthForProject(Action.delete_project, projectPolicy.POLICY_NAME), project.remove);

// Get all users of a project
router.get('/:projectId/user', hasAuthForProject(Action.read_project, projectPolicy.POLICY_NAME), project.getUsers);

// Add a user to a project
router.post('/:projectId/user', hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME), project.addUser);

// Remove a user from a project
router.delete(
  '/:projectId/user',
  hasAuthForProject(Action.update_project_users, projectPolicy.POLICY_NAME),
  project.removeUser,
);

// Get backlog statuses by projectId
router.get(
  '/:projectId/backlogStatus',
  hasAuthForProject(Action.read_project, projectPolicy.POLICY_NAME),
  project.getBacklogStatus,
);

// Create backlog status by projectId
router.post(
  '/:projectId/backlogStatus',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  project.createBacklogStatus,
);

// Update backlog status by projectId
router.put(
  '/:projectId/backlogStatus',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  project.updateBacklogStatus,
);

// Delete backlog status by projectId
router.delete(
  '/:projectId/backlogStatus',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  project.deleteBacklogStatus,
);

// Get git url by projectId
router.get(
  '/:projectId/gitLink',
  hasAuthForProject(Action.read_project, projectPolicy.POLICY_NAME),
  project.getGitLink,
);

// Add git url by projectId
router.post(
  '/:projectId/gitLink',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  project.addGitLink,
);

// Update git url by projectId
router.put(
  '/:projectId/gitLink',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  project.updateGitLink,
);

// Archive a project by projectId
router.put(
  '/:projectId/archive',
  hasAuthForProject(Action.archive_project, projectPolicy.POLICY_NAME),
  project.archiveProject,
);

// Unarchive a project by projectId
router.put(
  '/:projectId/unarchive',
  hasAuthForProject(Action.archive_project, projectPolicy.POLICY_NAME),
  project.unarchiveProject,
);

// Delete git url by projectId
router.delete(
  '/:projectId/gitLink',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  project.deleteGitLink,
);

// Routes for getting and updating user settings for projects
router.get(
  '/:projectId/user/settings',
  hasAuthForProject(Action.read_project, projectPolicy.POLICY_NAME),
  project.getUserSettings,
);

router.put(
  '/:projectId/user/settings',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  project.updateUserSettings,
);

// Get all feedbacks of a sprint of a project
router.get(
  `/:projectId/feedback/sprint/:sprintId`,
  hasAuthForProject(Action.read_feedback, feedbackPolicy.POLICY_NAME),
  feedback.listBySprintId,
);

// Create feedbacks of a sprint of a project
router.post(
  `/:projectId/feedback/`,
  hasAuthForProject(Action.create_feedback, feedbackPolicy.POLICY_NAME),
  feedback.create,
);

// Update feedbacks of a sprint of a project
router.put(
  `/:projectId/feedback/:feedbackId`,
  hasAuthForProject(Action.update_feedback, feedbackPolicy.POLICY_NAME),
  feedback.update,
);

// Delete feedbacks of a sprint of a project
router.delete(
  `/:projectId/feedback/:feedbackId`,
  hasAuthForProject(Action.delete_feedback, feedbackPolicy.POLICY_NAME),
  feedback.remove,
);

// Set the telegram id for notifications for a project
router.put(
  `/:projectId/telegramId`,
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  project.setTelegramId,
);

// Assigned project routes
router.post(
  '/:projectId/assignedProject',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  projectAssignment.create,
);

router.delete(
  '/:projectId/assignedProject/:projectAssignmentId',
  hasAuthForProject(Action.update_project, projectPolicy.POLICY_NAME),
  projectAssignment.remove,
);

router.get(
  '/:projectId/assignedProject',
  hasAuthForProject(Action.read_project, projectPolicy.POLICY_NAME),
  projectAssignment.getAssignedProjects,
);

// Issues
router.get(
  '/:projectId/assignedIssues',
  hasAuthForProject(Action.read_project, projectPolicy.POLICY_NAME),
  issue.getAssignedIssuesByProjectId,
);

router.get(
  '/:projectId/reportedIssues',
  hasAuthForProject(Action.read_project, projectPolicy.POLICY_NAME),
  issue.getReportedIssuesByProjectId,
);

export default router;
