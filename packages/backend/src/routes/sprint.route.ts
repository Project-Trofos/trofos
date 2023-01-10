import { Action } from '@prisma/client';
import express from 'express';
import sprint from '../controllers/sprint';
import { isAuthorizedRequest } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/newSprint', isAuthorizedRequest(Action.update_project, null), sprint.newSprint);
router.get('/listSprints/:projectId', isAuthorizedRequest(Action.read_project, null), sprint.listSprints);
router.get('/listActiveSprint/:projectId', isAuthorizedRequest(Action.read_project, null), sprint.listActiveSprint);
router.put('/updateSprint', isAuthorizedRequest(Action.update_project, null), sprint.updateSprint);
router.delete('/deleteSprint/:sprintId', isAuthorizedRequest(Action.update_project, null), sprint.deleteSprint);

export default router;
