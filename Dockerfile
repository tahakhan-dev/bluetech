# Specifies where to get the base image (Node v12 in our case) and creates a new container for it
FROM node

WORKDIR /.

# Install dependencies
ADD package*.json ./
# Copy source files from host computer to the container
ADD . .
RUN npm install

# Run the app
CMD [ "npm", "start" ]