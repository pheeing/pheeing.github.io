---
layout: single
title: "[DevOps] Nginx 로 가상 호스트 구현하기"
categories: devops
tag: [devops, linux, nginx, 엔진엑스, ubuntu, centos, virtual host, 가상호스팅, reverse proxy, nginx config]
toc: true
---

## 1. 개요
오늘은 Linux 환경 (ubuntu, centos) 에서 nginx 를 이용한

가상 호스트 환경 구성에 대하여 포스팅 하겠습니다.

### 1.1 가상호스팅
가상호스팅(Virtual Hosting)은 하나의 서버(IP) 에서 여러개의 도메인을 

가질 수 있는 호스팅 방식을 의미 합니다. 

이를 활용할 때 하나의 서버에서 여러개의 멀티 도메인을 이용한 서비스를 

구축할 수 있다는 점이 큰 장점입니다.

### 1.2 Nginx
현재 전세계의 웹서버 점유율은 Apache 와 Nginx 가 거의 45 퍼센트를 차지합니다.

(Apache 가 대략 24퍼, Nginx가 20퍼 정도 되는걸로 알고 있습니다.)

Nginx 가 상당히 후발주자인데 무섭게 Apache 를 쫓고 있으며, 그 이유는

Nginx 의 많은 특징들 때문입니다. 

엔진엑스(Nginx)의 장점들은 여러개가 있지만 

- 가볍고 높은성능
- 이벤트 드리븐(Event-driven)
- 리버스 프록시
- 로드 밸런싱

등등이 있고 nginx 단에서 많은 기능을 구현 할 수 있기 때문에

이점이 많은 방식입니다.

## 2. Nginx 설치
엔진엑스(Nginx)의 설치는 매우 간편합니다. 

### 2.1 ubuntu 18.04
우분투 환경에서 설치는 아래의 명령어를 이용합니다.

```bash
sudo apt-get install nginx

sudo service nginx status
```
위 명령어를 입력하면 nginx가 설치됩니다.

### 2.2 centos 8
centos 환경에서도 설치가 간단합니다.

```bash
sudo yum install nginx

sudo systemctl enable nginx
```
위 명령어를 입력하면 됩니다.

```bash
No package nginx available.
Error: Nothing to do
```
만약 패키지가 없다는 에러가 뜰경우 리포를 등록후 설치 명령을 재실행합니다.

```bash
nano /etc/yum.repos.d/nginx.repo
```

아래의 내용을 붙여놓고 재실행합니다.
```bash
[nginx]
name=nginx repo
baseurl=http://nginx.org/packages/centos/8/$basearch/
gpgcheck=0
enabled=1
```

설치가 완료되면 상태를 확인해 봅니다.

```bash
sudo systemctl status nginx
```

## 3. Nginx 설정
우선 가상호스팅 설정을 하려면 앞에서 얘기를 했듯이 하나의 아아피에서 

여러 도메인을 쓰는구조 이기 때문에 도메인이 필수적으로 존재 해야 합니다.

두개 이상의 도메인이 있다고 가정하고 Nginx 설정을 시작합니다.

### 3.1 nginx.conf 설정
엔진엑스(Nginx)의 기본 설정 파일입니다.

**/etc/nginx/nginx.conf**
```bash
# ...
# ...
events {
  worker_connections  1024;
}

http {
  # ...

  server {
    listen       80;
    server_name  localhost;

    # ...
  }
  
  # 아래는 centos는 없음
  include /etc/nginx/sites-enabled/*;
}
```
일단 기본 설정 파일은 위와 같이 생겼는데 centos의 경우 

맨아래 include 줄을 추가 해주고 폴더를 만들어서 관리 합니다.

일단 프로모션 도메인이 2개가 있고, 서비스 도메인이 2개가 있다고 

가정하고 설정파일을 작성해 보겠습니다.

**/etc/nginx/nginx.conf**
```bash
# ...
# ...
events {
  worker_connections  1024;
}

http {
  # ...

  upstream promotion-back {
    server 127.0.0.1:5500;
  }

  upstream promotion1-front {
    server 127.0.0.1:3000;
  }

  upstream promotion2-front {
    server 127.0.0.1:3001;
  }

  server {
    listen       80;
    server_name  localhost;

    # ...
  }
  
  # 아래는 centos는 없음
  include /etc/nginx/sites-enabled/*;
}
```
일단 nginx.conf 에서는 프로모션 프론트와 백에 관한 내부포트 업스트림을 설정 합니다.

