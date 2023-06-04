---
layout: single
title: "[Spring Boot] 전자정부프레임워크 에서 스프링부트 변환 - (3)"
categories: springboot
tag: [spring boot, egovframe, 전자정부, 전자정부프레임워크, 스프링부트, jQuery, vanilla javascript, pdfmake, jspdf]
toc: true
---

## 리팩토링
저번 포스팅에 이어서 리빌딩을 해보려고 합니다.

지난번 포스팅은 [전자정부프레임워크 에서 스프링부트 변환 - (2)](/springboot/convert-egovframe-to-springboot2/)

에서 확인할 수 있습니다.

오늘 포스팅으로 전자정부프레임워크 에서 스프링부트 변환 포스팅은 마무리 됩니다.

### jQuery
아마 레거시 프로젝트에서는 jQuery의 비중이 아주 높을 겁니다.

아주 간단한 기능 조차도 jQuery를 이용한 경우가 많을 것인데 

이러한 것들을 전부 바닐라 자바스크립트로 구현하면 됩니다.

자주 쓰이는 패턴 변환 방법에 대해서 논의합니다.

#### Selector
간단한 예제로 특정 아이디나 클래스로 선택한 엘리먼트에 특정 클래스를 추가하거나 제거 한다고 합시다.

***jQuery***
```javascript
// 아이디 셀렉터
$('#someId').addClass('active')
$('#someId').removeClass('active')

// 클래스 셀렉터
$('.someId').addClass('active')
$('.someId').removeClass('active')
```


***vanilla javascript***
```javascript
// 아이디 셀렉터
document.querySelector('#someId').classList.add('active')
document.querySelector('#someId').classList.remove('active')

// 클래스 셀렉터
document.querySelector('.someId').classList.add('active')
document.querySelector('.someId').classList.remove('active')
```

#### Event Handler
특정 엘리먼트 이벤트 핸들러 작성 방법입니다.

클릭 이벤트 리스너 를 작성한다고 합시다.

***jQuery***
```javascript
// 클릭 이벤트 리스너
$('#someId').click(function() {
  console.log('someId clicked')
})
```


***vanilla javascript***
```javascript
// 클릭 이벤트 리스너
document.querySelector('#someId').addEventListener('click', (e) => {
  console.log('someId clicked')
})
```

#### Get / Set Value
특정 엘리먼트 값 가져오기 / 값 세팅하기 입니다.

***jQuery***
```javascript
// input, select, textarea 에서 값 가져오기
// 특정 엘리먼트 값 가져오기
$('#someId').val()

// input, select, textarea 에서 값 세팅하기
// 특정 엘리먼트 값 세팅하기
$('#someId').val('세팅')
```


***vanilla javascript***
```javascript
// input, select, textarea 에서 값 가져오기
// 특정 엘리먼트 값 가져오기
document.querySelector('#someId').value

// input, select, textarea 에서 값 세팅하기
// 특정 엘리먼트 값 세팅하기
document.querySelector('#someId').value = '세팅'

// input, select, textarea 아닌 엘리먼트에서 문자열 추출
document.querySelector('#someEl').textContent
```

#### 반복문
반복문의 경우 바닐라 자바스크립트의 기본 내장된 기능만 써도 충분합니다.

추가적으로 filter, map 이런것도 내장되어있고, reduce 또한 구현해서 써도됩니다.

다만 깊은복사 나 다른 추가 기능이 필요할경우 underscore 또는 lodash 를 설치 해서 써도 됩니다.

사실 왠만한 기능 구현은 바닐라 기본 메서드 와 커스텀로직 만으로도 충분합니다.

***jQuery***
```javascript
var items = ['one', 'two', 'three'];

// $.each 반복문
$.each(items, function (index, item) {
  console.log(index, item)
})
```


***vanilla javascript***
```javascript
const items = ['one', 'two', 'three'];

// forEach 나 for of 문사용
items.forEach((item, index) => {
  console.log(index, item)
})

// for of 문 사용
for (const item of items) {
  console.log(item)
}
```

#### ajax
ajax의 경우 지난번 axios 포스팅으로 대체 하겠습니다.

