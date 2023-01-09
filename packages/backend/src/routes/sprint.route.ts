import { Action } from '@prisma/client';
import express from 'express';
import sprint from '../controllers/sprint';
import { hasAuth } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/newSprint', hasAuth(Action.update_project, null), sprint.newSprint);
router.get('/listSprints/:projectId', hasAuth(Action.read_project, null), sprint.listSprints);
router.put('/updateSprint', hasAuth(Action.update_project, null), sprint.updateSprint);
router.delete('/deleteSprint/:sprintId', hasAuth(Action.update_project, null), sprint.deleteSprint);

export default router;
