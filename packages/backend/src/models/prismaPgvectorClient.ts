import { PrismaClient } from '../../prisma_pgvector/generated/pgvector_client';

const prismaPgvector = new PrismaClient();

export default prismaPgvector;
