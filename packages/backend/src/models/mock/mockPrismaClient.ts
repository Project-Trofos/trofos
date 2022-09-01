import { PrismaClient } from '@prisma/client';
// eslint-disable-next-line import/no-extraneous-dependencies
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

import prisma from '../prismaClient';

jest.mock('../prismaClient', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

// eslint-disable-next-line import/prefer-default-export
export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});