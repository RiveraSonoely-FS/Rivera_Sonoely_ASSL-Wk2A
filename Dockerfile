FROM node:latest
COPY . . /app/
EXPOSE 8080
CMD ["start"]