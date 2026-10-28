import { Prisma } from '@prisma/client';

// A grade row also exists when a TA is merely assigned (null score and comment); those hold no
// data to lose, so only rows with a score or comment count as "existing grades".
export const HAS_GRADE_CONTENT: Prisma.GradeWhereInput = {
  OR: [{ score: { not: null } }, { comment: { not: null } }],
};
