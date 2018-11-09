# build stage
FROM node:latest as builder
WORKDIR /usr/src/app
ADD . /usr/src/app
RUN npm install
RUN npm run build

# run stage
FROM nginx:stable-alpine

COPY scripts/run.sh /home/run.sh
COPY nginx.conf /home/nginx.conf
RUN touch /var/run/nginx.pid
COPY --from=builder /usr/src/app/build/ /usr/share/nginx/html/

ARG SECURE_MODE
ARG COMBINER_URL
ARG HL7_UTILS_URL
ARG AUTH_URL

ENV SECURE_MODE ${SECURE_MODE}
ENV COMBINER_URL ${COMBINER_URL}
ENV HL7_UTILS_URL ${HL7_UTILS_URL}
ENV AUTH_URL ${AUTH_URL}

# pull latest
RUN apk update && apk upgrade --no-cache

# don't run as root user
RUN chmod g+rwx /home/run.sh /home/nginx.conf /etc/nginx /var/cache/nginx /var/run/nginx.pid
RUN chown -R 1001:0 /home/ /usr/share/nginx/html /etc/nginx /var/cache/nginx /var/run/ /var/run/nginx.pid
RUN chmod 664 /usr/share/nginx/html/config.js
USER 1001

EXPOSE 8080

# run server command
CMD ["/home/run.sh"]
