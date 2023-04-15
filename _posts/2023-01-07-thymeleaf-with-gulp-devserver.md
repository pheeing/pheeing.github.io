---
layout: single
title: "[Spring Boot] Thymeleaf 에서 프론트엔드(css,js) 개발환경 자동화하기 (gulp)"
categories: springboot
tag: [spring boot, vscode, setting, thymeleaf, sass, scss, js, devserver, gulp, 스프링부트, 타임리프, 사스, 걸프, 자동화, 개발환경]
toc: true
---

## 1. 배경
오늘은 스프링부트, Thymeleaf 템플릿 엔진 환경에서 프론트엔드 개발환경 세팅 방법에 대해서 포스팅 하겠습니다.

많은 외부라이브러리(js)와 css 파일을 따로 관리하면 처음에는 아무문제 없지만 프로젝트가 커지고 그러다 보면 버전관리도 제대로 안되고,

유지보수에도 많은 애로사항이 생길 수 있습니다.

지금 제가 소개하는 방법은 gulp (task-runner) 를 활용하여 프론트엔드 전반의 정적 파일들을 관리하고 자동화하여 

개발시에도 편리하게 개발 할 수 있고, 배포시에도 build.gradle 파일을 수정하여 배포 역시 간단히 할 수 있는 방법에 대해서 소개해 드리겠습니다.

이 방법으로 개발을 하게 된다면 js 파일들은 전부 같은 폴더에서 관리하고 필요한 모듈들은 npm 에서 찾아서 인스톨하며 버전관리를 할 수 있게 됩니다.

css 도 전부 sass 문법으로 개발하게 되며 자동 watch 기능과 빌드 또한 가능 하도록 구성하였습니다.

이렇게 하면 vue, react 와 같이 개발환경또한 devserver로 자동화하여 편하게 변경사항을 자동으로 리프레시 하며 개발 할 수 있습니다.

## 2. 준비
### 2.1 지난번 포스팅 했던 프로젝트로진행
지난번에 포스팅했던 Thymeleaf 에서 sass 사용하기 (gulp) 

에 나왔던 프로젝트로 작업을 하겠습니다.

우선 제가 했던 방식대로 하려면 babel을 사용하기 때문에

gulpfile.js 를 gulpfile.babel.js 로 변경해줍니다.

그리고 안에 있던 문법들도 require 가 아닌 import로 전부 바꿔 줍니다.

아니면 나중에 gulpfile.babel.js 내용을 공유해 드릴테니 복사 하시면됩니다.

### 2.2 의존성 설치
지난번 프로젝트에서 

**package.json** 파일만 아래와 같이 변경해줍니다.
```json
{
  "name": "task-runner",
  "version": "1.0.0",
  "description": "Thymeleaf with Gulp",
  "type": "module",
  "scripts": {
    "dev": "gulp dev",
    "build": "gulp build --env production"
  },
  "author": "chloe kang",
  "license": "MIT",
  "devDependencies": {
    "@babel/core": "^7.18.9",
    "@babel/preset-env": "^7.18.9",
    "@babel/register": "^7.18.9",
    "babelify": "^10.0.0",
    "browser-sync": "^2.27.11",
    "browserify": "^17.0.0",
    "del": "^7.0.0",
    "gulp": "^4.0.2",
    "gulp-autoprefixer": "^8.0.0",
    "gulp-cache": "^1.1.3",
    "gulp-environments": "^1.0.1",
    "gulp-image": "^6.3.1",
    "gulp-sass": "^5.1.0",
    "gulp-streamify": "^1.0.2",
    "gulp-uglify": "^3.0.2",
    "gulp-uglifycss": "^1.1.0",
    "sass": "^1.56.1",
    "uglifyify": "^5.0.2",
    "vinyl-source-stream": "^2.0.0",
    "watchify": "^4.0.0"
  }
}
```

일단 제가 생각하는 초기세팅에서 필요한 것들로만 구성했으며 

필요시 알아서 추가 삭제 해서 사용하면 됩니다.

**package.json** 을 변경하였으면 의존성 설치를 해줍시다.

