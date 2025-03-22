import psycopg
import re
import os
from dataclasses import dataclass, field
from typing import List, Dict

@dataclass
class ApiEndpoint:
  method: str
  path: str

@dataclass
class SectionInfo:
  title: str
  content: str

def parse_api_endpoint(api_string: str) -> ApiEndpoint:
  """
    Parse API endpoint from string in format <method> <path>

    Args:
        api_string: String in format <method> <path>

    Returns:
        ApiEndpoint object

    Raises:
        Exception: If method is invalid
  """
  method, path = api_string.split(' ')
  valid_methods = ['get', 'post', 'put', 'delete']

  if (method.lower() not in valid_methods):
    raise Exception(f"Invalid method: {method}")

  return ApiEndpoint(method.lower(), path)

def extract_api_to_user_guide_mappings(file_path: str) -> List[tuple[ApiEndpoint, str]]:
  """
    Extracts API endpoints from markdown file and maps them to their sections.
    
    Args:
        file_path: Path to the markdown file
        
    Returns:
        List of tuples, where each tuple contains an API endpoint and its section title
    """
  print(f'Extracting API endpoints from file: {file_path}')
  with open(file_path, 'r', encoding='utf-8') as file:
    content = file.read()
  
  sections = []
  current_section = None
  current_content = []

  # Split content by markdown headers (##)
  lines = content.split('\n')
  for line in lines:
    if line.startswith('## '):
      # Save previous section if exists
      if current_section:
        sections.append(SectionInfo(
          title=current_section,
          content='\n'.join(current_content)
        ))
          
      # Start new section
      current_section = line[3:].strip()
      current_content = []
    else:
      if current_section:
        current_content.append(line)
  
  # Add the last section
  if current_section:
    sections.append(SectionInfo(
      title=current_section,
      content='\n'.join(current_content)
    ))
  
  # Extract API endpoints and associate them with sections
  api_to_section_map = []
  for section in sections:
    # Find all API endpoints in this section
    endpoints = re.findall(r"<!--\s*API:\s*([A-Z]+\s+\S+)\s*-->", section.content)
      
    # Map each endpoint to this section
    for endpoint in endpoints:
      api_endpoint = parse_api_endpoint(endpoint)
      api_to_section_map.append((api_endpoint, section.title))
  
  print(f'Done extracting API endpoints from file: {file_path}')
  return api_to_section_map

def insert_api_user_guide_mapping(permalink: str, api_to_section_map: List[tuple[ApiEndpoint, str]]) -> None:
  """
  Inserts API to user guide mappings into the database.

  This function takes a permalink and a list of API to section mappings, 
  and inserts each mapping into the "ApiMapping" table in the database. 
  Each mapping associates an API endpoint with a section title, and 
  constructs a section link based on the permalink and the section title.

  Args:
      permalink (str): The base URL used to create section links.
      api_to_section_map (List[tuple[ApiEndpoint, str]]): A list of tuples 
          where each tuple contains an ApiEndpoint object and a section 
          title.

  Returns:
      None
  """

  print("Inserting API mappings into database")
  with psycopg.connect(os.getenv('DATABASE_URL')) as conn:
    with conn.cursor() as cur:
      for api_endpoint, section_title in api_to_section_map:
        section_link = permalink + '#' + section_title.lower().replace(' ', '-')
        cur.execute('INSERT INTO "ApiMapping" (method, path, section_title, endpoint) VALUES (%s, %s, %s, %s)', (api_endpoint.method, api_endpoint.path, section_title, section_link))
      conn.commit()
  print("Done inserting API mappings into database")

def reset_api_mapping_db():
  """
  Resets the ApiMapping table in the database by deleting all rows and resetting the id sequence.

  This function is used to clear the database of all API mappings before re-running the script to map API endpoints to user guide sections.

  """
  
  print("Resetting the database")
  with psycopg.connect(os.getenv('DATABASE_URL')) as conn:
    with conn.cursor() as cur:
      cur.execute('DELETE FROM "ApiMapping"')
      cur.execute('ALTER SEQUENCE "ApiMapping_id_seq" RESTART WITH 1')
      conn.commit()
  print("Done resetting the database")

def launch_api_user_guide_mapper(permalink: str, file_path: str) -> None:
  print(f"Mapping API endpoints for file: {file_path}")

  api_to_section_map = extract_api_to_user_guide_mappings(file_path)
  
  for api_endpoint, section_title in api_to_section_map:
    print(f"Mapping API endpoint: {api_endpoint.method} {api_endpoint.path} to section: {section_title}")
  
  insert_api_user_guide_mapping(permalink, api_to_section_map)

  print(f"Done mapping API endpoints for file: {file_path}")