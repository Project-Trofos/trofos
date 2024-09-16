import express from 'express';
import { hasAuthForExternalApi } from '../../../middleware/auth.middleware';
import coursePolicy from '../../../policies/course.policy';
import course from '../../../controllers/course';

const router = express.Router();

router.get('/', hasAuthForExternalApi(null, coursePolicy.POLICY_NAME), course.getAll);

export default router;