```bash
npm install
```

하면 알아서 노드 모듈들이 설치 됩니다.

### 2.3 gulp파일 세팅
모듈들 설치가 끝났다면 gulp파일 역시 변경해줍니다.

gulp 파일에 대해서 간략하게 설명하고 넘어 가겠습니다.

gulp 는 node 기반의 타스크러너 이고, 웹 개발에 수반되는 시간 소모적이고 반복되는 태스크들을 자동화하기 위해 사용됩니다.

이는 반복적이고 노가다성 작업들을 많이 자동화하여 실제 개발할때 편의성을 많이 높일 수 있습니다. webpack 도 같은 역할을 수행하는데 저는 간단한 문법과 사용편의성 때문에 gulp로 이런환경을 구성하였고 현재도 사용중입니다.

소개는 이만 마치고 제가 세팅한 걸프 파일을 공유합니다.

**gulpfile.babel.js** 을 아래와 같이 구성하였습니다.
```js
import gulp from 'gulp';
import browser from 'browser-sync';
import environments from 'gulp-environments';
import { deleteAsync } from 'del';
import uglifycss from 'gulp-uglifycss';
import image from 'gulp-image';
import sass from 'sass';
import gulpSass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import babelify from 'babelify';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import cache from 'gulp-cache';
import uglify from 'gulp-uglify';
import streamify from 'gulp-streamify';
import watchify from 'watchify';

const sassTask = gulpSass(sass);

const browserSync = browser.create();
const production = environments.production;
const proxyUrl = 'localhost:8080';
const paths = {
  img: {
    src: 'gulp-src/img/*',
    dist: 'src/main/resources/static/dist/img/',
  },
  scss: {
    watch: 'gulp-src/sass/**/*.scss',
    src: 'gulp-src/sass/main.scss',
    dist: 'src/main/resources/static/dist/css/'
  },
  js: {
    entry: 'gulp-src/js/main.js',
    watch: 'gulp-src/js/**/*.js',
    src: 'gulp-src/js/**/*.js',
    dist: 'src/main/resources/static/dist/js/',
  }
};

const cleanDist = () => deleteAsync(['src/main/resources/static/dist/']);

const img = () => 
  gulp.src(paths.img.src)
    .pipe(production(image()))
    .pipe(gulp.dest(paths.img.dist));

const scss = () =>
  gulp
    .src(paths.scss.src)
    .pipe(sassTask().on('error', sassTask.logError))
    .pipe(autoprefixer())
    .pipe(production(uglifycss()))
    .pipe(gulp.dest(paths.scss.dist));

const js = () =>
  gulp.src([paths.js.src])
    browserify({
      entries: [paths.js.entry],
      transform: [
        babelify.configure({ presets: ['@babel/preset-env']}),
        ['uglifyify', { global: true }]
      ]
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(streamify(uglify()))
    .pipe(gulp.dest(paths.js.dist));

const devJs = (done) => {
  const devBro = browserify({
    entries: [paths.js.entry],
    cache: {},
    packageCache: {},
    plugin: [watchify],
    transform: [
      babelify.configure({ presets: ['@babel/preset-env']}),
      ['uglifyify', { global: true }]
    ]
  });

  devBro.on('update', devBundle);
  devBro.on('log', function (msg) {console.log(msg);})
  devBro.bundle().pipe(source('bundle.js')).pipe(gulp.dest(paths.js.dist));

  function devBundle() {
    devBro.bundle().pipe(source('bundle.js')).pipe(gulp.dest(paths.js.dist));
  }
  
  done();
};

const devServer = () => {
  browserSync.init({
    proxy: proxyUrl,
  });

  gulp.watch(paths.img.src, gulp.series([img, 'clearCache', reload]));
  gulp.watch(paths.scss.watch, gulp.series([scss, 'clearCache', reload]));
  gulp.watch(paths.js.src, gulp.series([devJs, reload])); 
};

gulp.task('clearCache', function (done) {
  return cache.clearAll(done);
});

const reload = (done) => {
  browserSync.reload();
  done();
}

const prepare = gulp.series([cleanDist, img]);

const assetsProd = gulp.series([scss, js]);

const assetsDev = gulp.series([scss, devJs]);

export const build = gulp.series([prepare, assetsProd]);

export const dev = gulp.series([prepare, assetsDev, devServer]);

```

