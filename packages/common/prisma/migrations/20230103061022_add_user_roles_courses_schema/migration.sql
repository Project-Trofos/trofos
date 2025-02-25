-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- CreateTable
CREATE TABLE "UsersOnRolesOnCourses" (
    "id" SERIAL NOT NULL,
    "user_email" VARCHAR(320) NOT NULL,
    "role_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,

    CONSTRAINT "UsersOnRolesOnCourses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsersOnRolesOnCourses_user_email_key" ON "UsersOnRolesOnCourses"("user_email");

-- AddForeignKey
ALTER TABLE "UsersOnRolesOnCourses" ADD CONSTRAINT "UsersOnRolesOnCourses_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "User"("user_email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnRolesOnCourses" ADD CONSTRAINT "UsersOnRolesOnCourses_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnRolesOnCourses" ADD CONSTRAINT "UsersOnRolesOnCourses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
