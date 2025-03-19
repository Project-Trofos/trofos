import express from 'express';
import { hasAuthForExternalApi, hasAuthForProjectExternalApi } from '../../../middleware/auth.middleware';
import projectPolicy from '../../../policies/project.policy';
import project from '../../../controllers/project';
import { Action } from '@prisma/client';
import sprint from '../../../controllers/sprint';

const router = express.Router();

/**
 * @swagger
 * /v1/project:
 *  post:
 *    summary: Get all projects applicable to the owner of the API key
 *    description: Retrieve a list of projects with pagination, filtering, and sorting options.
 *    tags: [Project]
 *    security:
 *      - ApiKeyAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              option:
 *                type: string
 *                enum: [all, past, current, future]
 *                description: Filter courses by time category, relative to current year & sem. Archived projects, or projects with archived courses are considered past.
 *              pageIndex:
 *                type: integer
 *                description: The index of the page to retrieve (optional).
 *                example: 0
 *              pageSize:
 *                type: integer
 *                description: The number of projects per page (optional). Maximum is 100.
 *                example: 10
 *              ids:
 *                type: array
 *                items:
 *                  type: integer
 *                description: List of project IDs to filter (optional).
 *              keyword:
 *                type: string
 *                description: Search term for project name or description (optional).
 *              sortBy:
 *                type: string
 *                description: Sorting option (e.g., project name or year).
 *              course_id:
 *                type: integer
 *                description: Filter projects by a specific course ID (optional). No limit of number of projects returned if this is provided.
 *                example: 5
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: Gets all projects for user that they have permissions for.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                totalCount:
 *                  type: integer
 *                  description: The total number of projects matching the filters.
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: "#/components/schemas/Project"
 *      401:
 *        description: Unauthorized. API key is missing or invalid.
 *      500:
 *        description: Internal server error.
 */
router.post('/list', hasAuthForExternalApi(Action.read_project, projectPolicy.POLICY_NAME), project.getAll);

/**
 * @swagger
 * /v1/project/{projectId}:
 *  get:
 *    description: Get project by project id
 *    tags: [Project]
 *    produces:
 *      - application/json
 *    parameters:
 *      - in: path
 *        name: projectId
 *        required: true
 *        schema:
 *          type: integer
 *        description: ID of the project to retrieve
 *    responses:
 *      200:
 *        description: Gets project details by project id
 *        content:
 *          application/json:
 *            schema:
 *              $ref: "#/components/schemas/Project"
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Internal server error
 */
router.get('/:projectId', hasAuthForProjectExternalApi(Action.read_project, projectPolicy.POLICY_NAME), project.get);

/**
 * @swagger
 * /v1/project/{projectId}/sprint:
 *  get:
 *    description: Get all backlogs for a project, sorted by sprint. Also gets unassigned backlogs
 *    tags: [Project]
 *    parameters:
 *      - in: path
 *        name: projectId
 *        required: true
 *        schema:
 *          type: integer
 *        description: ID of the project to retrieve sprints for
 *    responses:
 *      200:
 *        description: Gets all sprints and unassigned backlogs for a project
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                sprints:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Sprint'
 *                unassignedBacklogs:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Backlog'
 *        examples:
 *          application/json:
 *            value:
 *              sprints: []
 *              unassignedBacklogs: []
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Internal server error
 */
router.get('/:projectId/sprint', hasAuthForProjectExternalApi(Action.read_project, null), sprint.listSprintsByProjectId)

export default router;
