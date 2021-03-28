#FROM python:3
FROM tensorflow/tensorflow

WORKDIR /usr/src/app

COPY . .

RUN pip install --no-cache-dir numpy gym pandas matplotlib

CMD ["tail", "-f", "/dev/null"]