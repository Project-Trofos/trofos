import express from 'express';
import { hasAuthForExternalApi, hasAuthForProjectExternalApi } from '../../../middleware/auth.middleware';
import projectPolicy from '../../../policies/project.policy';
import project from '../../../controllers/project';
import { Action } from '@prisma/client';

const router = express.Router();

/**
 * @swagger
 * /v1/project:
 *  get:
 *    description: Get all projects applicable to the owner of the API key
 *    tags: [Project]
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: Gets all projects for user that he has permissions for
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              $ref: "#/components/schemas/Project"
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Internal server error
 */
router.get('/', hasAuthForExternalApi(Action.read_project, projectPolicy.POLICY_NAME), project.getAll);

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

export default router;
