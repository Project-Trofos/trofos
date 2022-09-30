import { Project, UserSession } from '@prisma/client';
import { PureAbility, AbilityBuilder } from '@casl/ability';
import { createPrismaAbility, PrismaQuery, Subjects } from '@casl/prisma';
import prisma from '../models/prismaClient';
import { accessibleBy } from '@casl/prisma'

type AppAbility = PureAbility<[string, Subjects<{
    Project : Project
}>], PrismaQuery>;


export default function projectPolicy(userId : number) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);

    /*
        A user can only manage (CRUD) a project if:
        1) They are part of that project
        2) They have access to the course the project is part of
    */

    // Handles the case where we are checking a list of projects
    can('read', 'Project', { 
        users : {
            some : {
                user_id : userId
            }
        }
    });

    can('read', 'Project', { 
        course : {
            users : {
                some : {
                    user_id : userId
                }
            }
        }
    });

    return build();
}

export async function canManageProject(userId : number, projectId : number) : Promise<Boolean> {
    // Returns at most one project
    const projects = await prisma.project.findMany({
        where : {
            AND : [
                accessibleBy(projectPolicy(userId)).Project,
                {
                    id : projectId
                }
            ]
        }
    });

    return projects.length === 1;
}