axios 로 모듈로 만들어서 비동기 호출을 구현하면 되겠습니다.

여기에 언급이 안된 기능들도 왠만한건 다 바닐라 자바스크립트로 구현이 가능하고 그것도 힘들다 싶은건

npm 에서 구현되어 있는 모듈을 가져다가 써도 됩니다.

### pdfmake

npm 패키지 중에 pdf로 만들어주는 여러가지 라이브러리가 있습니다.

대표적으로 유명한 패키지는 jsPDF 와 pdfmake 입니다.

깃허브 스타수는 jspdf 가 더 많습니다만, npm 다운로드는 둘다 비슷합니다.

저는 둘다 써봤지만 저한테는 pdfmake 가 더 저한테는 맞는거 같았고 모든 프로젝트에 

출력물이 있는경우 pdfmake를 적용해서 출력물을 구현하고 있습니다.

여러분들은 여러가지 써보시고 맘에 드는걸 선택해서 쓰면 됩니다.

#### 샘플 출력물 (급여명세서)
저는 일단 급여명세서 출력물 레이아웃을 구현하는 것을 잠깐 보여드리고 

실제 프로젝트에 적용하는거 까지 포스팅을 해보겠습니다.

자꾸 쓰는게 익숙해지면 안 보고도 테이블을 구현할 수 있게됩니다.

`샘플 급여명세서 양식`
![salaryTemplate](/images/2023-06-04-convert-egovframe-to-springboot3/salary-template.png)

pdfmake 로 위 양식을 구현해 보겠습니다.

#### 프로젝트 세팅
지난번 gulp 자동화했던 프로젝트 세팅으로 진행하겠습니다.

먼저 프로젝트 루트에서 pdfmake를 설치해줍니다.  
(패키지 설치는 항상 -D 플래그를 넣어주세요 어차피 개발시에만 사용합니다.)
```bash
npm install -D pdfmake
```

설치가 완료되면 폰트 설정을 해야합니다. 

**node_modules/pdfmake/build/vfs_font.js**
![defaultVfsfont](/images/2023-06-04-convert-egovframe-to-springboot3/default-vfsfont.png)

처음에 모듈을 설치하면 위와같은 폰트로 세팅되어있는데 위 기본폰트에서는 한글이 나오지 않습니다.

그래서 적당한 폰트를 골라서 `vfs_font.js` 를 빌드 해야 하는데 빌드 방법은 pdfmake 문서에 자세히 나와 있습니다.


