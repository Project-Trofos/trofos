import { User } from '@prisma/client';

export type UserAuth =
  | {
      isValidUser: false;
    }
  | {
      isValidUser: true;
      userLoginInformation: User;
    };
