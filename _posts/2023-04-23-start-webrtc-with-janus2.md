---
layout: single
title: "[WebRTC] 화상회의 웹서비스 개발하기 (with.janus-gateway) - (2)"
categories: webrtc
tag: [webrtc, webrtc 서버, 화상회의, 화상채팅, video conference, video chat, janus, janus gateway, coturn, turn, nginx, revers proxy]
toc: true
---

## 프론트엔드 개발
[지난번 포스팅](/webrtc/start-webrtc-with-janus/) 에서는 janus-gateway 서버 까지 설치했습니다.

이제 서버를 세팅했으니 프론트엔드를 개발해야죠.

일단 공식 홈페이지에도 잘 나와 있지만 간략하게 더 설명해 드리겠습니다.

### 의존성추가
공식 깃허브 리파지토리 html 폴더에 보면 videoroomtest.html 을 보시면 필요한 의존성이 보일 겁니다.

이거를 복사해서 본인들이 개발할 프론트엔드에 부착하면 일단 의존성은 끝납니다.

**html/videoroomtest.html**
```html
<script type="text/javascript" src="settings.js" ></script>
<script type="text/javascript" src="janus.js" ></script>
<script type="text/javascript" src="videoroomtest.js"></script>
```

### 로직분석
비디오룸 데모 js 소스를 보시면 위에서 추가한 의존성을 활용에서 초기화를 하고 객체를 생성합니다.

그리고 각 단계에서 콜백으로 많은 작업들을 하는 걸 알 수 있습니다.

**html/videoroomtest.js**
```javascript
  Janus.init({debug: "all", callback: function() {
    // ...
    // Create session
    janus = new Janus(
      {
        server: server,
        iceServers: iceServers,
        success: function() {
          // Attach to VideoRoom plugin
          janus.attach(
            {
              plugin: "janus.plugin.videoroom",
              opaqueId: opaqueId,
              success: function(pluginHandle) {
                // ...
              },
              error: function(error) {
                // ...
              },
              // ...
            }
          )
        },
        // ...
      });
  }});
```
janus.attach 메소드에서는 성공콜백으로 **pluginHandle** 을 리턴받습니다.

janus 에서는 이것으로 다른 이벤트를 다룰때 많이 쓰이게 됩니다.

따라서 구현하고자하는 프론트엔드 에서는 이걸 다루는 함수나 메서드를 만들어서

각 이벤트를 처리하면 됩니다. 여기에 있는 로직을 본인이 구현할 프론트엔드에 맞게 구현하면됩니다.

공식 예제만 따라서 해도 왠만한 것들은 구현할 수 있습니다.

간단한 예제 하나 보여드리면 콜백이 중첩되어 있기 때문에 Promise 패턴으로 구현하면 좋습니다.

**someModule.js**
```javascript
export function someFunction() {
  return new Promise((resolve, reject) => {
    // some janus method
    someMethod({
      // ...
      success: () => resolve(),
      error: (error) => reject(error),
      // ...
    })
  })
}
```

## coturn
개발 테스트 용도로만 쓰려면 문제가 되지 않지만,

직접적으로 되는지 확인하면서 개발하고 싶다면 turn 서버를 설치해서 적용하는게 좋습니다.

### 설치
coturn 서버를 설치해봅니다. 

coturn 을 설치하는 방법은 매우 쉽습니다. (ubuntu18.04)

```bash
sudo apt-get -y update
sudo apt-get -y install coturn
```
단 두줄이면 설치가 끝납니다.

설치가 완료되면 몇가지 설정을 더 추가해줍니다.

### 방화벽 설정
```text
- tcp
3478

- tcp (tls)
5349

- udp
3478

- udp
49152-65535
```
위의 포트들을 다 해제해 줍니다.

### 시스템 시작시 턴서버 설정
```bash
nano /etc/default/coturn
```
위 명령어를 치면

```bash
#
# Uncomment it if you want to have the turnserver running as
# an automatic system service daemon
#
#TURNSERVER_ENABLED=1
```
TURNSERVER_ENABLED=1 이라는 항목이 보일텐데 이걸 주석 해제해서 저장해줍니다.

```bash
#
# Uncomment it if you want to have the turnserver running as
# an automatic system service daemon
#
TURNSERVER_ENABLED=1
```