위와 같이 구성하였고, npm 스크립트에서는 개발과, 빌드 딱 두가지 스크립트로 구성하였습니다.

dev에 속한 타스크들에 대해 설명하자면

**prepare** 타스크 에서는 이전 빌드된 파일들을 삭제하고 이미지를 dist폴더로 옮깁니다.

**assetsDev** 타스크 에서는 sass,js를 빌드해서 dist 폴더로 옮깁니다.

**devServer** 타스크 에서는 실시간으로 sass,js 폴더내의 변화를 감지하고 변경시 자동 리프레시 해줍니다.

build에 속한 타스크는 

**prepare** 는 위와 동일하고

**assetsProd** 타스크는 프로덕션 환경일때만 더 압축하는 스크립트를 추가하여 번들파일의 크기를 줄여줍니다. 이미지또한 압축해서 용량을 줄여줍니다.

간단하게 각 타스크에 대한 설명은 여기서 마치겠습니다.

개발시에는 스프링부트 서버 구동과 함께 
```bash
npm run dev
```
를 다른 터미널로 실행해 주는걸로 개발환경은 끝납니다.

빌드시에는 build.gradle 에서 

걸프 타스크를 호출하도록 변경해줍니다.

**build.gradle** 파일도 아래와 같이 수정해줍니다.
```groovy
plugins {
	id 'java'
	id 'org.springframework.boot' version '2.7.7'
	id 'io.spring.dependency-management' version '1.0.15.RELEASE'
  // npm
  id "com.github.node-gradle.node" version "2.2.3"
}

group = 'com.example'
version = '0.0.1-SNAPSHOT'
sourceCompatibility = '11'

configurations {
	compileOnly {
		extendsFrom annotationProcessor
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
	implementation 'org.springframework.boot:spring-boot-starter-web'
	compileOnly 'org.projectlombok:lombok'
	developmentOnly 'org.springframework.boot:spring-boot-devtools'
	annotationProcessor 'org.projectlombok:lombok'
	testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

tasks.named('test') {
	useJUnitPlatform()
}

// 프론트 task runner 시작
node {
  download = false
  version = '14.17.6' //자신이 사용하는 노드 버전
  nodeModulesDir = file("${projectDir}/")
}
task runGulpBuild(type: NpmTask) {
  dependsOn npmInstall
  args = ['run', 'build']
}

compileJava.dependsOn runGulpBuild
// 프론트 task runner 끝
```
위 스크립트에서도 간단히 설명을 하자면

**plugins** 에서 npm을 사용할 수 있게 node를 추가해주고
```groovy
plugins {
  ...
  // npm
  id "com.github.node-gradle.node" version "2.2.3"
}
```

빌드중 gulp task를 호출하기 위해 마지막에 
```groovy
// 프론트 task runner 시작
node {
  download = false
  version = '14.17.6' //자신이 사용하는 노드 버전
  nodeModulesDir = file("${projectDir}/")
}
task runGulpBuild(type: NpmTask) {
  dependsOn npmInstall
  args = ['run', 'build']
}

compileJava.dependsOn runGulpBuild
// 프론트 task runner 끝
```
와 같이 세팅해주면 java를 컴파일하기전에 

```bash
npm run build
``` 

명령어를 호출하여 자동 빌드하게 됩니다.

추가적으로 루트 폴더에 두가지 파일을 더 만듭니다.

**.babelrc**
```js
{
  "presets": [
    "@babel/preset-env"
  ]
}
```

**.browserslistrc**
```js
# Browsers that we support

last 2 versions
```

추가적으로 

**.gitignore** 파일도 수정해줍니다.
```bash
# task-runner
node_modules
src/main/resources/static/dist
```

여기까지 오면 모든 준비는 끝났습니다.

## 4. 실행 및 테스트
### 4.1 준비
일단 테스트를 위해서 간단하게 js 파일도 작성하겠습니다.

