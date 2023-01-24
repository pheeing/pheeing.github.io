---
layout: single
title: "[WebRTC] 화상회의 어플리케이션 개발하기 (with.janus-gateway) - (1)"
categories: springboot
tag: [webrtc, 화상회의, 화상채팅, video conference, video chat, janus, janus gateway, stun, turn, signaling]
toc: true
---

## 개요
오늘날 화상회의는 업무에 필수적인 요소로 자리 잡게 되었습니다.

코로나 시대에 접어 들면서, 기업들의 재택근무는 가속화 되었고, 재택근무를 하기 위한 필수요소인

화상회의 어플리케이션의 대한 수요는 꾸준히 증가했고, 그에따른 서비스들도 우후죽순 생겨나게 되었습니다.

가장 유명한 빅테크 기업들의 화상회의 서비스는 나무랄데 없이 매우 훌륭합니다.

하지만 비용 문제라던지, 보안 문제라던지 등등 자신만의 서비스를 구축하고자 하는 수요 또한 많이 생겨나게 되었습니다.

지금도 자신만의 서버를 구축해서 화상회의를 구축하고자 하는 수요도 분명 많을 것으로 생각됩니다.

그래서 저는 시리즈물로 화상회의 어플리케이션을 구축하는 방법에 대하여 포스팅 하고자합니다.

## WebRTC 개요
우선 간단히 webrtc에 대해 알아 보고 가도록 하겠습니다.

webrtc 는 오픈소스 프로젝트이고, 실시간으로 웹에서 음성 및 영상을 처리할 수 있게하고,

자바스크립트 API를 제공합니다. 이로인해 개발자는 별도의 프로그램이나 의존성없이

웹만으로 화상회의를 구현 할 수 있게 되는거죠.

### STUN/TURN
webrtc를 이용하게 될때 필수적으로 알아야 하는 개념입니다.

개념적인 설명은 인터넷에 더 자세하게 나와있을테니 저는 실제 사용하는 관점에서 설명 하겠습니다.

쉽게 말해서 stun/turn 이 없이는 서로다른 ip 간의 화상회의를 할 수 없습니다.

이 두가지가 하는 역할은 내컴퓨터(브라우저) -> 공유기 -> 인터넷 -> 공유기 -> 상대컴퓨터(브라우저)

간의 ip를 연결해주는 역할을 하게 됩니다.

stun 은 구글에서 구축해놓은 stun 서버를 이용해도 잘 동작합니다.

stun 은 여러사람이 맘대로 쓸 수 있는 개념이라면 turn은 반드시 my own server 가 필요한 개념입니다.

### signaling
signaling 이라는 개념은 이러한 ip를 탐색하고 찾고 연결하는 일련의 프로세스를 의미합니다.

만약 ice server 로 stun/turn 서버를 둘다 등록해놓는다면 

먼저 stun을 먼저 찾고 못찾는다면 마지막으로 turn 서버를 이용하는 식입니다.

만약 시그널링에 실패하면 연결은 실패하게 됩니다.

### coturn
turn 서버 역시 많은 오픈소스가 존재합니다.

저는 그중에 coturn을 추천하고 싶습니다.

그 이유는 turn 서버 오픈소스중 가장 유명하기도 하고 사용사례도 많기 때문입니다.

## janus-gateway
P2P 가 아닌 수십명의 화상회의 서비스를 구축하려면 webrtc 서버는 반드시 존재하여야 합니다.

일단 제가 생각하기에 쓸만한 오픈소스를 소개해 드리겠습니다.

바로 janus-gateway 인데요. (야누스 로 읽습니다.)

이것 말고도 오픈소스는 많이 존재합니다.

만약 다른걸로 하고 싶다면 다른 오픈소스로도 구성할 수 있을겁니다.

제가 야누스를 선택하게된 특징들에 대해서 간단히 나열하자면 아래와 같습니다.

(이외에도 다양한 기능이 존재합니다)

### 50 명 동시 화상회의
제가 janus-gateway를 선택 했을당시(2020 년도 하반기) 오픈소스중에서 가장 기능이 많고

안정적으로 50명 동시 화상회의가 가능한 오픈소스 였기 때문에 선택하였습니다.

### 어드민 API 
문서화도 잘되있고 어드민 API 를 제공해주어서 클라이언트를 컨트롤하기 더 용이하고

모니터링 도 쉽게 구현 할 수 있습니다.

또한 토큰으로 보안도 강화 할 수 있습니다.

## 설치 및 실행
### janus-gateway 설치
janus 설치 방법은 공식 깃허브 리드미에 나와있습니다.

하지만 간단하게 한번더 설명해보겠습니다.

우선 ubuntu18.04 기준으로 하겠습니다. 

```bash
sudo apt-get update
```

의존성 설치
```bash
sudo apt-get install aptitude

aptitude install libmicrohttpd-dev libjansson-dev \
	libssl-dev libsrtp-dev libsofia-sip-ua-dev libglib2.0-dev \
	libopus-dev libogg-dev libcurl4-openssl-dev liblua5.3-dev \
	libconfig-dev pkg-config libtool automake
```

