---
layout: single
title: "[Spring Boot] vscode 개발 환경 구축하기 (MAC)"
categories: springboot
tag: [spring boot, vscode, setting]
toc: true
---

## 1. 배경
안녕하세요. Chloe Kang 입니다. 

오늘은 스프링부트 개발환경 구축하기에 대해서 포스팅하겠습니다.

저는 과거에 이클립스를 사용하여 스프링 개발을 했었는데요.

최근에는 vue, react, node 등으로 개발을 진행하면서 에디터로 vscode 를 많이 사용하였습니다.

수년간 vscode를 사용하면서 장점들이 너무 많고, 쓰다보니 매우 가볍고 파워풀한 에디터라서 이제 거의 이거만 사용하게 되었습니다.

그래서 이번에 스프링부트로 개발할 기회가 생겼지만 이클립스를 버리고, 개발환경은 vscode 에서 개발환경을 구축하였고, 현재 활용중입니다.

세팅이 아예 하나도 안되어있다고 가정하겠습니다.

## 2. 준비
### 2.1 openjdk 11 설치
우선 처음에 jdk 를 설치해 줘야합니다. vscode 익스텐션 요구사항이 최소 11이기 때문에 익숙한 오라클 1.8(8) 버전을 버리고 완전무료인 openjdk11 을 설치해줍시다.

```bash
brew install --cask adoptopenjdk11
```

![openjdk](/images/2022-07-24-springboot-setup-onmac/openjdk11.png)

### 2.2 설치확인
설치가 완료되었다면 자바버전을 확인해봅시다.

![openjdkconfirm](/images/2022-07-24-springboot-setup-onmac/openjdk11confirm.png)

만약 결과가 안나온다면 환경변수를 따로 등록해줘야합니다.

```bash
/usr/libexec/java_home -v 11
```

위 명령어를 치면 JAVA_HOME 경로가 나오는데 해당경로를 등록해줍니다.
.bash_profile 에 등록하여줍니다. 
.zshrc 를 쓰시는분은 .bash_profile 을 참조하는 소스를 더 추가해줍니다.

```bash
nano .bash_profile
-------------------
export JAVA_HOME="/Library/Java/JavaVirtualMachines/adoptopenjdk-11.jdk/Contents/Home"
```

```bash
nano .zshrc
-------------------
if [ -f ~/.bash_profile ]; then
  . ~/.bash_profile
fi
```

### 2.3 vscode 익스텐션 설치
자바 환경변수까지 세팅이 되었다면 vscode 익스텐션을 설치해줍니다.

설치할 익스텐션은 두가지 입니다.

익스텐션 탭에가서 java를 검색해줍니다.
Extension for java 를 찾아서 설치해 줍니다.
![java](/images/2022-07-24-springboot-setup-onmac/java.png)

Spring Boot Extension pack 을 찾아서 설치해 줍니다. 
![spring](/images/2022-07-24-springboot-setup-onmac/spring.png)

## 3. 스프링부트 프로젝트실행
이제 모든 준비가 끝났습니다.
vscode 에서 프로젝트를 생성할 수도 있지만 이번엔 spring initailizr 에서 생성 해보겠습니다.

![init](/images/2022-07-24-springboot-setup-onmac/init.png)

아 lombok을 깜박했네요.
익스텐션에서 lombok도 검색해서 설치해 줍니다.

![lombok](/images/2022-07-24-springboot-setup-onmac/lombok.png)

다 세팅이 끝났습니다.

프로젝트를 열어 봅시다.

![exec1](/images/2022-07-24-springboot-setup-onmac/exec1.png)

프로젝트가 정상적으로 열리고 자바 컴파일도 제대로 동작합니다.

![exec2](/images/2022-07-24-springboot-setup-onmac/exec2.png)

실해을 누른후 제대로 톰캣 서버가 구동되는 모습입니다.

![exec3](/images/2022-07-24-springboot-setup-onmac/exec3.png)

서버 응답도 제대로 오네요. 
아직 뷰파일이 없기 때문에 에러는 무시하셔도 됩니다.

여기까지 mac에서 vscode 로 스프링부트 개발 환경을 세팅해보았습니다.