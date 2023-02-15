import { Project, User, UsersOnCourses, UsersOnProjects } from "@prisma/client";
import { FACULTY_ROLE_ID, STUDENT_ROLE_ID } from "../../helpers/constants";
import { ImportCourseDataCsv, ImportCourseDataGroup, ImportCourseDataUser } from "../../services/types/csv.service.types"

export const userDetailsMap = new Map<string, ImportCourseDataUser>();
export const groupDetailsMap = new Map<string, ImportCourseDataGroup>();
export const userGroupingMap = new Map<string, string>();

export type CallbackReturnTest = {
    error?: Error | null | undefined, 
    isValid?: boolean | undefined, 
    reason?: string | undefined
}

export function validateImportCourseDataCallback(
    error?: Error | null | undefined, 
    isValid?: boolean | undefined, 
    reason?: string | undefined
    ) : CallbackReturnTest {
        return  {
            error,
            isValid,
            reason,
        }
}

export function ImportCourseDataCsvBuilder(    
    name : string,
    email : string,
    password : string,
    role: string,
    teamName: string,
    projectName: string) : ImportCourseDataCsv {
    return {
        name,
        email,
        password,
        role,
        teamName,
        projectName
    }
}

export const studentOne : ImportCourseDataUser = {
    id : 1,
    email : "student1@test.com",
    name : "student1",
    password : undefined,
    roleId : STUDENT_ROLE_ID
}

export const studentTwo : ImportCourseDataUser = {
    id : 2,
    email : "student2@test.com",
    name : "student2",
    password : undefined,
    roleId : STUDENT_ROLE_ID
}

export const facultyOne : ImportCourseDataUser = {
    id : 3,
    email : "faculty1@test.com",
    name : "faculty1",
    password : undefined,
    roleId : FACULTY_ROLE_ID
}

export const projectOne : ImportCourseDataGroup = {
    projectId : 1,
    courseId : 1,
    teamName : "projectOne",
    projectName : "projectOne"
}

export const projectTwo : ImportCourseDataGroup = {
    projectId : 2,
    courseId : 1,
    teamName : "projectTwo",
    projectName : "projectTwo"
}

export const projectOnePrismaMock : Project = {
    id : 1,
    pname : "projectOne",
    pkey : "projectOne",
    description : "projectOne",
    course_id : 1,
    public : false,
    backlog_counter : 0,
    created_at : new Date(Date.now())
}

export const projectTwoPrismaMock : Project = {
    id : 2,
    pname : "projectTwo",
    pkey : "projectTwo",
    description : "projectTwo",
    course_id : 1,
    public : false,
    backlog_counter : 0,
    created_at : new Date(Date.now())
}

export const studentOnePrismaUserUpsertMock : User = {
    user_id : 1,
    user_email : studentOne.email,
    user_password_hash : null
}

export const studentTwoPrismaUserUpsertMock : User = {
    user_id : 2,
    user_email : studentTwo.email,
    user_password_hash : null
}

export const facultyOnePrismaUserUpsertMock : User = {
    user_id : 3,
    user_email : facultyOne.email,
    user_password_hash : null
}