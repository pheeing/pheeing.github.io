---
layout: single
title: "[Spring Boot] vscode 개발 환경 구축하기 (Windows)"
categories: springboot
tag: [spring boot, vscode, setting, windows, 스프링부트]
toc: true
---

## 1. 배경
오늘은 스프링부트 개발환경 구축하기에 대해서 포스팅하겠습니다.

이미 mac 용으로 포스팅 했었는데요.

오늘은 windows 유저를 위한

vscode 에서 스프링 부트 개발환경 세팅하는 방법에 대하여 이야기 하겠습니다.

아무것도 설치가 안되어있다고 가정하겠습니다.

## 2. 프로그램설치
### 2.1 vscode 설치
vscode 를 설치 합니다.

우선 구글에서 vscode를 검색해줍니다.

![vscode1](/images/2023-05-21-springboot-setup-onwindows/vscode1.png)

여기서 다운로드로 들어갑니다.

![vscode2](/images/2023-05-21-springboot-setup-onwindows/vscode2.png)

윈도우 인스톨러를 클릭해줍니다.

![vscode3](/images/2023-05-21-springboot-setup-onwindows/vscode3.png)

여기서는 왠만하면 그냥 디폴트 값으로 전부 다음만 눌러주시면됩니다.

PATH도 자동등록된게 디폴트 값인데 그냥 다음 눌러서 완료해 주시면 됩니다.

### 2.2 git 설치
git을 설치 해줍니다. 

mac은 디폴트로 git이 설치 되어있지만 윈도우 유저는 설치를 따로 해야합니다.

우선 구글에서 git을 검색해줍니다.

![git1](/images/2023-05-21-springboot-setup-onwindows/git1.png)

윈도우용 다운로드를 눌러줍니다.

![git2](/images/2023-05-21-springboot-setup-onwindows/git2.png)

본인의 cpu에 맞는걸로 다운로드합니다.

![git3](/images/2023-05-21-springboot-setup-onwindows/git3.png)

중간에 사용자 계정 컨트롤 메시지가 나오면 예를 눌러줍니다.

![git4](/images/2023-05-21-springboot-setup-onwindows/git4.png)

git 인스톨러는 선택할게 매우 많은데 그냥 디폴트 기능으로만 쓰려면 

전부 다음 눌러서 완료해 주면됩니다.

![git5](/images/2023-05-21-springboot-setup-onwindows/git5.png)

깃 설치를 완료합니다.

### 2.3 openjdk 설치
이거는 옵션입니다. 사용하시는 jdk에 따라서 설치 해도되고 안해도됩니다.

이 전에 제가 하는 포스팅에서는 openjdk 11 버전을 사용합니다.

윈도우 버전은 그냥 zip 파일을 받고 적당한 경로에 언집 하고 환경변수만 등록해주면됩니다.

우선 구글에서 openjdk를 검색해줍니다.

그리고 다운로드를 클릭합니다.

![openjdk1](/images/2023-05-21-springboot-setup-onwindows/openjdk1.png)

우리가 설치하려는 버전은 9이상 이기때문에 화살표 방향 링크를 클릭합니다.

![openjdk2](/images/2023-05-21-springboot-setup-onwindows/openjdk2.png)

설치하려는 java 버전을 클릭합니다.

![openjdk3](/images/2023-05-21-springboot-setup-onwindows/openjdk3.png)

화살표방향 윈도우용 jdk를 선택하면 zip 파일이 다운됩니다.

![openjdk4](/images/2023-05-21-springboot-setup-onwindows/openjdk4.png)

적당한 폴더에 압축을 풀고 환경변수를 등록합니다.

`windows + Pause` 단축키를 누르거나

윈도우 탐색기에서 내컴퓨터 - 속성 을 눌러서 

고급 시스템 설정을 클릭합니다.

![openjdk5](/images/2023-05-21-springboot-setup-onwindows/openjdk5.png)

그러면 아래와 같은 화면에서 환경 변수를 클릭해주고

![openjdk6](/images/2023-05-21-springboot-setup-onwindows/openjdk6.png)

새로만들기를 눌러서 아까 압축을 푼 jdk 경로를 지정합니다.

![openjdk7](/images/2023-05-21-springboot-setup-onwindows/openjdk7.png)

그리고 path에도 맨끝에 방금 등록한 `%JAVA_HOME%₩bin` 을 입력해줍니다.

여기까지 끝났다면 `실행 - cmd` 를 누르고 `java -version` 명령어를 쳐봅니다.

```bash
C:₩Users₩cojal>java -version
openjdk version "11.0.0.1" 2023-05-09
OpenJDK Runtime Environment 18.9 (build 11.0.0.1+3-5)
OpenJDK 64-Bit Server VM 18.9 (build 11.0.0.1+3-5, mixed mode)

C:₩Users₩cojal>
```

결과가 제대로 나오면 됩니다.

### 2.4 nodejs 설치
이거는 옵션입니다. 제가 포스팅한 자동 개발환경을 구축하거나 하려면 설치하는게 좋습니다.

우선 구글에서 nodejs를 검색해줍니다.

그리고 다운로드를 클릭합니다.

![nodejs1](/images/2023-05-21-springboot-setup-onwindows/nodejs1.png)

우리가 설치하려는 버전은 14 이기때문에 모든 다운로드 보기를 클릭합니다.

![nodejs2](/images/2023-05-21-springboot-setup-onwindows/nodejs2.png)

해당버전을 찾고 클릭합니다.

![nodejs3](/images/2023-05-21-springboot-setup-onwindows/nodejs3.png)

cpu에 맞는 설치 파일을 누르면 자동으로 다운로드 됩니다.

![nodejs4](/images/2023-05-21-springboot-setup-onwindows/nodejs4.png)

nodejs 도 마찬가지로 디폴트 옵션으로 설치하려면 계속 다음을 누릅니다.

![nodejs5](/images/2023-05-21-springboot-setup-onwindows/nodejs5.png)

중간에 사용자 계정 컨트롤이 나오면 예를 눌러줍니다.

![nodejs6](/images/2023-05-21-springboot-setup-onwindows/nodejs6.png)

설치가 다 끝나면 역시 설치 확인을 해봅니다.

`실행 - cmd` 를 누르고 

`node -v` 명령어와

`npm -v` 명령어를 쳐봅니다.

```bash
C:₩Users₩cojal>node -v
v14.21.3

C:₩Users₩cojal>npm -v
6.14.18
```

노드설치가 완료되었습니다.

## 3. vscode 익스텐션설치
설치 프로그램은 다 끝났습니다.

vscode에서 스프링부트 개발을 위한 익스텐션만 설치해봅니다.

좌측 extension 탭에서 검색을 합니다.

java 로 검색하고 Extension Pack for Java 를 설치합니다.

![extension1](/images/2023-05-21-springboot-setup-onwindows/extension1.png)

spring 으로 검색하고 Spring Boot Extension Pack 을 설치합니다.

![extension2](/images/2023-05-21-springboot-setup-onwindows/extension2.png)

lombok 으로 검색하고 Lombok Annotations Support for VS Code 를 설치합니다.

![extension3](/images/2023-05-21-springboot-setup-onwindows/extension3.png)

gradle 으로 검색하고 Gradle Extension Pack 을 설치합니다.

![extension4](/images/2023-05-21-springboot-setup-onwindows/extension4.png)

이렇게 까지 하면 windows 에서 vscode 로 스프링부트 개발환경이 완료됩니다.

추가적으로 필요한게 있으면 찾아서 설치하여 활용하면 됩니다.
