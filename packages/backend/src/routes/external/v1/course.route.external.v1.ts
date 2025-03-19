import express from 'express';
import { hasAuthForExternalApi } from '../../../middleware/auth.middleware';
import coursePolicy from '../../../policies/course.policy';
import course from '../../../controllers/course';

const router = express.Router();

/**
 * @swagger
 * /v1/course/list:
 *  post:
 *    summary: Get a list of courses
 *    description: Retrieve a list of courses with pagination, filtering, and sorting options.
 *    tags: [Course]
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
 *                description: Filter courses by time category, relative to current year & sem. Archived are considered past.
 *              pageIndex:
 *                type: integer
 *                description: The index of the page to retrieve (optional).
 *                example: 0
 *              pageSize:
 *                type: integer
 *                description: The number of courses per page (optional). Maximum is 100.
 *                example: 10
 *              ids:
 *                type: array
 *                items:
 *                  type: integer
 *                description: List of course IDs to filter (optional).
 *              keyword:
 *                type: string
 *                description: Search term for course name or course code (optional).
 *              sortBy:
 *                type: string
 *                description: Sorting option, either 'year' or 'course'.
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: A paginated list of courses.
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                totalCount:
 *                  type: integer
 *                  description: The total number of courses matching the filters.
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: "#/components/schemas/Course"
 *      401:
 *        description: Unauthorized. API key is missing or invalid.
 *      500:
 *        description: Internal server error.
 */
router.post('/list', hasAuthForExternalApi(null, coursePolicy.POLICY_NAME), course.getAll);

export default router;
