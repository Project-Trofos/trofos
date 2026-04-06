import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { assertInputIsNotEmpty, getErrorMessage } from '../helpers/error';
import userService from '../services/user.service';
import { assertEmailIsValid } from '../helpers/error/assertions';
import { getLogger } from '../logger/loggerProvider';

const logger = getLogger();

async function getAll(req: express.Request, res: express.Response) {
  try {
    const users = await userService.getAll();
    return res.status(StatusCodes.OK).json(users);
  } catch (error) {
    logger.error(error, 'Error getting all users');
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) });
  }
}

async function queryEmail(req: express.Request, res: express.Response) {
  try {
    const { userEmail } = req.params;
    assertEmailIsValid(userEmail);

    const user = await userService.findByEmail(userEmail);
    return res.status(StatusCodes.OK).json({ exists: user != null });
  } catch (error) {
    logger.error(error, 'Error querying user email');
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
    logger.error(error, 'Error creating user');
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) });
  }
}

async function remove(req: express.Request, res: express.Response) {
  try {
    const { id } = req.params;

    assertInputIsNotEmpty<string>(id, 'User ID');

    const userId = parseInt(id, 10);
    await userService.remove(userId);

    return res.status(StatusCodes.OK).json({ message: 'User successfully deleted' });
  } catch (error) {
    logger.error(error, 'Error removing user');
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: getErrorMessage(error) });
  }
}

export default {
  getAll,
  queryEmail,
  create,
  remove,
};
