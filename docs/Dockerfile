# Use an official Python image as base
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY ./rag_script/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY . .

WORKDIR /app/rag_script

# Command to run the Python script
ENTRYPOINT ["python", "insert_user_guide_embeddings.py"]
CMD []
