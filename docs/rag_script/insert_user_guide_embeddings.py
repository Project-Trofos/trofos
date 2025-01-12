from dotenv import load_dotenv
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain_community.document_loaders import UnstructuredMarkdownLoader
import psycopg
import os
import re

"""
Structure to store the embeddings of a jekyll page of the user guide
"""
class PageEmbeddingStore:
  def __init__(self):
    self.title = None
    self.permalink = None
    self.embeddings = []
    self.raw_content = []
    self.section_titles = []

"""
Based on a jekyll page, find out the perma link and title + contents of the page. Doesn't embed yet
"""
def process_jekyll_page(file_path: str) -> PageEmbeddingStore:
  # load the md page into langchain documents
  loader = UnstructuredMarkdownLoader(file_path, mode='elements')
  documents = loader.load()

  cur_page_embedding_store = PageEmbeddingStore()
  for document in documents:
    # get permalink source and title for rest of the page embeddings
    if document.metadata['category'] == 'UncategorizedText' and 'permalink' in document.page_content:
      match = re.search(r"permalink:\s*(\S+)", document.page_content)
      if match:
        cur_page_embedding_store.permalink = match.group(1)
      else:
        raise Exception("No permalink found in page")
      match = re.search(r"title:\s*(\S+)", document.page_content)
      if match:
        cur_page_embedding_store.title = match.group(1)
      else:
        raise Exception("No title found in page")
    # fill up the embeddings
    elif document.metadata['category'] == 'Title':
      cur_page_embedding_store.section_titles.append(document.page_content)
    elif document.metadata['category'] == 'NarrativeText':
      cur_page_embedding_store.raw_content.append(document.page_content)

  # Ensure number of section titles is same as number of raw contents
  if len(cur_page_embedding_store.section_titles) != len(cur_page_embedding_store.raw_content):
    raise Exception("Number of section titles and raw contents do not match")

  return cur_page_embedding_store

"""
Embeds content of sections in jekyll page after being pre-processed
"""
def embed_jekyll_page_sections(embed_store: PageEmbeddingStore) -> PageEmbeddingStore:
  # Embed the pages
  embed_sdk  = OpenAIEmbeddings(
    openai_api_key=os.getenv('OPENAI_API_KEY'),
    model='text-embedding-3-small'
  )
  # Call embedding API to get actual embeddings
  for i, raw_content in enumerate(embed_store.raw_content):
    section_title = embed_store.section_titles[i]
    embed_content = section_title + ' ' + raw_content
    embedding = embed_sdk.embed_query(embed_content)
    embed_store.embeddings.append(embedding)
  return embed_store

"""
Inserts the embeddings of a jekyll page into the database
"""
def insert_jekyll_page_embeddings(embed_store: PageEmbeddingStore):
  with psycopg.connect(os.getenv('PG_VECTOR_CONN_STR')) as conn:
    with conn.cursor() as cur:
      # Insert the section embeddings
      for i, embedding in enumerate(embed_store.embeddings):
        section_link = embed_store.permalink + '#' + embed_store.section_titles[i].lower().replace(' ', '-')
        cur.execute('INSERT INTO "UserGuideEmbedding" (endpoint, section_title, embedding, content) VALUES (%s, %s, %s, %s)', (section_link, embed_store.section_titles[i], embedding, embed_store.raw_content[i]))
      # Insert the page embeddings
      conn.commit()

if __name__ == "__main__":
  load_dotenv()

  embed_store = process_jekyll_page('../pages/rag_parse_pages/guide_project_management.markdown')
  embed_store = embed_jekyll_page_sections(embed_store)
  insert_jekyll_page_embeddings(embed_store)
  print("Done")