### 3.2 sites-available 설정
방법은 여러가지가 있는데 저는 sites-available 폴더안에서 각각 

도메인에 1:1 로 매칭되는 conf 파일을 만들어서 가상호스팅을 관리합니다.

centos 경우 `/etc/nginx` 에서 두가지 폴더를 생성합니다.
```bash
sudo mkdir sites-enabled
sudo mkdir sites-available
```

그리고 `sites-available` 폴더에서 각 도메인에 대한 설정 파일을 작성합니다.

**/etc/nginx/sites-available/프로모션.com.conf**
```bash
        server {
                listen 80;
                server_name 프로모션.com www.프로모션.com;
                return 301 https://$server_name$request_uri;
        }

        server {
                listen 443 ssl;
                client_max_body_size 50M;
                server_name 프로모션.com www.프로모션.com;

                ssl_certificate /etc/letsencrypt/live/프로모션.com/fullchain.pem;
                ssl_certificate_key /etc/letsencrypt/live/프로모션.com/privkey.pem;
                ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
                ssl_ciphers         HIGH:!aNULL:!MD5;

                location / {
                        proxy_set_header Upgrade $http_upgrade;
                        proxy_set_header Connection 'upgrade';
                        proxy_set_header Host $host;
                        proxy_set_header X-Forwarded-For $remote_addr;
                        proxy_http_version 1.1;
                        proxy_pass         http://promotion1-front;
                }

                location /api {
                        proxy_set_header Upgrade $http_upgrade;
                        proxy_set_header Connection 'upgrade';
                        proxy_set_header Host $host;
                        proxy_set_header X-Forwarded-For $remote_addr;
                        proxy_http_version 1.1;
                        proxy_pass         http://promotion-back;
                }
        }
```

다른 도메인의 프로모션 설정

**/etc/nginx/sites-available/프로모션.co.kr.conf**
```bash
        server {
                listen 80;
                server_name 프로모션.co.kr www.프로모션.co.kr;
                return 301 https://$server_name$request_uri;
        }

        server {
                listen 443 ssl;
                client_max_body_size 50M;
                server_name 프로모션.co.kr www.프로모션.co.kr;

                ssl_certificate /etc/letsencrypt/live/프로모션.co.kr/fullchain.pem;
                ssl_certificate_key /etc/letsencrypt/live/프로모션.co.kr/privkey.pem;
                ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
                ssl_ciphers         HIGH:!aNULL:!MD5;

                location / {
                        proxy_set_header Upgrade $http_upgrade;
                        proxy_set_header Connection 'upgrade';
                        proxy_set_header Host $host;
                        proxy_set_header X-Forwarded-For $remote_addr;
                        proxy_http_version 1.1;
                        proxy_pass         http://promotion2-front;
                }

                location /api {
                        proxy_set_header Upgrade $http_upgrade;
                        proxy_set_header Connection 'upgrade';
                        proxy_set_header Host $host;
                        proxy_set_header X-Forwarded-For $remote_addr;
                        proxy_http_version 1.1;
                        proxy_pass         http://promotion-back;
                }
        }
```

위와 같이 작성하면 프로모션사이트 2개에 대해서 가상호스팅을 적용할 수 있습니다.

서비스1 도메인에 대한 설정 파일을 마저 작성합니다.

**/etc/nginx/sites-available/서비스1.com.conf**
```bash
        server {
                listen 80;
                server_name 서비스1.com;
                return 301 https://$server_name$request_uri;
        }

        server {
                listen 443 ssl;
                client_max_body_size 50M;
                server_name 서비스1.com;
                ssl_certificate /etc/letsencrypt/live/서비스1.com/fullchain.pem;
                ssl_certificate_key /etc/letsencrypt/live/서비스1.com/privkey.pem;
                ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
                ssl_ciphers HIGH:!aNULL:!MD5;

                location / {
                        proxy_redirect off;
                        proxy_set_header   X-Real-IP  $remote_addr;
                        proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
                        proxy_set_header   X-Forwarded-Proto  $scheme;
                        proxy_set_header   Host  $http_host;
                        proxy_set_header   X-NginX-Proxy  true;
                        proxy_http_version 1.1;
                        proxy_cookie_path / "/; SameSite=None; HTTPOnly; Secure";
                        proxy_pass         http://127.0.0.1:3301;
                }

                location /socket.io/ {
                        proxy_pass http://127.0.0.1:3301;
                        proxy_http_version 1.1;
                        proxy_set_header Upgrade $http_upgrade;
                        proxy_set_header Connection "Upgrade";
                        proxy_set_header Host $host;
                }
        }
```

