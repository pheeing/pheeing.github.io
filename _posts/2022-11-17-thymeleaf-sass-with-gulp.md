---
layout: single
title: "[Spring Boot] Thymeleaf 에서 sass 사용하기 (gulp)"
categories: springboot
tag: [spring boot, vscode, setting, thymeleaf, sass, gulp]
toc: true
---

## 1. 배경
오늘은 스프링부트, Thymeleaf 템플릿 엔진 환경에서 sass 개발 세팅 방법에 대해서 포스팅 하겠습니다.

스프링부트와 잘어울리는 thymeleaf 템플릿엔진 환경으로 개발하다 보면, sass 환경이라던지 js 모듈관리가 안되어서 답답할 때가 있습니다.

이때 좋은 대안중 하나는 gulp를 이용하며 task를 작성하고 자동화하면 vue나 react, node 로 개발할때와 같은 자동화 환경을 구축 할 수 있습니다.

그래서 이번 포스팅에서는 gulp를 이용한 개발환경을 세팅하고 sass 개발환경을 구축을 해보겠습니다.

## 2. 준비
### 2.1 샘플 프로젝트 생성
우선 스프링 부트 스타터에서 프로젝트를 생성해줍니다.

저는 아래와 같은 사양으로 프로젝트를 생성하였습니다.

![projectSetting](/images/2022-11-17-thymeleaf-sass-with-gulp/project-setting.png)

### 2.2 간단한 컨트롤러와 페이지 준비
간단하게 인덱스 컨트롤러와 인덱스 템플릿을 만들어 줍니다.

컨트롤러는 아래와 같이 간단히 작성해줍니다.

**IndexController.java**
```java
package com.example.gulp;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class IndexController {
  
  @RequestMapping("/")
  public String index(Model model) {
    return "index";
  }
}
```

페이지는 아래와 같이 간단히 작성해줍니다.

**templates/index.html**
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>index</title>
</head>
<body>
  <h1>여기는 인덱스</h1>
</body>
</html>
```

### 2.3 동작 테스트
작성이 끝났으면 일단 제대로 되는지 테스트를 해봅시다.

localhost:8080 으로 접속해 봅시다.

![projectTest](/images/2022-11-17-thymeleaf-sass-with-gulp/project-test.png)

## 3. Gulp 세팅
### 3.1 npm init
gulp 세팅을 하기 위해 npm init 명령어를 사용하여 package.json 파일을 만듭니다.

이 과정을 진행하려면 node 와 npm 설치는 필수 입니다.

참고로 저는 node 14 버전을 사용하고 있습니다.

프로젝트 루트 경로에서 **npm init** 명령어를 실행합니다.

실행 직후 프로젝트 폴더 구조는 아래와 같습니다.

![npmInit](/images/2022-11-17-thymeleaf-sass-with-gulp/npm-init.png)

### 3.2 gulp 의존성 및 sass 의존성 설치
이제 준비는 거의 다 끝났습니다.

이제 필요한것은 gulp 세팅과 sass 세팅입니다.

gulp 세팅을 위해서 package.json 이 설치된 위치에 gulpfile.js 파일을 만들어줍니다.

어차피 개발중에만 사용할 것이기때문에 전부 -D 옵션으로 설치해 줍니다.

필요한 패키지는 아래와 같습니다.

gulp, gulp-sass, sass

혹시 npm init를 실행 하였을 때 엔터 연타하였다면 이름이 같아서 아래와 같은 에러가 뜰 수도 있는데

```shell
-> % npm install gulp -D
npm ERR! code ENOSELF
npm ERR! Refusing to install package with name "gulp" under a package
npm ERR! also called "gulp". Did you name your project the same
```

그럴때는 package.json 의 name 프로퍼티를 수정해줍니다.

```json
{
  "name": "task-runner",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build:sass": "gulp buildSass"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "gulp": "^4.0.2",
    "gulp-sass": "^5.1.0",
    "sass": "^1.56.1"
  }
}
```

그리고 gulpfile.js 파일도 세팅해줍니다.

```js
const { src, dest } = require('gulp');
const sass = require('sass');
const gulpSass = require('gulp-sass');

const sassTask = gulpSass(sass);

exports.buildSass = function() {
  return src('gulp-src/sass/main.scss')
    .pipe(sassTask().on('error', sassTask.logError))
    .pipe(dest('src/main/resources/static/dist/css/'));
}
```

저는 임의로 gulp 의 소스폴더를 분리했습니다. 

경로는 아래와 같습니다.

프로젝트루트 - gulp-src - sass - main.scss

### 3.3 index.html 수정및 sass 파일작성
index.html 을 아래와 같이 수정해줍니다.

**templates/index.html**
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="ko">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link th:href="@{/dist/css/main.css}" rel="stylesheet">
  <title>index</title>
</head>
<body>
  <h1>여기는 인덱스</h1>
</body>
</html>
```

main.scss 파일을 작성해줍니다.

**gulp-src/sass/main.scss**
```scss
$primary-color: red;

h1 {
  color: $primary-color;
}
```

최종 폴더 구조는 아래와 같습니다.
![project-gulp](/images/2022-11-17-thymeleaf-sass-with-gulp/project-gulp.png)

## 4. 실행 및 테스트
### 4.1 npm script 실행
이제 npm run build:sass 명령어를 실행하면 자동으로 css 파일로 빌드 됩니다. 

직접 npm 명령어를 실행해 보고 다시 결과를 확인해줍니다.

### 4.2 결과 확인
![projectTest2](/images/2022-11-17-thymeleaf-sass-with-gulp/project-test2.png)

위와같이 잘 되는걸 확인했습니다.

직접 빌드된 css 파일을 확인하실수도 있습니다.

오늘은 이렇게 Thymeleaf 에서 sass 사용하기 세팅을 해보았습니다.

아주 기초적인 세팅이라 아직은 사용하기에 많이 불편합니다.

그래서 다음 포스팅 때는 js 및 데브 서버를 이용한 자동화 세팅에 대하여 포스팅 하겠습니다.
