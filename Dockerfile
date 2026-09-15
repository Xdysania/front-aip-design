FROM hub.fabigbig.com/base/centos7-nginx-makeinstall:v1.23.1.20221207
COPY public/ /var/www/html/
COPY nginx.conf /etc/nginx/nginx.conf
ENV PORT=80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
