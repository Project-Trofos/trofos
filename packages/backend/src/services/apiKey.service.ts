import { Prisma, UserApiKey } from "@prisma/client";
import prisma from "../models/prismaClient";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

async function generateApiKey(userId: number): Promise<UserApiKey> {
  const newApiKey = randomUUID();
  // Generate and hash with salt an API key
  const apiKeyHash = bcrypt.hashSync(newApiKey, 10);

  const { api_key, ...newUserApiKeyWithoutApiKey } = await prisma.$transaction<UserApiKey>(async (tx: Prisma.TransactionClient) => {
    // Check if existing API key exists
    const existingApiKey = await tx.userApiKey.findFirst({
      where: {
        user_id: userId,
      },
    });

    // If an API key exists, update it
    if (existingApiKey) {
      return await tx.userApiKey.update({
        where: {
          user_id: userId,
        },
        data: {
          api_key: apiKeyHash,
          created_at: new Date(),
          last_used: null,
          active: true,
        },
      });
    }
    // Else, create a new API key
    return await tx.userApiKey.create({
      data: {
        user_id: userId,
        api_key: apiKeyHash,
        created_at: new Date(),
        last_used: null,
        active: true,
      },
    });
  });

  return {
    ...newUserApiKeyWithoutApiKey,
    api_key: newApiKey,
  };
}

async function getApiKeyRecordForUser(userId: number): Promise<UserApiKey | null> {
  // api_key and user is currently one to one
  return prisma.userApiKey.findFirst({
    where: {
      user_id: userId,
    },
  });
};

export default {
  generateApiKey,
  getApiKeyRecordForUser,
};
