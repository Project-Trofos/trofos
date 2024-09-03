import { Prisma, UserApiKey } from "@prisma/client";
import prisma from "../models/prismaClient";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

async function generateApiKey(userId: number): Promise<UserApiKey> {
  return prisma.$transaction<UserApiKey>(async (tx: Prisma.TransactionClient) => {
    // Generate and hash with salt an API key
    const newApiKey = randomUUID();
    const apiKeyHash = bcrypt.hashSync(newApiKey, 10);
    
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
}

export default {
  generateApiKey,
};
