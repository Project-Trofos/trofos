import { PrismaClient } from '@trofos-nus/common/src/generated/pgvector_client';

const prismaPgvector = new PrismaClient();

export default prismaPgvector;
