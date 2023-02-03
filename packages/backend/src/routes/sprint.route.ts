import { Action } from '@prisma/client';
import express from 'express';
import sprint from '../controllers/sprint';
import { hasAuth } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/newSprint', hasAuth(Action.update_project, null), sprint.newSprint);
router.get('/listSprints/:projectId', hasAuth(Action.read_project, null), sprint.listSprints);
router.get('/listActiveSprint/:projectId', hasAuth(Action.read_project, null), sprint.listActiveSprint);
router.put('/updateSprint', hasAuth(Action.update_project, null), sprint.updateSprint);
router.delete('/deleteSprint/:sprintId', hasAuth(Action.update_project, null), sprint.deleteSprint);

// Routes for retrospective
router.post('/addRetrospective', hasAuth(Action.update_project, null), sprint.addRetrospective);
router.get('/getRetrospectives/:sprintId', hasAuth(Action.read_project, null), sprint.getRetrospectives);

router.post('/addRetrospectiveVote', hasAuth(Action.update_project, null), sprint.addRetrospectiveVote);
router.put('/updateRetrospectiveVote', hasAuth(Action.update_project, null), sprint.updateRetrospectiveVote);
router.delete('/deleteRetrospectiveVote/:retroId', hasAuth(Action.update_project, null), sprint.deleteRetrospectiveVote);

export default router;
