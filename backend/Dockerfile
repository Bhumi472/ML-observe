FROM python:3.11-alpine

WORKDIR /app

# install system deps (Alpine uses apk)
RUN apk add --no-cache gcc musl-dev postgresql-dev

# install python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy app
COPY app ./app

# Create uploads directory for models API
RUN mkdir -p /app/uploads

EXPOSE 8000

CMD ["python", "app/main.py"]