import prisma from '../models/prismaClient';

async function patchMigration() {

  const allUsers = await prisma.user.findMany();
  const usersOnRolesOnCourses = await prisma.usersOnRolesOnCourses.findMany();
  const usersOnRoles = await prisma.usersOnRoles.findMany();

  for (const userOnRoleOnCourse of usersOnRolesOnCourses) {
    /*
      For each entry in usersOnRolesOnCourses, find their user id from the list of all users
      and update the UsersOnRolesOnCourses table with their user id
    */
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
    /*
      For each entry in usersOnRoles, find their user id from the list of all users
      and update the UsersOnRoles table with their user id
    */
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
