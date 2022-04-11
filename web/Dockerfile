FROM nginx:1.21.3-alpine
COPY ./dist /usr/share/nginx/html

ARG TIME_ZONE=Asia/Shanghai
RUN rm -rf /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/nginx.conf \
    && ln -snf /usr/share/zoneinfo/$TIME_ZONE /etc/localtime && echo $TIME_ZONE > /etc/timezone

ADD ./nginx/cat_entrypoint.sh /docker-entrypoint.d/cat_entrypoint.sh
ADD ./nginx/default.conf /tmp/cat_server_block.conf

RUN chmod u+x /docker-entrypoint.d/cat_entrypoint.sh

ENV API_PROXY_PASS=http://gateway:8080