import { PrismaClient } from ".prisma/client";
import bcrypt from 'bcrypt';

async function createUserSeed(prisma: PrismaClient) {
    const userEmail = "testUser@test.com"
    const userPassword = "testPassword"
    const saltRounds = 10 //Default salt rounds in bcrypt documentation
    const userPasswordHash = bcrypt.hashSync(userPassword, saltRounds)
    const user = await prisma.user.create({
        data : {
            user_email: userEmail,
            user_password_hash: userPasswordHash,
        }
    })
    console.log('created user %s', user)
}

export {
    createUserSeed
}