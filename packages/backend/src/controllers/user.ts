import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { assertInputIsNotEmpty, getErrorMessage } from '../helpers/error';
import userService from '../services/user.service';
import { assertEmailIsValid } from '../helpers/error/assertions';

async function getAll(req: express.Request, res: express.Response) {
  try {
    const users = await userService.getAll();
    return res.status(StatusCodes.OK).json(users);
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) });
  }
}

async function queryEmail(req: express.Request, res: express.Response) {
  try {
    const { userEmail } = req.params;
    assertEmailIsValid(userEmail);
    const user = await userService.getByEmail(userEmail);
    return res.status(StatusCodes.OK).json(user);
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

export default {
  getAll,
  queryEmail,
  create,
};
