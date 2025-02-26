---
layout: page
title: Contributing
permalink: /guide/contributing
---

* TOC
{:toc}

## Report Bugs

1. File an issue in the `Issues` tab. Please fill up the provided template.

1. Label it under `bug`

1. Give it a meaningful title


When posting stack traces, please quote them using [code blocks](https://docs.github.com/en/get-started/writing-on-github/working-with-advanced-formatting/creating-and-highlighting-code-blocks)

## Writing tests

Feel free to contribute to our frontend and backend tests. We have unit testing of frontend components using `testing-library/react` and end-to-end testing using `playwright`. For backend, we have unit test using `jest` and some integration tests using `node-mocks-http`.

This guide will explain how to setup playwright locally for you to contribute to TROFOS testing.

1. Clone TROFOS repository `git clone https://github.com/Project-Trofos/trofos.git`, go to root dir `.../trofos/`
1. Create env file called `.env`:
    ```
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=postgres
    POSTGRES_DB=trofos
    E2E_DATABASE_URL=postgresql://postgres:postgres@postgres:5432/trofos?schema=public
    E2E_AI_DATABASE_URL=postgresql://postgres:postgres@postgres:5432/pgvector?schema=public
    TELEGRAM_TOKEN=<tele token>
    E2E_REDIS_URL="redis://redis:6379"
    ```

    Here's a token we have created: 7216253061:AAF8fSgE9NzS2QgkkW_9SbClwY7zfbE3nTM

    You should generate your token through @botfather in telegram (use `/newbot`). This is because if someone else is running TROFOS using this token, your backend will not be able to start
1. Start docker containers for e2e testing- `docker compose -f ./docker-compose-e2e.yml --env-file ./.env up`
1. Do `pnpm install` (Install pnpm with `npm install -g pnpm` if not installed yet)
1. `cd` to `./packages/backend`. Create an env file:

    `./packages/backend/.env`:

    ```
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/trofos?schema=public
    ```

    and do `pnpm i` then `pnpm run migrate:reset`
1. `cd` to `./packages/frontend`, do `pnpm exec playwright install --with-deps`
1. In `./packages/frontend`, do `pnpm exec playwright test`
    After this, you can add on new test files using playwright.

## Feature requests

Open a new discussion in the `Discussion` tab, under the `Ideas` category

## Implement Features

Feel free to implement whatever feature requests in our discussion page

## Submitting a Pull Request

**Make a branch**

* Create a separate branch for each issue/ ticket you're working on. If you are working on a fork, do not make changes to the default branch (`master`) of your fork

**Include details in your Pull Request**

* Use our pull request template, populating the template completely with useful details

> \<!-- Replace the XX below with an issue number or the corresponding TROFOS ticket number-->
>
> XX
> 
> \<!-- Tag persons responsible for reviewing proposed changes -->
> 
> @[Username]
>
> \*\*Description**
>
> \<!-- Add a descriptive title below -->
>
> \*\*Other Information**
>
> \<!-- Add any other information below or remove this line completely -->
>
> \*\*Checklist**
>
> \- [ ] My pull request has a descriptive title (not a vague title like \`Update README.md`)
>
> \- [ ] My pull request targets the \`master` branch of the repository only
>
> \- [ ] My commits follows these \[commit message guidelines](https://gist.github.com/robertpainsi/b632364184e70900af4ab688decf6f53)
>
> \- [ ] I added tests for the changes I made (if applicable)
>
> \- [ ] I added or updated documentation (if applicable)
>
> \- [ ] I have ran the project and its tests locally and verified that there are no visible errors

**Changes after review**

* If your PR gets 'Changes requested', address the feedback nad update your PR, pushing into the same branch. You don't need to re-open a new PR

* Request for a re-review after you have made changes
