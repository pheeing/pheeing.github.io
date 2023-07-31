---
layout: single
title: "[WebRTC] 화상회의 웹서비스 개발하기 (with.janus-gateway) - (3)"
categories: webrtc
tag:
  [
    webrtc,
    webrtc 서버,
    화상회의,
    화상채팅,
    video conference,
    video chat,
    janus,
    janus gateway,
    janus admin,
    janus videoroom,
  ]
toc: true
---

## 개요

[지난번 포스팅](/webrtc/start-webrtc-with-janus2/) 에서는 coturn 서버 까지 설치했습니다.

지난번 포스팅에서 예고한 대로 오늘은 어드민 설정 방법과,

janus-gateway 비디오룸 설정과 활용 방법에 대하여 서술하겠습니다.

이 포스팅에서 설정하는 모든 것은 janus-gateway 문서에도 잘 나와있습니다.

저는 janus-gateway 를 이용한 서비스를 만들때 꼭 필요한 설정 들에 대해서만 서술하겠습니다.

## janus 설정

janus-gateway 를 정상적으로 설치를 했다면

**/opt/janus/etc/janus**

위의 경로에 설정 아래와 같은 파일들이 있을겁니다.

![janus-setting-files](/images/2023-07-31-start-webrtc-with-janus3/janus-setting-files.png)

우린 이 설정 파일들을 입맛에 맞게 수정해서 사용하면 됩니다.

janus 에서는 플러그인 이라는 개념을 사용하며

특정 플러그인에 대해서 활성화, 비활성화 또는 각 권한을 할당할 수 있는 어드민 API 를 제공합니다.

그래서 우리가 설정해야할 파일은 **_janus.jcfg_** 와 **_janus.plugin.videoroom.jcfg_**

두가지 입니다.

### 어드민설정

어드민 기능을 사용하려면 설정 파일을 수정해줍니다.

**janus.jcfg**

```bash
general: {
  ...
  token_auth = true # Enable a token based authentication
                  # mechanism to force users to always provide
                  # a valid token in all requests. Useful if
                  # you want to authenticate requests from web
                  # users.
  #token_auth_secret = "janus"  # Use HMAC-SHA1 signed tokens (with token_auth). Note that
                  # without this, the Admin API MUST
                  # be enabled, as tokens are added and removed
                  # through messages sent there.
  admin_secret = "janusoverlord"  # String that all Janus requests must contain
                  # to be accepted/authorized by the admin/monitor.
                  # only needed if you enabled the admin API
                  # in any of the available transports.
  ...
}
```

이 파일에서 바꿔야 하는 항목은 `token_auth` 항목 주석해제 하고 true 로 바꾸는 것과

`admin_secret` 항목을 본인이 사용할 비밀번호를 세팅하는 것입니다.

위와 같이 세팅하고 janus 서버 재시작을 하면 이제 모든 janus의 모든 요청은 토큰이 있어야만 인증되고,

토큰이 없는 요청은 거부됩니다.

우선은 토큰을 활성화 하면 사용하지 못하기 때문에 포스트맨으로 수동으로 토큰을 생성해봅니다.

공식문서의 문법 설명을 보면,

![janus-admin-syntax](/images/2023-07-31-start-webrtc-with-janus3/janus-admin-syntax.png)

위와 같이 트랜잭션에는 랜덤스트링을 생성하고, 어드민 시크릿을 설정했던 비밀번호를 세팅합니다.

포스트맨을 켜고 위의 문법대로 `post` 리퀘스트를 하나 생성합니다.

![janus-admin-postman](/images/2023-07-31-start-webrtc-with-janus3/janus-admin-postman.png)

토큰 리스트를 조회했는데 정상적으로 응답이 온걸 확인 할 수 있습니다.

만약 시크릿이 틀리면 아래와 같은 응답을 받게 됩니다.

```json
{
  "janus": "error",
  "transaction": "sBJNyUhH6Vc6",
  "error": {
    "code": 403,
    "reason": "Unauthorized request (wrong or missing secret/token)"
  }
}
```

이제 토큰을 하나 생성 해봅니다.

위와 같은 똑같은 문법으로 생성해서 날리면 됩니다.

```json
{
  "janus": "add_token",
  "token": "asdf1234",
  "plugins": ["janus.plugin.videoroom"],
  "transaction": "sBJNyUhH6Vc6",
  "admin_secret": "janusadminsecret"
}
```

토큰 생성은 위와 같이 포스트 리퀘스트를 날리면

![janus-add-token](/images/2023-07-31-start-webrtc-with-janus3/janus-add-token.png)

정상적으로 결과가 오고 토큰이 생성됩니다.

```json
{
  "janus": "remove_token",
  "token": "asdf1234",
  "transaction": "sBJNyUhH6Vc6",
  "admin_secret": "janusadminsecret"
}
```

토큰 제거도 비슷 하게 구현 할 수 있습니다.

![janus-remove-token](/images/2023-07-31-start-webrtc-with-janus3/janus-remove-token.png)

정상적으로 결과가 오고 토큰이 제거됩니다.

일단은 수동으로 이렇게 토큰을 생성, 삭제 했지만

실제 서비스에서 이용할려면 어드민 홈페이지에서 리퀘스트를 날리는 부분을 구현하면 좋습니다.

추가적으로 모니터링 및 관리기능을 만들고 싶다면