### coturn ip 설정 변경
이제 마지막으로 coturn의 외부아이피 설정을 하면됩니다.
```bash
nano /etc/turnserver.conf
```
위 명령어를 치면
```bash
listening-ip=111.111.222.222
external-ip=118.44.22.33/111.111.222.222

# Lower and upper bounds of the UDP relay endpoints:
# (default values are 49152 and 65535)
min-port=49152
max-port=65535

# Uncomment to run TURN server in 'normal' 'moderate' verbose mode.
# By default the verbose mode is off.
verbose

# Uncomment to use fingerprints in the TURN messages.
# By default the fingerprints are off.
fingerprint

# Uncomment to use long-term credential mechanism.
# By default no credentials mechanism is used (any user allowed).
lt-cred-mech

# Server name used for
# the oAuth authentication purposes
realm=example.com

# define user and password (usr:pass)
user=someId:somePasswd
```
바꿔야 할 항목은 listening-ip, external-ip, realm, user 입니다.

listening-ip 는 vm 의 외부 아이피를 입력하면되고,

external-ip 는 내부아이피 / 외부 아이피 로 입력하면되고,

realm 은 필요하면 설정하면됩니다.

user 는 나중에 iceServers 를 등록할 떄 필요하니 설정해주고 아이디 패스워드를 기억합시다.

설정이 다 끝났다면 재시작 해줍니다.

```bash
service coturn restart
service coturn status
```

### 테스트
모든 설정이 끝났습니다. turn 서버가 제대로 동작하는지 테스트를 해봅시다.

테스트는 더 간단합니다. 유용한 public 툴이 존재합니다.

[Trickle ICE](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/){:target="_blank"}

요기 들어가면 방금 구현한 turn 서버를 설정해주고, add server를 입력해줍니다.

![ice-server-add](/images/2023-04-23-start-webrtc-with-janus2/ice-server.png)

첫번째 입력형식은 turn:아이피:포트

유저네임 비번은 coturn 설정에서 설정한 유저로 하시면 됩니다.

다 설정이 끝났으면 해당 서버를 클릭하고

gather candidates 를 클릭합니다.

![ice-server-test](/images/2023-04-23-start-webrtc-with-janus2/ice-server-test.png)

위와 같이 정상적으로 릴레이 되고 Done이 뜨면 성공한겁니다. 

프론트엔드로 구현할 모듈에서 janus 초기화 로직에 iceServers 에 추가합시다.

```javascript
      iceServers: [
        { url: 'stun:stun.l.google.com:19302' },
        {
          url: 'turn:111.111.222.222:3478?transport=udp',
          username: 'someId',
          credential: 'somePasswd'
        },
        {
          url: 'turn:111.111.222.222:3478?transport=tcp',
          username: 'someId',
          credential: 'somePasswd'
        }
      ]
```

이제 turn 서버를 사용할 수 있습니다.

## 리버스 프록시 (nginx)
화상회의 서비스를 개발할려면 서버는 ssl 이 필수 입니다.

그래서 여기서 부터 난관이 펼쳐지는데, 이를 간단히 해결할 수 있는방법은

서버 앞단에 nginx 를 세팅해서 nginx는 자동 ssl 갱신하는 로직을 만들고

리버스 프록시로 janus 서버를 두면 해결됩니다. 

janus 자체적으로도 인증서를 설정해서 하는 방법이 있지만,

저는 nginx를 써서 해결하였습니다.

nginx 설치 방법은 지난번 포스팅에서도 설명 했으니 생략하고

revers proxy 설정에 관한 부분만 설명하겠습니다.

**/etc/nginx/site-available/default**
```bash
# Default server configuration
server {
  # ...
  location /janus {
    proxy_pass         http://0.0.0.0:8088/janus;
  }

  location /janus_ws {
    proxy_pass         http://0.0.0.0:8188;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }

  location /admin {
    proxy_pass         http://0.0.0.0:7088/admin;
  }
  # ...
}
```
리버스 프록시 설정은 위 세가지로 끝납니다.

nginx의 ssl 설정은 별도 certbot 이나 letsencrypt 혹은 구매한 인증서를 설정해 주시면됩니다.

위와 같이 설정하게 되면 janus 는 두가지 방법 모두 가능하게됩니다.

rest api 방식으로 하려면 https://도메인/janus 로 설정하면되구요.

websocket 방식으로 하려면 https://도메인/janus_ws 로 설정하면됩니다.

오늘의 포스팅은 여기까지 입니다.

여기까지 구현을 하셨으면 프론트엔드에 구애받지 않고 실제 개발하면서

서로다른 아이피로 화상회의도 할 수 있습니다.

다음번 포스팅 에서는 janus 설정 파일 소개와, 어드민 api 활용방법,

화면 녹화 플러그인에 대해서 포스팅 하겠습니다.
      