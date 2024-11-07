FROM node:22
RUN mkdir /home/dictai-auth
ENV COGNITO_SECRET=4a50i31otigv680rtinku0t4v17jnhupm1oosahbp9iuvspqi0m
ENV COGNITO_USER_POOL_ID=us-east-1_TkqBv0B9C
ENV COGNITO_CLIENT_ID=6tm9b8f1efgl7q16stk2q7q7ra
COPY . /home/dictai-auth
WORKDIR /home/dictai-auth
RUN npm install
EXPOSE 3300
CMD ["npm", "start"]