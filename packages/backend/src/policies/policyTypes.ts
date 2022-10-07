import { Project, Course, User } from '@prisma/client';
import { PureAbility } from '@casl/ability';
import { PrismaQuery, Subjects } from '@casl/prisma';

export type AppAbility = PureAbility<[string, Subjects<{
    Project : Project
    Course : Course
    User: User
}>], PrismaQuery>;


// TODO: Can we return the policyConstraint already wrapped in accessibleBy(...).<Subject> ? 
export type PolicyOutcome = {
    isPolicyValid : boolean,
    policyConstraint : AppAbility
}

// TODO: Define a type for policy functions so we can ensure that they all adhere to an interface