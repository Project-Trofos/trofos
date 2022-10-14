import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { assertInputIsNotEmpty } from '../helpers/error';
import userService from '../services/user.service';


async function getAll(req: express.Request, res: express.Response) {
    try {
        const users = await userService.getAll();
        return res.status(StatusCodes.OK).json(users);
    } catch (error: any) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
}

async function create(req: express.Request, res: express.Response) {
    try {
        const { userEmail, newPassword } = req.body;

        assertInputIsNotEmpty(userEmail, "User Email");
        assertInputIsNotEmpty(newPassword, "User Password");

        await userService.create(userEmail, newPassword);

        return res.status(StatusCodes.OK).json({ message: "User successfully created"});
    } catch (error: any) {
        console.error(error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message })
    }
}



export default {
    getAll,
    create
}