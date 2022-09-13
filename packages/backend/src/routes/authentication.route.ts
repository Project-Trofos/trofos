import express from "express"
import authentication from '../controllers/authentication';

const router = express.Router();

router.post("/login", authentication.loginUser)

export default router