```json
{
  "janus": "info",
  "janus": "ping",
  "janus": "get_status",
  "janus": "list_tokens",
  "janus": "add_token",
  "janus": "remove_token",
  "janus": "list_sessions"
}
```

위와 같은 어드민 api를 구현해서 사용하실 어드민 홈페이지에 적용하면 됩니다.

### 토큰적용

이제 토큰을 생성 했으니 실제 janus 클라이언트 로직에도 적용을 해야합니다.

적용하는 방법은 간단합니다.

구현했던 클라이언트 로직에 token 만 추가해주면 됩니다.

```javascript
Janus.init({
  debug: "all",
  callback: function () {
    // ...
    // Create session
    janus = new Janus({
      server: server,
      iceServers: iceServers,
      success: function () {
        // Attach to VideoRoom plugin
        janus.attach({
          plugin: "janus.plugin.videoroom",
          opaqueId: opaqueId,
          success: function (pluginHandle) {
            // ...
          },
          error: function (error) {
            // ...
          },
          // ...
        });
      },
      // 토큰 추가
      token: "asdf1234",
      // ...
    });
  },
});
```

위와 같이 토큰만 추가해주면서 janus 객체 생성을 하면 그 이후의 모든 요청은 토큰을 알아서 넣어주기 때문에

다른 부분은 신경을 안써도 됩니다.

## 비디오룸

비디오룸 설정 파일은 실제 지금 시점에서는 딱히 건들게 없습니다.

다만 설정파일을 보면 방마다 설정할 수 있는 항목들이 있는데,

우리는 이것을 활용해서, 방인원수를 제한, 비밀방, 화질 제한 등등 을 구혈 할 수 있습니다.

**janus.plugin.videoroom.jcfg**

```bash
room-1234: {
  description = "Demo Room"
  secret = "adminpwd"
  publishers = 6
  bitrate = 128000
  fir_freq = 10
  #audiocodec = "opus"
  #videocodec = "vp8"
  record = false
  #rec_dir = "/path/to/recordings-folder"
}

# This other demo room here is only there in case you want to play with
# the VP9 SVC support. Notice that you'll need a Chrome launched with
# the flag that enables that support, or otherwise you'll be using just
# plain VP9 (which is good if you want to test how this indeed affect
# what receivers will get, whether they're encoding SVC or not).
room-5678: {
  description = "VP9-SVC Demo Room"
  secret = "adminpwd"
  publishers = 6
  bitrate = 512000
  fir_freq = 10
  videocodec = "vp9"
  video_svc = true
}
```

비디오룸 설정 파일을 열어보면 상단에는 각 옵션에 대한 설명이 있고,

하단에는 미리 생성되어있는 방에대한 설정 값들을 볼 수 있습니다.

room 뒤에오는 숫자는 방을 생성할때 유니크한 숫자로 설정하면 되고, 나머지 옵션들은

생성시에 요청 보낼때 옵션을 조정 할 수 있습니다.

각 속성에 대해서 간단히 설명을 하자면

`description` : 방 설명  
`secret` : 방에대한 설정 변경시 필요한 시크릿  
`publishers` : 동시에 송출할수 있는 사람수 (인원)  
`bitrate` : 비트레이트 (화질)  
`is_private` : 공개방인지 아닌지  
`pin` : 방에 들어갈때 필요한 비번  
`permanent` : 방을 영구적으로 설정파일에 저장할건지

일단 기본적인 설정은 위와 같고, 다른 기능이 필요하다면 설정파일을 열어보고 설명을 참고하면 됩니다.

이제 대략적인 설정 파일에 대한 설명은 끝났는데 이걸 어떻게 활용할까요?

활용을 제대로 하려면 클라이언트 에서 기능을 제대로 구현을 하면 됩니다.

### 비디오룸 생성

비디오룸 생성도 공식문서에 내용이 있습니다.

커스텀으로 기능을 구현하려면 따로 구현소스를 만들어서 적용하는게 좋습니다.

간단하게 클라이언트 모듈에서 구현한 예제를 보여드리겠습니다.

```javascript
export function createJanusRoom({ pluginHandle, options }) {
  return new Promise((resolve, reject) => {
    const body = {
      request: "create",
      description: options.description || "기본 방설명",
      publishers: options.publishers || 50, // 기본값 맥스 50명
      bitrate: options.bitrate || 0, // 기본값 No limit
      permanent: true,
    };
    // 추가 다른옵션 존재시 추가해서 방생성
    if (options.secret) body.secret = options.secret;
    if (options.pin) body.pin = options.pin;
    if (typeof options.is_private === "boolean")
      body.is_private = options.is_private;

    pluginHandle.send({
      message: body,
      success: (result) => {
        resolve(result);
      },
      error: (err) => {
        reject(err);
      },
    });
  });
}
```

저 같은 경우는 위와 같이 관련 함수를 만들었고 janus room 을 생성한 후에 성공하면

같은 복사본을 서버디비에 저장하고 관리하였습니다.

삭제나, 설정변경 같은경우도 위와 같이 비슷하게 구현하면 쉽게 적용할 수 있습니다.

오늘은 janus 서버의 가장 기본적인 설정, 어드민 api, 비디오룸 설정 등에 대하여 알아보았습니다.

다음번 포스팅에서는 janus 자체 녹화 기능의 활용방법,

서드파티 녹화기능 활용방법 등에 대하여 포스팅하겠습니다.