빌드를 위한 의존성 설치
```bash
sudo apt-get install python3 python3-pip python3-setuptools \
  python3-wheel ninja-build

pip3 install meson
```

libnice 클론 및 컴파일
```bash
git clone https://gitlab.freedesktop.org/libnice/libnice
cd libnice
meson --prefix=/usr build && ninja -C build && sudo ninja -C build install
```

libsrtp 설치
```bash
wget https://github.com/cisco/libsrtp/archive/v2.2.0.tar.gz
tar xfv v2.2.0.tar.gz
cd libsrtp-2.2.0
./configure --prefix=/usr --enable-openssl
make shared_library && sudo make install
```

usrsctp 설치
```bash
git clone https://github.com/sctplab/usrsctp
cd usrsctp
./bootstrap
./configure --prefix=/usr --disable-programs --disable-inet --disable-inet6
make && sudo make install
```

libwebsockets 설치
```bash
sudo apt-get install cmake

git clone https://libwebsockets.org/repo/libwebsockets
cd libwebsockets
git checkout v4.3-stable
mkdir build
cd build
cmake -DLWS_MAX_SMP=1 -DLWS_WITHOUT_EXTENSIONS=0 -DCMAKE_INSTALL_PREFIX:PATH=/usr -DCMAKE_C_FLAGS="-fpic" ..
make && sudo make install
```

여기까지 하면 모든 의존성이 설치 됩니다.

이제 janus-gateway 소스를 클론하고 컴파일후 실행해 봅시다.

```bash
git clone https://github.com/meetecho/janus-gateway.git
cd janus-gateway

sh autogen.sh

./configure --prefix=/opt/janus --disable-rabbitmq --disable-mqtt
make
make install
make configs
```

여기까지 하면 모든 준비는 끝나게 됩니다.

실행해 봅시다.

### 실행
우리는 아직 stun/turn 을 구축하지 않았기 때문에

구글 stun 서버로 띄워 보겠습니다.

```bash
/opt/janus/bin/janus --stun-server=stun.l.google.com:19302
```
위 명령어로 실행하게 되면

아래와 같이 로그가 뜨게 됩니다.

![janusExec](/images/2023-01-24-start-webrtc-with-janus/janusexec.png)

여기까지 따라오셨으면 성공입니다.

### 테스트

이제 webrtc 서버를 정상적으로 띄웠으니 테스트를 해야겠죠?

테스트를 위한 환경을 구축해 봅시다.

기본적으로 janus의 포트 구성은 아래와 같습니다.

```text
8088: 서버 리스닝 포트
8089: ssl 서버 리스닝 포트
7088: admin 리스닝 포트
7089: admin ssql 리스닝 포트

http://yourhost:8088/janus/info 로 접속 확인 할수 있다.
https://yourhost:8089/janus/info 로 ssl 접속 확인 할수 있다.
```

제 테스트 환경은 구름ide에서 했는데요. 포트포워딩을 해줍니다.

구름에서는 실행 URL과 포트 입니다.

만약 ubuntu VM 으로 구축한 경우 위의 포트를 방화벽 해제해줍니다.

![janus-goorm1](/images/2023-01-24-start-webrtc-with-janus/janus-goorm1.png)

![janus-goorm2](/images/2023-01-24-start-webrtc-with-janus/janus-goorm2.png)

이렇게 하면 구름서버는 준비 되었고,

janus-gateway를 클론하면 html 부분이 있는데 이걸 그대로 

가져와서 테스트 할 수 있습니다.

우리가 수정할 소스는 **videoroomtest.js** 입니다.

아... 최신 소스는 **settings.js** 에 같은 구문이 있네요.

서버만 수정해줍니다.

html 만 가져와서 http-server 나 간단한 노드웹서버로

html 안에서 실행합니다.

![htmltest1](/images/2023-01-24-start-webrtc-with-janus/htmltest1.png)

![htmltest2](/images/2023-01-24-start-webrtc-with-janus/htmltest2.png)

![htmltest3](/images/2023-01-24-start-webrtc-with-janus/htmltest3.png)

이렇게 정상적으로 접속이되고

서버로그 역시 정상적으로 아래와 같이 찍히면 webrtc 서버 구성은 끝나게됩니다.

![janusLog](/images/2023-01-24-start-webrtc-with-janus/januslog.png)

### 구름컨테이너허브

이 글을 포스팅하기 위해 구름 컨테이너 허브에 public 으로 새로세팅해서 올려뒀으니 확인할수있습니다.

![goormContainer](/images/2023-01-24-start-webrtc-with-janus/goorm-container.png)

허브에서 검색후 바로 실행하세요 명령어는 위에 있는 실행 명령어를 쓰면 됩니다.

다음 포스팅은 janus-gateway 활용하는 방법, 어플리케이션 구성방법, 실제 서버 구성 (nginx revers proxy),

도커이미지로 만들어서 실행하는 방법,

등등에 대하여 포스팅하겠습니다.

