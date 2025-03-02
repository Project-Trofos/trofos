-- CreateEnum
CREATE TYPE "Action" AS ENUM ('create_course', 'read_course', 'update_course', 'delete_course', 'create_project', 'read_project', 'update_project', 'delete_project');

-- CreateEnum
CREATE TYPE "BacklogType" AS ENUM ('story', 'task', 'bug');

-- CreateEnum
CREATE TYPE "BacklogPriority" AS ENUM ('very_high', 'high', 'medium', 'low', 'very_low');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "user_email" VARCHAR(320) NOT NULL,
    "user_password_hash" VARCHAR(4000),

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "session_id" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_role_id" INTEGER NOT NULL,
    "session_expiry" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '1 day',

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "sem" INTEGER NOT NULL,
    "cname" VARCHAR(256) NOT NULL,
    "description" TEXT,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id","year","sem")
);

-- CreateTable
CREATE TABLE "UsersOnCourses" (
    "course_id" TEXT NOT NULL,
    "course_year" INTEGER NOT NULL,
    "course_sem" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsersOnCourses_pkey" PRIMARY KEY ("course_id","course_year","course_sem","user_id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "pname" VARCHAR(256) NOT NULL,
    "pkey" VARCHAR(64),
    "description" TEXT,
    "course_id" TEXT,
    "course_year" INTEGER,
    "course_sem" INTEGER,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "backlog_counter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsersOnProjects" (
    "project_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsersOnProjects_pkey" PRIMARY KEY ("project_id","user_id")
);

-- CreateTable
CREATE TABLE "Backlog" (
    "backlog_id" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "type" "BacklogType",
    "sprint_id" INTEGER,
    "priority" "BacklogPriority",
    "reporter_id" INTEGER NOT NULL,
    "assignee_id" INTEGER,
    "project_id" INTEGER NOT NULL,
    "points" INTEGER,
    "description" TEXT,

    CONSTRAINT "Backlog_pkey" PRIMARY KEY ("project_id","backlog_id")
);

-- CreateTable
CREATE TABLE "Sprint" (
    "id" INTEGER NOT NULL,

    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "role_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionsOnRoles" (
    "role_id" INTEGER NOT NULL,
    "action" "Action" NOT NULL
);

-- CreateTable
CREATE TABLE "UsersOnRoles" (
    "user_email" VARCHAR(320) NOT NULL,
    "role_id" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_user_email_key" ON "User"("user_email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_role_name_key" ON "Role"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "ActionsOnRoles_role_id_action_key" ON "ActionsOnRoles"("role_id", "action");

-- CreateIndex
CREATE UNIQUE INDEX "UsersOnRoles_user_email_key" ON "UsersOnRoles"("user_email");

-- AddForeignKey
ALTER TABLE "UsersOnCourses" ADD CONSTRAINT "UsersOnCourses_course_id_course_year_course_sem_fkey" FOREIGN KEY ("course_id", "course_year", "course_sem") REFERENCES "Course"("id", "year", "sem") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnCourses" ADD CONSTRAINT "UsersOnCourses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_course_id_course_year_course_sem_fkey" FOREIGN KEY ("course_id", "course_year", "course_sem") REFERENCES "Course"("id", "year", "sem") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnProjects" ADD CONSTRAINT "UsersOnProjects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnProjects" ADD CONSTRAINT "UsersOnProjects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backlog" ADD CONSTRAINT "Backlog_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "Sprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backlog" ADD CONSTRAINT "Backlog_reporter_id_project_id_fkey" FOREIGN KEY ("reporter_id", "project_id") REFERENCES "UsersOnProjects"("user_id", "project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backlog" ADD CONSTRAINT "Backlog_assignee_id_project_id_fkey" FOREIGN KEY ("assignee_id", "project_id") REFERENCES "UsersOnProjects"("user_id", "project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionsOnRoles" ADD CONSTRAINT "ActionsOnRoles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnRoles" ADD CONSTRAINT "UsersOnRoles_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "User"("user_email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnRoles" ADD CONSTRAINT "UsersOnRoles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
