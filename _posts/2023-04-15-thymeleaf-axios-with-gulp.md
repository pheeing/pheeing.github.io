---
layout: single
title: "[Spring Boot] Thymeleaf 에서 axios 사용하기 (gulp)"
categories: springboot
tag: [spring boot, vscode, setting, thymeleaf, axios, gulp, 스프링부트, 타임리프, 엑시오스, 걸프, ajax]
toc: true
---

## 개요
지난번 포스팅 [자동화 세팅 포스팅](/springboot/thymeleaf-with-gulp-devserver/) 에 이은 

Thymeleaf 템플릿엔진 환경에서 axios 활용하기에 대한 포스팅입니다.

제가 웹개발을 한참 공부 할때 AJAX 라는 용어가 등장했습니다. 
AJAX 는 (Asynchronous JavaScript And XML) 의 약자로, 
용어 그대로 서버와 비동기적으로 통신할 수 있게 만드는 웹개발 기법입니다.

ajax 등장이후 많은부분이 폼서브밋방식(동기) 이 아닌 비동기 호출로직으로 작성하게 되었습니다. 
ajax 기술을 구현하기 위해 기본 브라우저 내장 XMLHttpRequest 객체를 활용하기도 했지만, 
대부분은 더 쉽고 기능이 많은 라이브러리를 많이 사용하였습니다. 그중 하나가 바로 jQuery 이구요.

ajax 역시 jQuery 로 작성된 경우가 많았습니다. 과거에는 많이 각광받는 라이브러리 이기도 했습니다.

```javascript
$.ajax({
  url: someUrl,
  type: "POST",
  data: someData,
})
```
위와 같은 패턴 레거시에서는 엄청 자주 볼 수 있습니다.

하지만 최근들어 ES6 이후에 jQuery 에서 제공하는 ajax 포함한 대부분은 vanilla javascript 로도 작성할수있게 되었고, 성능 또한 바닐라 js 가 훨씬 좋습니다.

저도 그래서 최근에는 왠만한건 바닐라 자바스크립트 로 구현하는 경항이 많아졌고, 진행하는 모든 프로젝트에서 jQuery 의존성을 많이 걷어내기 시작했습니다. 

물론, jQuery 가 나쁜 라이브러리 라는것은 절대 아닙니다. 하지만 저의 경우는 이제는 거의 쓰지 않고 레거시 소스를 다룰때만 가끔씁니다.

그래서 생긴 고민이 Thymeleaf 환경에서는 ajax를 뭘로 구현할까 하다가 jQuery의 대안을 찾다가 생각해낸게 axios 이고, 실제로 프로젝트에 적용해서 잘 쓰고 있습니다.

## 준비
### 지난번 포스팅 했던 프로젝트로진행
지난번에 포스팅했던 개발환경 자동화하기 에 나왔던 프로젝트로 작업을 하겠습니다.

axios 를 모듈로 작성해서 사용해야 하기때문입니다. 그래야 사용하기도 편하고 모듈화 할 수 있기 때문입니다.

### axios 모듈만들기
이미 지난번 포스팅에서 환경을 다 구성했기 때문에 axios를 사용할 모듈만 만들어 주면 됩니다.

모듈을 만들면 각 화면단에서는 이전과 같은 형식으로도 구현할수 있고, Promise 패턴으로도 구현 할 수 있습니다.

우선 프로젝트 루트에서 모듈을 설치합니다. 우리는 모듈로만 쓰기때문에 개발 의존성으로만 설치하면됩니다.
```bash
npm install -D axios
```
그러면 **package.json** 에 의존성이 추가됩니다.
```json
  "devDependencies": {
    
    "axios": "^0.27.2",
    
  }
```

의존성을 추가했으면 이제 모듈을 만들어 주면 됩니다. 저는 api라는 폴더를 만들고 index.js 를만들었습니다.
모듈이름 같은경우는 알아서 정하면 됩니다.

**gulp-src/js/api/index.js**
```javascript
import axios from 'axios'

axios.defaults.withCredentials = true
axios.defaults.baseURL = '/api'

export default {
  get ({ path, data, success, error }) {
    return axios.get(`${path}`, data, { withCredentials: true })
            .then(res => {
              if(success && typeof success === 'function') success(res.data)
            })
            .catch(err => {
              if(error && typeof error === 'function') error(err)
            })
  },
  post ({ path, data, success, error }) {
    return axios.post(`${path}`, data, { withCredentials: true })
            .then(res => {
              if(success && typeof success === 'function') success(res.data)
            })
            .catch(err => {
              if(error && typeof error === 'function') error(err)
            })
  }
}
```
모듈을 구현할때 두가지 선택지가 있습니다. 예전 레거시 스타일을 고려해서 콜백 스타일로 디자인 할지 
아니면 Promise 패턴으로 구현할지요. 일단 위의 예제는 콜백 스타일로 구현을 한 예제 입니다.