서비스2 에 대한 설정 파일 마저 작성합니다.

**/etc/nginx/sites-available/서비스2.com.conf**
```bash
        server {
                listen 80;
                server_name 서비스2.com;
                return 301 https://$server_name$request_uri;
        }

        server {
                listen 443 ssl;
                client_max_body_size 50M;
                server_name 서비스2.com;
                ssl_certificate /etc/letsencrypt/live/서비스2.com/fullchain.pem;
                ssl_certificate_key /etc/letsencrypt/live/서비스2.com/privkey.pem;
                ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
                ssl_ciphers HIGH:!aNULL:!MD5;

                location / {
                        proxy_redirect off;
                        proxy_set_header   X-Real-IP  $remote_addr;
                        proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
                        proxy_set_header   X-Forwarded-Proto  $scheme;
                        proxy_set_header   Host  $http_host;
                        proxy_set_header   X-NginX-Proxy  true;
                        proxy_http_version 1.1;
                        proxy_cookie_path / "/; SameSite=None; HTTPOnly; Secure";
                        proxy_pass         http://127.0.0.1:3302;
                }

                location /socket.io/ {
                        proxy_pass http://127.0.0.1:3302;
                        proxy_http_version 1.1;
                        proxy_set_header Upgrade $http_upgrade;
                        proxy_set_header Connection "Upgrade";
                        proxy_set_header Host $host;
                }
        }
```

이렇게 4가지의 서비스가 서로 다른 포트에서 실행 되고 있다고 가정 하에 

각 설정 파일들을 작성해 보았습니다.

`sites-available` 에 설정파일을 각각 작성 하고 

`sites-enabled` 에 심볼릭 링크를 걸어주면 모든 설정이 적용됩니다.

추후에 설정을 사용하지 않는 경우 `sites-enabled` 에서만 삭제하면 되기 때문에 

관리하기에 용이합니다.

### 3.3 Symbolic Link 설정
작성한 모든 설정파일에 대한 심볼릭 링크를 생성합니다.

```bash
sudo ln -s /etc/nginx/sites-available/프로모션.com.conf /etc/nginx/sites-enabled/프로모션.com.conf
sudo ln -s /etc/nginx/sites-available/프로모션.co.kr.conf /etc/nginx/sites-enabled/프로모션.co.kr.conf
sudo ln -s /etc/nginx/sites-available/서비스1.com.conf /etc/nginx/sites-enabled/서비스1.com.conf
sudo ln -s /etc/nginx/sites-available/서비스2.com.conf /etc/nginx/sites-enabled/서비스2.com.conf
```
이렇게 심볼릭 링크를 각각 만들어 줍니다.

전부다 설정된 경우 `sites-enabled` 폴더에 가보면 

다음과 같이 심볼릭 링크가 생성되어 있는걸 확인 할 수 있습니다.

![symbolic-link](/images/2023-11-27-setup-virtual-host-in-nginx/symbolic-link.png)

## 4. 완료
심볼릭 링크까지 다 설정됐으면 nginx를 재시작 해주는것으로 모든 설정은 끝납니다.

**우분투 nginx 재시작**
```bash
sudo service nginx restart
```
**Centos nginx 재시작**
```bash
sudo systemctl restart nginx
```

위의 예제는 node(express) 프로모션 사이트와, 서비스 앱이 각각 실행 되고 있는 서버에서의

가상호스팅 환경 구성에 대한 예제 였습니다.

`pm2 ls` 명령어를 쳤을때 아래와 같이 여러개의 서비스가 서로 다른포트에서 

하나의 서버에서 돌아가고 있을때의 예제 입니다.

![pm2-ls](/images/2023-11-27-setup-virtual-host-in-nginx/pm2-ls.png)

여기에는 certbot 으로 자동 인증서 갱신도 추가로 작성할 수 있습니다. 

nginx ssl 자동갱신에 대해서는 다음에 포스팅 하겠습니다.

추가적으로,

만약 443 포트 리슨이 필요없다면 80 포트 리슨에서 리버스 프록시 블록을 작성하시면 됩니다.

오늘의 포스팅은 여기까지 입니다.
