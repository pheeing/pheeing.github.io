---
layout: single
title: "[WebRTC] 화상회의 웹서비스 개발하기 (with.janus-gateway) - (4)"
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
    janus record,
    recordplay,
    ffmpeg,
  ]
toc: true
---

## 개요

[지난번 포스팅](/webrtc/start-webrtc-with-janus3/)은 설정방법 이었습니다.

오늘은 janus 자체 녹화 플러그인에 대한 설명을 해보겠습니다.

이 포스팅에서 설정하는 모든 것은 janus-gateway 문서에도 잘 나와있습니다.

## RecordPlay

janus-gateway 를 정상적으로 설치를 했다면

**/opt/janus/etc/janus**

위의 경로에 설정 아래와 같은 파일들이 있을겁니다.

![janus-setting-files](/images/2023-07-31-start-webrtc-with-janus3/janus-setting-files.png)

이 파일들 중에서 우리가 주목해야 할 파일은

**_janus.plugin.recordplay.jcfg_** 입니다.

### 파일저장경로 설정

녹화 플러그인을 사용하려면 일단 설정파일을 확인해주세요.

**janus.plugin.recordplay.jcfg**

![janus-recordplay-config](/images/2023-10-11-start-webrtc-with-janus4/janus-recordplay-config.png)

이 설정파일에서 `path` 는 기본 녹화된 파일들의 저장경로입니다.

이것을 원하는 위치로 바꾸시고 싶다면 여기서 수정하면 변경 됩니다.

### 토큰에 플러그인 추가

플러그인을 제대로 사용하려면 이전 포스팅에서 토큰을 설정했었는데

해당 플러그인에 대한 권한도 같이 설정해줘야 합니다.

```json
{
  "janus": "add_token",
  "token": "asdf1234",
  "plugins": ["janus.plugin.recordplay", "janus.plugin.videoroom"],
  "transaction": "sBJNyUhH6Vc6",
  "admin_secret": "janusadminsecret"
}
```

위와 같이 사용할 토큰에 해당 플러그인을 등록해주세요.

### mjr 파일

최초 샘플 파일을 제공합니다. 최초 레코딩 저장 폴더로 가보면 샘플파일이 존재합니다.

**/opt/janus/share/janus/recordings**

![record-folder](/images/2023-10-11-start-webrtc-with-janus4/record-folder.png)

녹화를 할경우 두가지 파일로 저장되고, 그 두가지 정보를 포함한 메타 정보성 파일이 생겨납니다.

정보파일을 열어보면 이렇게 정보가 저장됩니다.

**1234.nfo**

![record-info](/images/2023-10-11-start-webrtc-with-janus4/record-info.png)

위의 정보들은 보고 알수 있는것은 audio 와 video 가 각각 `.mjr` 포맷으로 저장되고 이정보를 담고있는

`.nfo` 포맷 파일도 생성된다 라는걸 알 수 있습니다.

## 구현

일단 준비과정은 여기까지 마친셈이고, 공식 문서를 들여다 볼 차례입니다.

공식문서를 보면 recordplay 플러그인 api 를 호출하고 응답 받는식으로 구현하면 될것 같습니다.

### recordplay에 관한 모듈 만들기

우선 recordplay에 관한 모듈을 만들어 줍니다.

**_janusRecordPlay.js_**

```javascript
export function createHandle({ janus }) {
  return new Promise((resolve, reject) => {
    // Attach to config.recordPlayHandler plugin
    janus.attach({
      plugin: "janus.plugin.recordplay",
      opaqueId: "recordplaytest-" + Janus.randomString(12),
      success: (pluginHandle) => {
        resolve({ myRecordHandle: pluginHandle });
      },
      error: (error) => {
        Janus.error("  -- Error attaching plugin...", error);
        reject();
      },
      // ...
    });
  });
}

// ...
```

위와 같이 모듈을 만들어주고 각각의 API에 대응하는 함수를 만들어 주면 될 것 입니다.

만들어야 할 함수는 플러그인핸들 생성, 녹화시작, 녹화중지, 녹화된거재생, 재생중지 정도가 있겠습니다.

각 함수를 모두 구현했다고 가정하면 이제 다음스텝으로 가야 합니다.

### 녹화된 파일 처리

녹화된 파일은 `.mjr` 이라는 포맷의 파일입니다. 당장 이파일로는 어디서 써먹을 수가 없습니다.

공식문서를 보면 유틸리티에서 지원하는 프로그램(`janus-pp-rec`) 이 있습니다.

mjr 파일을 변환해 주는 유틸입니다. 그래서 이 문서를 참조하면 작업계획이 나옵니다.

간단히 보드를 작성하면 아래와 같습니다.

![work-plan](/images/2023-10-11-start-webrtc-with-janus4/work-plan.png)

위와 같은 형식으로 구현을 해봅니다.

### 의존성 설치

일단 작업 계획 대로 처리하려면 필요한 janus 유틸리티와 ffmpeg 을 설치해야 합니다.

**janus util 설치**

