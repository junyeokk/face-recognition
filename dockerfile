FROM python:3.10-slim

RUN apt-get update && \
    apt-get install -y curl gnupg build-essential libgl1 libglib2.0-0 && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

RUN pip install numpy opencv-python-headless pillow

WORKDIR /app
COPY . .

RUN npm install

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]