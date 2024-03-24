import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { assertInputIsNotEmpty, 
         getErrorMessage,
         assertUserIdIsValid,
         getDefaultErrorRes } 
from '../helpers/error';
import userService from '../services/user.service';

async function getAll(req: express.Request, res: express.Response) {
  try {
    const users = await userService.getAll();
    return res.status(StatusCodes.OK).json(users);
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) });
  }
}

async function create(req: express.Request, res: express.Response) {
  try {
    const { userEmail, newPassword } = req.body;

    assertInputIsNotEmpty<string>(userEmail, 'User Email');
    assertInputIsNotEmpty<string>(newPassword, 'User Password');

    await userService.create(userEmail.toLowerCase(), newPassword);

    return res.status(StatusCodes.OK).json({ message: 'User successfully created' });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) });
  }
}

async function remove(req: express.Request, res: express.Response) {
  try {
    const { userId } = req.params;
    console.log(`userId in controller is: ${userId}`);
    assertUserIdIsValid(userId);
    console.log("userId is valid!");

    const result = await userService.remove(Number(userId));

    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
}

export default {
  getAll,
  create,
  remove,
};
