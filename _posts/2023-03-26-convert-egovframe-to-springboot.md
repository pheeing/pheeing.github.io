---
layout: single
title: "[Spring Boot] 전자정부프레임워크 에서 스프링부트 변환 - (1)"
categories: springboot
tag: [spring boot, egovframe, 전자정부, 전자정부프레임워크, 스프링부트, jsp, tiles, thymeleaf, thymeleaf layout]
toc: true
---

## 개요
우리나라 SI/SM 환경은 오래전부터 전자정부 프레임워크 라는 정부 주도로 만들어진 프레임워크 개발된 웹프로그램이 상당히 많다.

전자정부 프레임워크는 등장 당시 중구난방했던 개발환경을 통합한 것에 대해서는 매우 획기적이였고

정부주도로 공공기관 프로젝트부터 필수 사항이 되다 보니 한국에서는 이게 필수 웹개발환경이 되어 버린 케이스라고 하겠다.

물론 처음에는 공공기관 개발환경을 통합을해서 생산성향상에 크게 기여했다는 바는 부정할수 없는 사실이다.

그렇지만 개발업계가 어떤가? 하루에도 수십개의 새로운 기술이 쏟아지고 더나은 패러다임. 더나은 디자인패턴 들이 새로 나온다. 

그러나 전자정부프레임워크는 상당히 과거에 머물러 있고, 업데이트도 매우 더딘편이다.

게다가 새로운 패키지나 라이브러리를 추가하려면 호환성 인증까지 받아야하고, 여러모로 개발 할때는 특정 디자인패턴을 강요받고 짜여진대로만 개발하여야 한다는 점이 큰 단점으로 꼽힌다.

이즈음 수많은 개발업체들은 개발환경을 통합하면 좋으니까 굳이 전자정부프레임워크가 필수가 아니여도 전자정부프레임워크를 남발하며 개발한 웹프로젝트가 상당히 많다.

오늘은 이러한 굳이 안써도 되는 웹프로젝트에 전자정부프레임워크로 개발된 웹프로젝트를 스프링부트 최신환경으로 리팩토링 하는 방법에 대하여 서술하고자 한다.

## 분석
기존의 개발된 레거시 프로젝트에서 사용하는 기술에 대하여 분석을 해본다.

아마도 왠만하면 다 비슷한 기술을 썻을 것으로 생각된다.

### maven
아마 빌드관련 툴은 메이븐을 썻을확률이 높다.

우리는 gradle 로 바꾼다.

### jsp (tiles)
화면단은 일반적으로 jsp를 사용할 것이다.

정부프로젝트가 아닌데도 넥사크로 나 웹스퀘어 같은걸 쓸리가없다.

왜냐면 매우 비싸기 때문이다.

일단 jsp 인경우만 생각하겠다.

그리고 레이아웃은 아마도 tiles 로 구성했을 확률이 매우높다.

우리는 이것을 thymeleaf layout으로 구현한다.

### mybatis
아마 데이터베이스 액세스는 십중팔구 마이바티스를 썻을것이다.

우리는 이것을 spring data jpa, querydsl 형식으로 변환 할 것이다.

### jFile
전자정부 프레임워크에 포함된 파일관련 패키지인데

이것은 새로 구현하면된다.

### jQuery
아마 jQuery를 엄청 많이 썻을것이다.

우리는 이것을 다 걷어낸다.

### pdf
정부프로젝트면 십중팔구 오즈리포트 썻을확률이 높지만

이프로젝트는 그냥 html을 pdf로 출력하는 방식이다.

우리는 이것을 pdfmake 로 만든다.

## 리팩토링
### 신규 프로젝트 생성
일단 신규 프로젝트 생성하는것 만으로

빌드툴은 해결된다.

![projectSetting](/images/2023-03-26-convert-egovframe-to-springboot/project-setting.png)

위와같이 세팅하면 빌드툴은 해결된다

### thymeleaf layout 설정
기존 jsp , tiles 레이아웃을 분석해야한다.

아마 tiles로 구현을 했더라도 각 레이아웃별로 구분이 되어있을것이다.

(일반사용자, 관리자 등등...)

이렇게 구분되어 있는 레이아웃을 thymeleaf layout으로 1:1로 매칭 시켜주면된다.

