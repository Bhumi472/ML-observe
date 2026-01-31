FROM python:3.11-slim

WORKDIR /app

# install system deps
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# install python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy app
COPY app ./app

EXPOSE 8000

CMD ["python", "app/main.py"]