우선폴더 구조는 아래와 같습니다.

**gulp-src**

![gulpSrc](/images/2023-01-07-thymeleaf-with-gulp-devserver/gulp-src.png)

프로젝트 루트에 추가된 파일들 구조

**프로젝트루트**

![rootFiles](/images/2023-01-07-thymeleaf-with-gulp-devserver/root-files.png)

위와 같은 구조가 되면 되는것이구요.

sass는 저번에 작성한걸로 쓰고 이미지는 간단하게 제가 비행기타면서 찍은 야경사진입니다.

js는 간단하게 덧셈 모듈을 만들었다고 합시다.

**gulp-src/js/math/index.js**
```js
const add = (a, b) => {
  return a + b + 10
}

export default {
  add
}
```
그냥 간단하게 두수를 더한후 10을 더하는 함수를 만들었다고 가정합니다.

그리고 **main.js** 도 작성해줍니다.

**gulp-src/js/main.js**
```js
import math from './math';

(function () {
  window.myModule = {
    math
  }
})();
```
간단하게 각 폴더 모듈을 취합해서 하나의 객체로 리턴하는 구조로만 만들었습니다.

마지막으로 index.html 도 수정해줍니다.

**index.html**
```html
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="ko">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link th:href="@{/dist/css/main.css}" rel="stylesheet">
  <script th:src="@{/dist/js/bundle.js}" type="text/javascript"></script>
  <title> 타임리프와 걸프 개발환경 </title>
</head>
<body>
  <h1>여기는 인덱스</h1>
  <img th:src="@{dist/img/air-photo1.png}" alt="비행기야경">
  <script>
    const div = document.createElement('div')
    div.textContent = myModule.math.add(10,10)
    document.querySelector('h1').after(div)
  </script>
</body>
</html>
```

### 4.2 스프링부트실행, 걸프스크립트실행

이제 스프링 부트를 실행하고, 다른 터미널 창에서 걸프스크립트 역시 실행합니다.

```bash
npm run dev
```

![gulpDev](/images/2023-01-07-thymeleaf-with-gulp-devserver/gulp-dev.png)

위와같이 잘 되는걸 확인했습니다.

사이트도 정상 작동되는걸 확인해줍니다.

![localhost](/images/2023-01-07-thymeleaf-with-gulp-devserver/localhost.png)

### 4.3 개발시 자동 리프레시 확인 

이 프론트엔드 자동화 개발환경을 누리려면 3000 번으로 접속해야합니다.

sass 파일에서 간단히 색상을 바꾸는것과,

js 모듈에서 더하기 10 이 아닌 20으로 바꾸어 보겠습니다.

테스트한 영상입니다. 

![testGulp](/images/2023-01-07-thymeleaf-with-gulp-devserver/test-gulp.gif)

이렇게 걸프(gulp) 를 이용한 개발환경 세팅을 해보았습니다.

이렇게 하면 서버 비동기 호출도 axios 를 사용 할 수 있으며,

다른 모든 npm 라이브러리도 쉽게 가져와서 모듈화하고 버전관리 또한

할 수 있습니다.

### 4.4 배포시 스크립트 활용

배포 역시 스크립트로 자동화하였기 때문에 따로 신경 쓸것이 없습니다.

**윈도우(Windows)** 유저라면 프로젝트 루트에서

```bash
gradlew.bat build
```

명령어를 실행하면 프론트 정적 빌드 명령어 까지 자동 적용되기 때문에

빌드된 jar 만 운영서버로 배포하면 됩니다.

**맥(Mac)** 유저라면 프로젝트 루트에서

```bash
./gradlew build
```

명령어를 실행하면 됩니다.

빌드된 JAR 는 **/build/libs**  에 찾을 수 있습니다.

다음에는 thymeleaf 환경에서 axios 를 활용 하는 방법에 대하여 포스팅 하겠습니다.

완성된 프로젝트 git 주소는 아래와 같습니다.

[샘플프로젝트](https://github.com/pheeing/springboot-thymeleaf-gulp-tutorial)
