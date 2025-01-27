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
  print(f"Processing file: {file_path}")
  # load the md page into langchain documents
  loader = UnstructuredMarkdownLoader(file_path, mode='elements')
  documents = loader.load()

  is_embed_content = False
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
    
    if is_embed_content:
      # fill up the embeddings
      if document.metadata['category'] == 'Title':
        cur_page_embedding_store.section_titles.append(document.page_content)
        cur_page_embedding_store.raw_content.append('')
      else:
        cur_page_embedding_store.raw_content[-1] += document.page_content + ' '
    
    # if toc is found, all subsequent content is in format [title] [content] [content]... [title] [content]...
    if document.page_content == 'TOC {:toc}':
      is_embed_content = True

  # Ensure number of section titles is same as number of raw contents\
  sec_title_len = len(cur_page_embedding_store.section_titles)
  raw_content_len = len(cur_page_embedding_store.raw_content)
  if sec_title_len != raw_content_len:
    raise Exception(f"Number of section titles and raw contents do not match: {sec_title_len} vs {raw_content_len}\n\n", cur_page_embedding_store.section_titles, cur_page_embedding_store.raw_content)

  print(f"Done processing file: {file_path}")
  return cur_page_embedding_store

"""
Embeds content of sections in jekyll page after being pre-processed
"""
def embed_jekyll_page_sections(embed_store: PageEmbeddingStore) -> PageEmbeddingStore:
  print(f"Embedding sections of page: {embed_store.title}")
  # Embed the pages
  embed_sdk  = OpenAIEmbeddings(
    openai_api_key=os.getenv('OPENAI_API_KEY'),
    model='text-embedding-3-small'
  )
  # Call embedding API to get actual embeddings
  for i, raw_content in enumerate(embed_store.raw_content):
    section_title = embed_store.section_titles[i]
    embed_content = section_title + ' ' + raw_content
    print(f"Embedding section: {section_title}, content: {embed_content}\n")
    embedding = embed_sdk.embed_query(embed_content)
    print(f"Done embedding section: {section_title}")
    embed_store.embeddings.append(embedding)
  print(f"Done embedding sections of page: {embed_store.title}")
  return embed_store

"""
Inserts the embeddings of a jekyll page into the database
"""
def insert_jekyll_page_embeddings(embed_store: PageEmbeddingStore):
  print(f"Inserting embeddings of page: {embed_store.title}")
  with psycopg.connect(os.getenv('PG_VECTOR_CONN_STR')) as conn:
    with conn.cursor() as cur:
      # Insert the section embeddings
      for i, embedding in enumerate(embed_store.embeddings):
        section_link = embed_store.permalink + '#' + embed_store.section_titles[i].lower().replace(' ', '-')
        cur.execute('INSERT INTO "UserGuideEmbedding" (endpoint, section_title, embedding, content) VALUES (%s, %s, %s, %s)', (section_link, embed_store.section_titles[i], embedding, embed_store.raw_content[i]))
      # Insert the page embeddings
      conn.commit()
  print(f"Done inserting embeddings of page: {embed_store.title}")

def reset_pg_vector_db():
  print("Resetting the database")
  with psycopg.connect(os.getenv('PG_VECTOR_CONN_STR')) as conn:
    with conn.cursor() as cur:
      cur.execute('DELETE FROM "UserGuideEmbedding"')
      cur.execute('ALTER SEQUENCE "UserGuideEmbedding_id_seq" RESTART WITH 1')
      conn.commit()
  print("Done resetting the database")

if __name__ == "__main__":
  load_dotenv()

  # Reset the database
  reset_pg_vector_db()

  # Get all the files in the directory to parse
  files_dir = '../pages/rag_parse_pages'
  files = [f for f in os.listdir(files_dir) if os.path.isfile(os.path.join(files_dir, f))]

  for file in files:
    print(f"Processing file: {file}")
    embed_store = process_jekyll_page(f'../pages/rag_parse_pages/{file}')
    embed_store = embed_jekyll_page_sections(embed_store)
    insert_jekyll_page_embeddings(embed_store)
    print(f"Done processing file: {file}")
