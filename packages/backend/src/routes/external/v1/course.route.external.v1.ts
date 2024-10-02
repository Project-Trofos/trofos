import express from 'express';
import { hasAuthForExternalApi } from '../../../middleware/auth.middleware';
import coursePolicy from '../../../policies/course.policy';
import course from '../../../controllers/course';

const router = express.Router();

/**
 * @swagger
 * /v1/course:
 *  get:
 *    description: Get all courses
 *    tags: [Course]
 *    security:
 *      - ApiKeyAuth: []
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: A list of courses
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: "#/components/schemas/Course"
 *      401:
 *        description: Unauthorized
 *      500:
 *        description: Internal server error
 */
router.get('/', hasAuthForExternalApi(null, coursePolicy.POLICY_NAME), course.getAll);

export default router;
