# TROFOS User guide

This user guide is deployed using Github Pages with Jekyll. The guide will serve as a user guide and the source information to be parsed and broken down to populate the vector DB in the Retrieve Augmented Generation (RAG) copilot, so it needs to adhere to a style guide so the information can be easily parsed to be embedded

## Inserting into vector db

In /rag_script, run the `insert_user_guide_embeddings.py`. the script looks into /docs/pages/rag_parse_pages, takes everything after toc as contents- it finds a title- then all other subsequent content is the attached to that title

Deployment to production of embedded data is currently manual- run the script in the VM to insert directly into vectordb. Future devs to optimise 😉

In `/docs/rag_script`:

Have .env file:

```
OPENAI_API_KEY=...
PG_VECTOR_CONN_STR="postgresql://postgres:postgres@postgres:5432/pgvector"
```

In `./docs`:

`docker build -t insert_script .`

`docker run --rm --network trofos-application --env-file ./rag_script/.env insert_script`

## Guide

[Documentation](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/creating-a-github-pages-site-with-jekyll)

## Local testing

`bundle exec jekyll serve` to start local server of GH pages user guide

## Pages

[Guide](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/adding-content-to-your-github-pages-site-using-jekyll)

## Posts

Add on into _posts to create new posts. Don't edit files in _site as it is auto-generated
