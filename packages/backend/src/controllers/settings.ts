import { Settings } from '@prisma/client';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import { getDefaultErrorRes } from '../helpers/error';
import settingsService from '../services/settings.service';

const getSettings = async (req: express.Request, res: express.Response) => {
  try {
    const settings: Settings = await settingsService.get();
    return res.status(StatusCodes.OK).json(settings);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

const updateSettings = async (req: express.Request, res: express.Response) => {
  try {
    const { settings } = req.body;
    const updatedSettings: Settings = await settingsService.update(settings);
    return res.status(StatusCodes.OK).json(updatedSettings);
  } catch (error) {
    return getDefaultErrorRes(error, res);
  }
};

export default {
  getSettings,
  updateSettings,
};