[vfsfont공식문서](https://pdfmake.github.io/docs/0.1/fonts/custom-fonts-client-side/vfs/shell/){:target="_blank"}

저같은 경우는 나눔바른고딕 폰트를 적용했습니다.

폰트를 적용했으면 `vfs_font.js` 파일을 새로 빌드한 파일로 교체해줍니다.

**node_modules/pdfmake/build/vfs_font.js**
![customVfsfont](/images/2023-06-04-convert-egovframe-to-springboot3/custom-vfsfont.png)

여기까지 끝났으면 이제 비지니스 로직만 작성하면됩니다.

#### 출력물 로직작성
`gulp-src` 에 pdf 관련 모듈을 추가해 줍니다.

저는 그냥 js 아래에 pdf 아래에 추가했습니다.

그리고 여러개의 출력물이 있다고 가정하고, `index.js` 에서는 오로지 프론트에서 호출 받는 부분,

각 파일 `salary.js` 에서 출력물 로직을 작성하는 식으로 구현해보겠습니다.

그래서 최종 폴더 구조는 아래와 같이 됩니다.
![folderTree](/images/2023-06-04-convert-egovframe-to-springboot3/folder-tree.png)

각 파일 로직 구현을 해보겠습니다.

***gulp-src/js/pdf/index.js***
```javascript
// import api from '../api'
import salary from './salary'

// 급여명세서 호출
const printSalary = (clickInfo) => {
  let salaryData
  // 서버에서 특정 사람의 몇월몇일 데이터 가져오는 axios 로직 넣으면 좋음
  // 아래와 같은 axios 로직 있다고 가정하고 가라 데이터 넣어줌

  // api.post({
  //   path: '/salaryInfo', 
  //   data: {
  //     salaryInfo: clickInfo
  //   }
  // }).then(({ data }) => {
  //   salaryData = data
  //   // 성공시 데이터 급여명세서에 넘겨주며 출력
  //   salary.salaryDefault(salaryData)
  // }).catch(err => {
  //   console.log(err)
  // })

  salaryData = {
    salaryYear: '2023',
    salaryMonth: '5',
    companyName: '코딩잘하자 (주)',
    salaryDate: '2023.05.31',
    baseAmount: 8135000,
    mealAmount: 200000,
    nationalPension: 248850,
    healthInsurance: 288380,
    nursingInsurance: 36940,
    employmentInsurance: 73210,
    incomeTax: 986720,
    localIncomeTax: 98670,
    empName: 'chloe kang',
    empDepartment: 'Development',
    empBirthDate: '1923.01.02',
    empNumber: '3525234324',
    empPosition: 'General Manager'
  }

  // 급여명세서 pdf 출력
  salary.salaryDefault(salaryData)
}

export default {
  printSalary,
}
```

호출 부분은 위와 같이 정리 하면 됩니다.

그리고 직접 호출받는 pdfmake 로직을 작성하는 부분을 작성해봅니다.

***gulp-src/js/pdf/salary.js***
```javascript
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const fonts = {
  NanumBarun: {
    normal: 'NanumBarunGothic.ttf',
    bold: 'NanumBarunGothicBold.ttf',
    italics: 'NanumBarunGothicLight.ttf',
    bolditalics: 'NanumBarunGothicUltraLight.ttf'
  }
}

// 콤마찍기
const priceFormat = (value) => {
  if(!value) return ''
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 급여명세서
const salaryDefault = (dataObj) => {
  // 지급액계
  let totalAmount = dataObj.baseAmount + dataObj.mealAmount

  // 공제액계 
  let totalTax = dataObj.nationalPension + dataObj.healthInsurance + dataObj.nursingInsurance + dataObj.employmentInsurance + dataObj.incomeTax + dataObj.localIncomeTax


  // 데퍼니션
  let docDefinition = {
    content: [
      {
        table: {
          widths: [70, '*', 30],
          body: [
            [
              { text: `${dataObj.salaryYear}년 ${dataObj.salaryMonth}월분 급여명세서`, style: 'salaryHeader', alignment: 'center', colSpan: 3 },
              '',
              ''
            ]
          ]
        },
        layout: 'noBorders'
      },
      {
        margin: [0, 20, 0, 20],
        table: {
          widths: [20, 320, '*'],
          body: [
            [
              '',
              { text: `회사명: ${dataObj.companyName}`, style: 'salarySubHeader', alignment: 'left' },
              { text: `지급일: ${dataObj.salaryDate}`, style: 'salarySubHeader', alignment: 'left' }
            ]
          ]
        },
        layout: 'noBorders'
      },
      {
        style: 'tableStyle',
        margin: [0, 0, 0, 30],
        table: {
          widths: [40, 200, 60, '*'],
          body: [
            [
              { text: `성명`, style: 'tdHeader', margin: [0, 2, 0, 2] },
              { text: `${dataObj.empName}`, style: 'tdHeader', margin: [0, 2, 0, 2] },
              { text: `생년월일(사번)`, style: 'tdHeader', margin: [0, 2, 0, 2] },
              { text: `${dataObj.empBirthDate} (${dataObj.empNumber})`, style: 'tdHeader', margin: [0, 2, 0, 2] }
            ],
            [
              { text: `부서`, style: 'tdHeader', margin: [0, 2, 0, 2] },
              { text: `${dataObj.empDepartment || ''}`, style: 'tdHeader', margin: [0, 2, 0, 2] },
              { text: `직급`, style: 'tdHeader', margin: [0, 2, 0, 2] },
              { text: `${dataObj.empPosition || ''}`, style: 'tdHeader', margin: [0, 2, 0, 2] }
            ]
          ]
        },
        layout: 'headerTableLayout'
      },
      {
        text: '(단위, 원)', alignment: 'right', style: 'tableStyle'
      },
      {
        style: 'tableStyle',
        table: {
          widths: [80, '*', 120, 100, 120],
          body: [
            [
              { text: '세부내역', margin: [0, 2, 0, 2], style: 'tdHeader', fillColor: '#d0d0d0', colSpan: 5 },
              '',
              '',
              '',
              ''
            ],
            [
              { text: '구분', margin: [0, 2, 0, 2], style: 'tdHeader', fillColor: '#d0d0d0' },
              { text: '지급 항목', margin: [0, 2, 0, 2], style: 'tdHeader', fillColor: '#d0d0d0' },
              { text: '지급 금액', margin: [0, 2, 0, 2], style: 'tdHeader', fillColor: '#d0d0d0' },
              { text: '공제 항목', margin: [0, 2, 0, 2], style: 'tdHeader', fillColor: '#d0d0d0' },
              { text: '공제 금액', margin: [0, 2, 0, 2], style: 'tdHeader', fillColor: '#d0d0d0' }
            ],
            [
              { text: '매월', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: '기본급', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: `${priceFormat(dataObj.baseAmount)}`, margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: '국민연금', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: `${priceFormat(dataObj.nationalPension)}`, margin: [0, 2, 0, 2], style: 'dataCell' }
            ],
            [
              { text: '매월', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: '식대', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: `${priceFormat(dataObj.mealAmount)}`, margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: '건강보험', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: `${priceFormat(dataObj.healthInsurance)}`, margin: [0, 2, 0, 2], style: 'dataCell' }
            ],
            [
              { text: '', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: '', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: '', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: '고용보험', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: `${priceFormat(dataObj.employmentInsurance)}`, margin: [0, 2, 0, 2], style: 'dataCell' }
            ],
            [
              { text: '', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: '', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: '', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: '장기요양보험료', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: `${priceFormat(dataObj.nursingInsurance)}`, margin: [0, 2, 0, 2], style: 'dataCell' }
            ],
            [
              { text: '', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: '', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: '', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: '소득세', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: `${priceFormat(dataObj.incomeTax)}`, margin: [0, 2, 0, 2], style: 'dataCell' }
            ],
            [
              { text: '', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: '', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: '', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: '지방소득세', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: `${priceFormat(dataObj.localIncomeTax)}`, margin: [0, 2, 0, 2], style: 'dataCell' }
            ],
            [
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' }
            ],
            [
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' }
            ],
            [
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' }
            ],
            [
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' }
            ],
            [
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' }
            ],
            [
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' }
            ],
            [
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' }
            ],
            [
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' }
            ],
            [
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' }
            ],
            [
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell', border: [true, false, true, false] },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell', border: [true, false, true, false] },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell', border: [true, false, true, false] },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell' }
            ],
            [
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell', border: [true, false, true, true] },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell', border: [true, false, true, true] },
              { text: ' ', margin: [0, 2, 0, 2], style: 'dataCell', border: [true, false, true, true] },
              { text: '공 제 액 계', margin: [0, 2, 0, 2], style: 'tdHeader', fillColor: '#d0d0d0' },
              { text: `${priceFormat(totalTax)}`, margin: [0, 2, 2, 2], style: 'tdHeader', fillColor: '#d0d0d0', alignment: 'right' }
            ],
            [
              { text: '지 급 액 계', margin: [0, 2, 0, 2], style: 'tdHeader', fillColor: '#d0d0d0', colSpan: 2 },
              '',
              { text: `${priceFormat(totalAmount)}`, margin: [0, 2, 2, 2], style: 'tdHeader', fillColor: '#d0d0d0', alignment: 'right' },
              { text: '실지급액', margin: [0, 2, 0, 2], style: 'tdHeader', fillColor: '#d0d0d0' },
              { text: `${priceFormat(totalAmount - totalTax)}`, margin: [0, 2, 2, 2], style: 'tdHeader', fillColor: '#d0d0d0', alignment: 'right' }
            ]
          ]
        },
        layout: 'mainTableLayout'
      },

    ],

    styles: {
      salaryHeader: {
        fontSize: 18,
        bold: true
      },
      salarySubHeader: {
        fontSize: 10
      },
      tdHeader: {
        fontSize: 8,
        alignment: 'center',
        bold: true
      },
      tableStyle: {
        fontSize: 7,
      },
      dataCell: {
        fontSize: 7,
        alignment: 'center'
      }
    },

    defaultStyle: {
      font: 'NanumBarun'
    }
  };

  pdfMake.tableLayouts = {
    headerTableLayout: {
      hLineWidth: (i, node) => {
        return 1;
      },
      vLineWidth: (i, node) => {
        return 1;
      },
      hLineColor: (i, node) => {
        return '#5a5a5a';
      },
      vLineColor: (i) => {
        return '#5a5a5a';
      },
      paddingLeft: (i) => {
        return 0;
      },
      paddingRight: (i, node) => {
        return 0;
      }
    },
    mainTableLayout: {
      hLineWidth: (i, node) => {
        if(i < 3 || i > 17) return 1;
        return 0;
      },
      vLineWidth: (i) => {
        return 1;
      },
      hLineColor: (i) => {
        return '#5a5a5a';
      },
      vLineColor: (i) => {
        return '#5a5a5a';
      },
      paddingLeft: (i) => {
        return 0;
      },
      paddingRight: (i, node) => {
        return 0;
      }
    }
  };

  pdfMake.createPdf(docDefinition, null, fonts).open();
}

export default {
  salaryDefault
}
```

최대한 간단히 작성한다고 했는데 되게 길어졌네요.

샘플이 조금 복잡한데 pdfmake 공식문서를 보면서 사용법을 익히시면 어렵지 않게 구현할 수 있습니다.

그리고 모듈도 연결해 줍니다.

***gulp-src/js/main.js***
```javascript
import math from './math';
import api from './api';
import pdf from './pdf';

(function () {
  window.myModule = {
    math,
    api,
    pdf
  }
})();
```

마지막으로 `index.html` 에 호출 로직을 추가해줍니다.

***src/main/resources/templates/index.html***
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
  <button id="test3">급여명세서출력</button>
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

    document.querySelector('#test3').addEventListener('click', () => {
      myModule.pdf.printSalary()
    })

  </script>
</body>
</html>
```

여기 까지 작성하면 모든 준비는 끝났습니다.

테스트를 해보죠

#### 테스트

버튼 만들어준걸 누릅니다.

![applyPdfmake](/images/2023-06-04-convert-egovframe-to-springboot3/apply-pdfmake.png)

처음에 샘플대로 얼추 비슷하게 나온거 같네요.

여기서 더 세부적으로 조정하고 싶으면 문서를 참고하시면됩니다.

이 예제 샘플에 최대한 많은걸 넣어서 이거만 따라해도 왠만한 양식은 구현 할 수 있을거에요.

지금은 버튼 누르면 아래처럼 뜨게 되는데요.

![applyTest](/images/2023-06-04-convert-egovframe-to-springboot3/apply-test.gif)

만약 바로 다운받게 하고 싶으면

***gulp-src/js/pdf/salary.js***
```javascript
  pdfMake.createPdf(docDefinition, null, fonts).open();
```

위 부분을 다운로드로만 바꾸면 됩니다.

***gulp-src/js/pdf/salary.js***
```javascript
  // 이렇게하면 그냥 file.pdf 로 다운된다.
  pdfMake.createPdf(docDefinition, null, fonts).download();

  // 인자로 파일이름을 정할수 있다.
  pdfMake.createPdf(docDefinition, null, fonts).download('급여명세서.pdf');
```

이렇게요.

오늘은 전자정부프레임워크 에서 스프링부트 변환 마지막 포스팅에 대하여 작성해보았습니다.

최대한 간단히 쓸려고 했는데 샘플 출력양식이 조금 복잡했던거 같네요.

어쨋든 제가 포스팅한 내용대로 잘따라하면 무사히 전자정부프레임워크 에서 스프링부트로 리팩토링 하실수 있을겁니다.

감사합니다.
