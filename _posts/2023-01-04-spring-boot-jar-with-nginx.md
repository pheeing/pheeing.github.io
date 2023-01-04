---
layout: single
title: "[Spring Boot] JAR 배포시 내장톰캣 IP 인식 문제 (ubuntu 18.04)"
categories: springboot
tag: [spring boot, vscode, jar, embedded tomcat ip, 내장톰캣아이피, ubuntu, 우분투, 네이버클라우드, reverse proxy, 리버스프록시, 엔진엑스, nginx]
toc: true
---

## 1. 배경
오늘은 스프링부트 배포시 발생 할 수 있는 IP 문제와 해결방법에 대해서 포스팅합니다.

기존에 스프링으로 배포할경우는 운영서버의 톰캣서버와 웹서버로 배포하던지 

톰캣서버만을 사용하던지 둘중에 하나로 배포하게됩니다.

어찌됐든 기존스프링 방식에서는 내장톰캣을 쓰지 않습니다.

스프링부트는 개발시부터 빌드 배포까지 내장 톰캣을 자동으로 쓰게 되고 

배포시 몇가지 문제점이 생길수가 있는데 그중 하나가 IP 인식 문제입니다.

그래서 이번 포스팅에서는 내장톰캣에서의 외부 아이피 인식 문제 해결을 위한 방법중 하나로

nginx를 이용한 리버스 프록시로 구성해보았습니다.

운영서버의 환경은 우분투 18.04 버전이라고 가정합니다.

## 2. 준비
### 2.1 운영서버준비
우선 클라우드 서버나 물리서버에

우분투가 설치된 서버를 준비합니다.

저는 네이버 클라우드를 활용한 서버로 테스트합니다.

저는 아래와 같은 사양으로 서버를 생성하였습니다.

![serverspec](/images/2023-01-04-spring-boot-jar-with-nginx/ubuntu.png)

ps. 사실 서버사양은 중요하지 않습니다. 우분투 서버를 준비해주세요.

### 2.2 Nginx 설치 및 세팅
Nginx 를 먼저 설치해 줍니다.

우분투에서 nginx 설치는 매우 간단합니다.

```bash
sudo apt-get install nginx
```

최초설치시 바인드 에러가 날 수도 있습니다.

```bash
sudo service nginx status
```

상태가 정상이 아니라면 아래와 같이 수정해 줍니다.

```bash
# ipv6 바인드 에러
Aug 25 14:55:36 spring-boot nginx[17002]: nginx: [emerg] socket() [::]:80 failed (97: Address family not supported by protocol)
Aug 25 14:55:36 spring-boot nginx[17002]: nginx: configuration file /etc/nginx/nginx.conf test failed

# 디폴트 파일수정
nano /etc/nginx/sites-enabled/default

# 아래내용 주석처리
#listen [::]:80 default_server;

# 이후 재시작
sudo service nginx restart
```

위와 같이 작성하고 다시 상태를 보면 정상 실행 되었을 것 입니다.

일단 여기 까지 nginx 설치를 마치고 java 실행환경을 구성해줍니다.

### 2.3 Java 실행 환경 설치
이전 포스팅 했던 자바 버전으로 설치 하겠습니다.

openjdk 11  버전을 설치해줍니다.

자바 설치는 더 간단합니다.

```bash
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install openjdk-11-jdk
```

설치가 완료되면 버전을 확인해줍니다.

```bash
root@spring-boot:~# java -version
openjdk version "11.0.17" 2022-10-18
OpenJDK Runtime Environment (build 11.0.17+8-post-Ubuntu-1ubuntu218.04)
OpenJDK 64-Bit Server VM (build 11.0.17+8-post-Ubuntu-1ubuntu218.04, mixed mode, sharing)
```

## 3. 리버스프록시
### 3.1 nginx 설정
버츄얼 호스트가 아닌 톰캣서버 하나만 리버스 프록시를 구성한다면

site-available 에 사이트별로 굳이 만들 필요는 없습니다.

그래서 간단하게 지금 빌드한 jar 만 실행한다고 가정하고

**/etc/nginx/nginx.conf** 파일만 수정해서 구성해보겠습니다.
```bash
# nginx.conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
	worker_connections 768;
	# multi_accept on;
}

http {
  ...

  upstream springboot {
      server 127.0.0.1:8080;
  }

  server {
    listen 80;
    server_name 당신의도메인네임;
    
    location / {
        # Proxy 
        proxy_set_header                X-Localhost true;
        proxy_set_header                X-Real-IP $remote_addr;
        proxy_set_header                X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_pass                      http://springboot;

        proxy_redirect                  off;
        proxy_buffers                   32 16k;
        proxy_busy_buffers_size         64k;
        proxy_cache                     off;	
    }

  }

  ...
}
```
여기서 중요한거는 미리 도메인이 등록되어 있어야합니다.

내장 톰캣은 디폴트 포트인 8080 포트로 실행되도록 내버려 둡니다.

### 3.2 운영서버의 방화벽, 아이피 설정
nginx 설정까지 마쳤다면 운영서버의 외부아이피로 nginx설정에서 쓰인 도메인을 등록해줍니다.

그리고 80번 포트 방화벽을 전체 허용해줍니다.

네이버클라우드 플랫폼에서는 acg 설정을 통해 설정합니다.

저는 아래와 같이 세팅하였습니다.

![acg](/images/2023-01-04-spring-boot-jar-with-nginx/acg-config.png)

## 4. 실행

이제 모든 준비가 끝났습니다.

위와 같은 설정이 다 끝났다면 이제 아래와 같은 구조가 됩니다.

![nginx-tomcat](/images/2023-01-04-spring-boot-jar-with-nginx/nginx-tomcat.png)

이런 구조가 되면 항상 외부아이피는 등록한 nginx의 아이피가 보장되고

아이피가 보장되어야 하는 서비스를 이용할때 아무 문제 없이 이용할수있습니다.

여기까지 되면 톰캣은 백그라운드로 실행하면 더 좋습니다.

아래와 같은 명령어로 실해해봅시다.

```bash
nohup java -Xms1024m -Xmx2048m -jar 빌드된자르.jar &
```

위와 같이 실행하고 로그를 확인해 줍시다.  
(힙메모리는 서버사양에 맞게 적당히 세팅해줍니다.)

```bash
tail -f nohup.out
```

모든게 정상적으로 동작된걸 확인하시면 이제 외부 아이피 문제는 다 해결됩니다.
