FROM python:3.11-slim

WORKDIR /app

COPY . .
RUN pip install --no-cache-dir fastapi uvicorn[standard] spacy pydantic requests
COPY model_spacy_plaintes /app/model_spacy_plaintes
EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]