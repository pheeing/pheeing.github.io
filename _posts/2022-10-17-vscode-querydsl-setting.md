---
layout: single
title: "[Spring Boot] vscode 에서 querydsl 세팅"
categories: springboot
tag: [spring boot, vscode, setting, querydsl, spring data jpa]
toc: true
---

## 1. 배경
오늘은 vscode 환경에서 querydsl 세팅하는 방법에 대해서 포스팅 하겠습니다.

요즘 스프링부트로 웹개발을 하게 되면 mybatis 보다는 스프링 데이터 JPA 와 querydsl 조합으로 많이 개발하게 됩니다. 

근데 보통 스프링부트와 JPA 로 개발하면 거의다 이클립스나 STS 또는 인텔리제이로 많이 개발하게 됩니다. 그래서 많은 레퍼런스도 거기에 초점이 맞춰져 있습니다.

저는 vscode 의 장점이 너무 많기 때문에 이 장점을 버리고 싶지 않아서 여러 시행 착오 끝에 해결책을 찾아내었고 잘 사용하고 있습니다.

## 2. 준비
### 2.1 스프링데이터 JPA 세팅
스프링 데이터 JPA는 특별한 준비사항이 없습니다.
처음 스타터에서 선택하면 `build.gradle` 에 자동으로 의존성이 추가 됩니다.

```groovy
dependencies {
  ...
  implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
  ...
}
```

### 2.2 Querydsl 세팅
Querydsl 은 `build.gradle` 에 수동으로 몇가지 세팅이 필요합니다. 현재 방법은 스프링 부트 2.7.0 이상버전에서 유효합니다.

```groovy
buildscript {
  ext {
    queryDslVersion = "5.0.0"
  }
}

plugins {
  ...
  // querydsl
  id "com.ewerk.gradle.plugins.querydsl" version '1.0.10'
  ...
}

dependencies {
  ...
  // querydsl
  implementation "com.querydsl:querydsl-jpa:${queryDslVersion}"
  annotationProcessor "com.querydsl:querydsl-apt:${queryDslVersion}"
  ...
}
```
`build.gradle` 에 위와 같이 각 항목에 추가해 주시고 하단에 아래 스크립트를 추가합니다.

```groovy
// querydsl 추가 시작
def querydslDir = "$buildDir/generated/querydsl"

querydsl {
  jpa = true
  querydslSourcesDir = querydslDir
}
sourceSets {
  main.java.srcDir querydslDir
}
configurations {
  compileOnly {
    extendsFrom annotationProcessor
  }
  querydsl.extendsFrom compileClasspath
}
compileQuerydsl {
  options.annotationProcessorPath = configurations.querydsl
}
// querydsl 추가 끝
```
`build.gradle` 에 위 의존성과 버전 및 스크립트를 추가하면 빌드.그래들 에서의 설정은 끝납니다.
추가로 gradle 익스텐션을 설치하여 q클래스 빌드를 해줍니다.

![gradleExtension](/images/2022-10-17-vscode-querydsl-setting/gradleextension.png)

위 익스텐션을 찾아서 설치해주시고
아래의 명령어를 눌러줍니다.

![compileQuerydslEdited](/images/2022-10-17-vscode-querydsl-setting/compileQuerydslEdited.png)

그러면 콘솔에 아래와 같이 성공이 뜨면 성공입니다.
(이작업을 하기전에 엔티티 설정은 완료 되어있어야합니다.)

![builtQuerydsl](/images/2022-10-17-vscode-querydsl-setting/builtQuerydsl.png)

## 3. 스프링부트 프로젝트실행 
이제 모든 준비가 끝났습니다. 프로젝트를 실행하고 querydsl을 사용한 기능을 확인해 봅니다.

![classnotfoundweb](/images/2022-10-17-vscode-querydsl-setting/classnotfoundweb.png)

분명히 다 맞게 세팅했는데 아래와 같은 에러가 뜨실겁니다.

![classnotfoundedited](/images/2022-10-17-vscode-querydsl-setting/classnotfoundedited.png)

에러내용은 q클래스를 찾을 수 없다고 나오네요.
사실 이부분에서 vscode를 못쓰는거 아닐까 정말 많은 삽질을 했고 구글링을 많이 했었습니다. 

혹자는 자바익스텐션 버그때문이라 자바익스텐션 버전을 바꿔야 한다.  
혹자는 그래들설정을 바꿔야 한다.  
등등 다양한 의견을 다 시도해 봤지만 다 실패 했었고, 그러다가 클래스를 못찾는 근본적인 원인은 클래스패스가 잘못 설정되었다는 생각이 들었습니다.  

vscode 자바프로젝트에는 .classpath 파일이 생성되지 않는 사실을 알아냈고.

임의로 .classpath 파일 생성을 통해 문제를 해결했습니다.

프로젝트 루트 경로에 
`.classpath` 파일을 생성하고 아래와 같이 내용을 입력하세요.

```xml
<?xml version="1.0" encoding="UTF-8"?>
  <classpath>
  <classpathentry kind="src" output="bin/main" path="src/main/java">
    <attributes>
      <attribute name="gradle_scope" value="main"/>
      <attribute name="gradle_used_by_scope" value="main,test"/>
    </attributes>
  </classpathentry>
  <classpathentry kind="src" output="bin/querydsl" path="build/generated/querydsl">
    <attributes>
      <attribute name="gradle_scope" value="main"/>
      <attribute name="gradle_used_by_scope" value="main"/>
    </attributes>
  </classpathentry>
  <classpathentry kind="src" output="bin/main" path="src/main/resources">
    <attributes>
      <attribute name="gradle_scope" value="main"/>
      <attribute name="gradle_used_by_scope" value="main,test"/>
    </attributes>
  </classpathentry>
  <classpathentry kind="src" output="bin/test" path="src/test/java">
    <attributes>
      <attribute name="gradle_scope" value="test"/>
      <attribute name="gradle_used_by_scope" value="test"/>
      <attribute name="test" value="true"/>
    </attributes>
  </classpathentry>
  <classpathentry kind="con" path="org.eclipse.jdt.launching.JRE_CONTAINER/org.eclipse.jdt.internal.debug.ui.launcher.StandardVMType/JavaSE-11/"/>
  <classpathentry kind="con" path="org.eclipse.buildship.core.gradleclasspathcontainer"/>
  <classpathentry kind="output" path="bin/default"/>
</classpath>
```

이렇게 하면 정상적으로 개발이 가능합니다. 엔티티가 수정되고 querydsl을 재컴파일하면 
두번째 엔트리 내용이 자동으로 바뀌는데 그부분만 **main** 으로 바꾸면 됩니다.

```xml
...
<classpathentry kind="src" output="bin/querydsl" path="build/generated/querydsl">
  <attributes>
    <attribute name="gradle_scope" value="querydsl"/>
    <attribute name="gradle_used_by_scope" value="querydsl"/>
  </attributes>
</classpathentry>
...
```
위와같이 바뀌어 있는경우 범위를 다시 main으로 변경만 하면 다시 정상 동작합니다.