우선 타임리프 레이아웃 설정을 위해서

**build.gradle** 파일을 수정해줍니다.
```groovy
dependencies {
  ...  

  // Thymeleaf Layout
  implementation 'nz.net.ultraq.thymeleaf:thymeleaf-layout-dialect'

  ...
}
```

### fragments 설정
타임리프에는 프레그먼트라는 기능이 있는데 저 같은 경우는 이걸 또 용도 별로 쪼개서 적용하였습니다.

**fragments/header.html**
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
  <th:block th:fragment="user-header-fragment">
    <p>헤더 프레그먼트</p>
  </th:block>
</html>
```

**fragments/footer.html**
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
  <footer th:fragment="user-footer-fragment">
    <p>푸터 프레그먼트</p>
  </footer>
</html>
```

**fragments/imports.html**
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org">
  <head th:fragment="user-imports-fragment">
    <script th:src="@{/dist/js/bundle.js}" type="text/javascript"></script>
  </head>
</html>
```

이런식으로 프레그먼트 설정을 하면 각 레이아웃별로 프레그 먼트를 늘려서 설정하면됩니다.

### layout 설정
레이아웃설정인데 레이아웃 파일에 각 프레그먼트를 끼워넣는 식으로 구성하면됩니다.

저는 각 커스텀 스크립트의경우 하단으로 따로 분리하여 작성하게끔해서

스크립트코드와 html 마크업을 구분하였습니다.


**layouts/userLayout.html**
```html
<!DOCTYPE html>
<html lang="ko" xmlns:th="http://www.thymeleaf.org" xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title layout:title-pattern="$CONTENT_TITLE | $LAYOUT_TITLE">프로젝트이름</title>

    <th:block th:replace="fragments/imports :: user-imports-fragment"></th:block>

    <link rel="shortcut icon" th:href="@{/dist/images/favicon.ico}">
    <link rel="icon" type="image/png" sizes="16x16" th:href="@{/dist/images/favicon-16x16.png}">
    <link rel="icon" type="image/png" sizes="32x32" th:href="@{/dist/images/favicon-32x32.png}">

    <th:block layout:fragement="custom-style"></th:block>
  </head>

  <body>
    <th:block th:replace="fragments/header :: user-header-fragment"></th:block>

    <th:block layout:fragment="custom-content"></th:block>

    <footer th:replace="fragments/footer :: user-footer-fragment"></footer>
    
    <th:block layout:fragment="custom-script"></th:block>
  </body>
</html>
```

### 각각의 페이지설정
위의 설정까지 적용하면 하나의 레이아웃이 끝나게 됩니다.

간단하게 인덱스의 페이지 코딩을 해보고 띄워보겠습니다.

**pages/index.html**
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:layout="http://www.ultraq.net.nz/thymeleaf/layout"
      layout:decorate="~{layouts/userLayout}">

  <head>
    <title>인덱스 타이틀</title>
  </head>
  <body>
    <th:block layout:fragment="custom-content">
      <h1>인덱스 본문1</h1>
      <h3>인덱스 본문3</h1>
    </th:block>
  </body>
</html>

<script type="text/javascript" layout:fragment="custom-script">
  'use strict'
  console.log('스크립트')
</script>
```

이렇게 하면 유저레이아웃이 설정이 끝나고 각 개별페이지 역시 인덱스만 적용이 됩니다.

한번 띄워보면

![thymeleafLayout1](/images/2023-03-26-convert-egovframe-to-springboot/thymeleaf-layout1.png)

잘 나오네요.

이 형식으로 기존 스타일과 html 마크업을 적용해주면 코드도 깔끔하게 리팩토링 할 수 있습니다.

전체적인 폴더 구조는 아래와 같습니다.

![thymeleafLayout2](/images/2023-03-26-convert-egovframe-to-springboot/thymeleaf-layout2.png)

커스텀 자바스크립트도 잘동작하네요.

![thymeleafLayout3](/images/2023-03-26-convert-egovframe-to-springboot/thymeleaf-layout3.png)

오늘은 jsp (tiles) 를 thymeleaf layout 으로 리팩토링 하는 방법까지 포스팅하겠습니다.

나머지 기술스택 변환 방법에 대해서는 다음 포스팅에서 논의하죠.