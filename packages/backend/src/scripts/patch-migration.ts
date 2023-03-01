import prisma from '../models/prismaClient';
import { FACULTY_ROLE_ID, STUDENT_ROLE_ID } from '../helpers/constants';

async function patchMigration() {

  const allUsers = await prisma.user.findMany();
  const usersOnRolesOnCourses = await prisma.usersOnRolesOnCourses.findMany();
  const usersOnRoles = await prisma.usersOnRoles.findMany();

  for (const userOnRoleOnCourse of usersOnRolesOnCourses) {
    const userId = allUsers.find(user => user.user_email === userOnRoleOnCourse.user_email)?.user_id;
    if (userId) {
      await prisma.usersOnRolesOnCourses.update({
        where : {
          user_email_course_id : {
            user_email : userOnRoleOnCourse.user_email,
            course_id: userOnRoleOnCourse.course_id
          }
        },
        data : {
          user_id : userId,
        }
      })
    }
  }

  for (const userOnRole of usersOnRoles) {
    const userId = allUsers.find(user => user.user_email === userOnRole.user_email)?.user_id;
    if (userId) {
      await prisma.usersOnRoles.update({
        where : {
          user_email : userOnRole.user_email
        },
        data : {
          user_id : userId,
        }
      })
    }
  }

  const updatedUsersOnRolesOnCourses = await prisma.usersOnRolesOnCourses.findMany();
  console.log(updatedUsersOnRolesOnCourses);
  const updatedUsersOnRoles = await prisma.usersOnRoles.findMany();
  console.log(updatedUsersOnRoles);


}

patchMigration();
