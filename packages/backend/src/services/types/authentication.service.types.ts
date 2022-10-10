import { User } from '@prisma/client';

export type UserAuth = {
  isValidUser: boolean;
  userLoginInformation?: User;
};