만약 Promise 패턴을 그대로 쓰고 쉽다면 모듈을 이렇게 바꾸면 됩니다.

**gulp-src/js/api/index.js**
```javascript
import axios from 'axios'

axios.defaults.withCredentials = true
axios.defaults.baseURL = '/api'

export default {
  get ({ path, data }) {
    return axios.get(`${path}`, data, { withCredentials: true })
  },
  post ({ path, data }) {
    return axios.post(`${path}`, data, { withCredentials: true })
  }
}
```
혹시 익스플로러 나 하위 호환성이 중요하면 콜백으로 가면될거고 그거는 개발하는 환경에 따라 다르니 적절히 
선택해서 쓰면 됩니다.

그리고 main.js 에도 추가해줍니다.

**gulp-src/js/main.js**
```javascript
import math from './math';
import api from './api';

(function () {
  window.myModule = {
    math,
    api
  }
})();
```



컨트롤러 구현전에 요청이나 응답받을 dto 도 하나 구현해줍니다.
**TestDto.java**
```java
package com.example.gulp;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TestDto {
  private String name;
  private String text;
}

```

컨트롤러도 하나 만들어서 rest api 하나 구현해봅니다.

**IndexController.java**
```java
package com.example.gulp;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class IndexController {
  
  @RequestMapping("/")
  public String index(Model model) {
    return "index";
  }

  @ResponseBody
  @RequestMapping("/api/test1")
  public String test1(@RequestBody TestDto testDto) {
    System.out.println("testDto.getName() = " + testDto.getName());
    System.out.println("testDto.getText() = " + testDto.getText());
    return "api success";
  }

  @ResponseBody
  @RequestMapping("/api/test2")
  public TestDto test2() {
    TestDto returnDto = new TestDto();
    returnDto.setName("test2 name");
    returnDto.setText("test2 text");
    return returnDto;
  }
}
```

html도 버튼 두가지만 추가하죠
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
  <button id="test1">테스트1</button>
  <button id="test2">테스트2</button>
  <script>
    const div = document.createElement('div')
    div.textContent = myModule.math.add(10,10)
    document.querySelector('h1').after(div)

    document.querySelector('#test1').addEventListener('click', () => {
      myModule.api.post({
        path: '/test1',
        data: {
          name: 'testName',
          text: 'some Text'
        }
      }).then(data => {
        console.log(data)
      }).catch(err => {
        console.log(err)
      })
    })

    document.querySelector('#test2').addEventListener('click', () => {
      myModule.api.post({
        path: '/test2',
        data: {}
      }).then(data => {
        console.log(data)
      }).catch(err => {
        console.log(err)
      })
    })

  </script>
</body>
</html>
```
간단하죠?
이제 모든 준비는 끝났습니다. 파일다운로드 라던지 업로드 같은 경우도 모듈로 구현해서 쓰면 편합니다.

## 실행 및 테스트
이제 모듈을 만들었으니 실제 화면단에서 테스트를 해봅시다.

스프링부트를 띄우고, 다른터미널에서 npm run dev 를 실행합니다.

그러면 아래와 같이 뜹니다.
![testButtons](/images/2023-04-15-thymeleaf-axios-with-gulp/test-buttons.png)

각 버튼을 눌러서 제대로 구현이 되었는지 확인합니다.

![test1-log](/images/2023-04-15-thymeleaf-axios-with-gulp/test1-log.png)

브라우저 개발자 도구에선 정상 요청 완료되었네요.

![test1-console](/images/2023-04-15-thymeleaf-axios-with-gulp/test1-console.png)

콘솔로그도 정상적으로 찍혔구요.

![test1-server-log](/images/2023-04-15-thymeleaf-axios-with-gulp/test1-server-log.png)

서버로그 역시 의도한 대로 동작합니다.

두번째 버튼도 테스트해봅시다.

![test2-log1](/images/2023-04-15-thymeleaf-axios-with-gulp/test2-log1.png)

응답은 맞게 왔고,

![test2-console](/images/2023-04-15-thymeleaf-axios-with-gulp/test2-console.png)

콘솔로그도 정상적으로,

![test2-log2](/images/2023-04-15-thymeleaf-axios-with-gulp/test2-log2.png)

데이터도 맞게 왔네요.

axios 를 모듈로 활용한다면 활용할수 있는 방법이 매우 많으니 적절히 활용하시면됩니다.
인터셉터 추가라던지 csrf 토큰 추가 같은경우도 모듈로 처리 하면 편합니다.

오늘의 포스팅은 여기까지 입니다.