최초에는 없기 때문에 관련유틸을 설치해야 합니다.

```bash
apt-get update
apt-get install janus-tools
```

설치가 끝나고 터미널에서 ja 를 누르고 탭을 누르면 자동완성이 될것입니다.

**_/usr/bin_** 경로에서도 확인이 가능합니다.

![janus-pp-rec](/images/2023-10-11-start-webrtc-with-janus4/janus-pp-rec.png)

**ffmpeg 설치**

ffmpeg 도 한번도 쓰지 않았다면 설치가 안되어 있을테니 설치를 해야합니다.

```bash
apt-get install ffmpeg
```

설치가 끝나고 터미널에서 ffm 을 누르고 탭을 누르면 자동완성이 될것입니다.

**janus-pp-rec 활용한 변환**

janus에 있는 recordplay 이 기능을 그대로 사용한다면 여기서 부터는 필요없는 작업입니다.

하지만 mjr 이 아닌 사용가능한 포맷으로 바꾸려면 이작업이 필요합니다.

```bash
janus-pp-rec /opt/janus/share/janus/recordings/rec-sample-video.mjr /opt/janus/share/janus/recordings/rec-sample-video.webm
janus-pp-rec /opt/janus/share/janus/recordings/rec-sample-audio.mjr /opt/janus/share/janus/recordings/rec-sample-audio.opus
```

위의 명령어를 실행 하면 아래와 같이 로그가 찍힙니다.

```bash
/opt/janus/share/janus/recordings/rec-sample-video.mjr --> /opt/janus/share/janus/recordings/rec-sample-video.webm
File is 107936 bytes
Pre-parsing file to generate ordered index...
[WARN] Old .mjr header format
This is a video recording, assuming VP8
SSRC detected: 2600978833
Counted 176 RTP packets
Counted 176 frame packets
  -- 640x480 (fps [5130,5850] ~ 17)
[webm @ 0x561ba71f51a0] Using AVStream.codec.time_base as a timebase hint to the muxer is deprecated. Set AVStream.time_base instead.
[webm @ 0x561ba71f51a0] Using AVStream.codec to pass codec parameters to muxers is deprecated, use AVStream.codecpar instead.
First keyframe: 0
/opt/janus/share/janus/recordings/rec-sample-video.webm is 105186 bytes
Bye!

/opt/janus/share/janus/recordings/rec-sample-audio.mjr --> /opt/janus/share/janus/recordings/rec-sample-audio.opus
File is 53931 bytes
Pre-parsing file to generate ordered index...
[WARN] Old .mjr header format
This is an audio recording, assuming Opus
SSRC detected: 3649154666
Counted 529 RTP packets
Counted 529 frame packets
Writing .opus file header
/opt/janus/share/janus/recordings/rec-sample-audio.opus is 57202 bytes
Bye!
```

그리고 변환된 파일이 생성되어 있는걸 확인할수 있습니다.

![first-convert](/images/2023-10-11-start-webrtc-with-janus4/first-convert.png)

1차변환이 완료되었고, 이제 ffmpeg 을 이용한 2차 변환을 하면 됩니다.

**ffmpeg 활용한 변환**

1차 변환된 파일들을 ffmpeg을 이용하여 2차 변환을 합니다.

```bash
ffmpeg -i /opt/janus/share/janus/recordings/rec-sample-audio.opus -i /opt/janus/share/janus/recordings/rec-sample-video.webm  -c:v copy -c:a opus -strict experimental /opt/janus/share/janus/recordings/rec-sample-mixed.webm
```

해당 폴더에 가면 파일이 생성되어 있습니다.

![second-convert](/images/2023-10-11-start-webrtc-with-janus4/second-convert.png)

## 테스트

계획대로 변환되는것을 확인하였습니다. 이제 실제 플러그인이 동작하는지만 테스트 해보면 될 것 같습니다.

janus-gateway 깃주소를 그대로 풀받으면 html 폴더가 있는데

이것을 저번에 설명 드린것처럼 간단한 http server로 띄우고 테스트를 해봅니다.

![record-test1](/images/2023-10-11-start-webrtc-with-janus4/record-test1.png)

![record-test2](/images/2023-10-11-start-webrtc-with-janus4/record-test2.png)

![record-test3](/images/2023-10-11-start-webrtc-with-janus4/record-test3.png)

![record-test4](/images/2023-10-11-start-webrtc-with-janus4/record-test4.png)

![record-test5](/images/2023-10-11-start-webrtc-with-janus4/record-test5.png)

![record-test6](/images/2023-10-11-start-webrtc-with-janus4/record-test6.png)

녹화 잘 되고 재생도 잘되는걸 확인할 수 있습니다.

녹화 폴더에도 잘쌓이는걸 확인했습니다.

오늘의 포스팅은 여기까지 입니다.

다음번에는 기존 녹화 플러그인에 문제점과, 서드파티 녹화 플러그인 활용 및 토이 프로젝트 완성에 대해서 포스팅 하겠습니다.
