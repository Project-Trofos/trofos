/* eslint-disable import/prefer-default-export */
import trofosApiSlice from ".";
import { Project } from './project';
import { Course } from './course';

export type User = {
    user_email : string,
    user_id : number,
    projects : Project[],
    courses: Course[],
    // TODO: Create a role type once we have a role API
    roles: any[]
}

export type CreateUserRequest = {
    userEmail: string,
    newPassword: string
}

const extendedApi = trofosApiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers : builder.query<User[], void>({
            query: () => ({
                url : 'user/',
                credentials: 'include',
            }),
            providesTags : ['User'],
        }),
        createUser : builder.mutation<void, CreateUserRequest>({
            query: (user) => ({
                url: 'user/',
                method: 'POST',
                body: {
                    userEmail: user.userEmail,
                    newPassword: user.newPassword
                },
                credentials: 'include',
            }),
            invalidatesTags : ['User']
        })
    }),
    overrideExisting : false,
});

export const { useGetUsersQuery, useCreateUserMutation } = extendedApi;