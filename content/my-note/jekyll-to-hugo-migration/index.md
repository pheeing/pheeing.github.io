---
layout: single
title: "Jekyll에서 Hugo로 블로그 이전하기: 직접 만든 테마로 마이그레이션 완료"
date: 2026-10-26
categories: my-note
tag: [jekyll, hugo, tailwindcss, github pages, migration]
toc: true
description: "Jekyll 블로그를 Hugo v0.168 기반으로 이전하며 테마 제작, 게시글 변환, Chroma, 검색, GA4, AdSense, Disqus까지 적용한 과정."
---

오랫동안 방치했던 Jekyll 블로그를 **Hugo**로 옮겼다. 단순히 테마를 바꾸는 대신, 앞으로 편하게 고칠 수 있도록 외부 테마나 Git submodule 없이 `layouts/`부터 직접 구성했다. 디자인은 Tailwind CSS로 만들었고, 기존 글과 댓글·통계·광고 설정도 최대한 이어받았다.

이 글은 마이그레이션하면서 실제로 손봤던 부분만 짧게 정리한 기록이다.

## 1. 외부 테마 없이 Hugo 구조부터 만들기

Hugo 테마를 submodule로 연결하면 시작은 빠르지만, 원하는 부분을 수정할 때 테마 구조를 계속 따라가야 한다. 이번에는 템플릿을 직접 관리하기로 했다.

```text
layouts/
├── baseof.html
├── home.html
├── single.html
├── section.html
├── taxonomy.html
├── term.html
├── _partials/
│   ├── head.html
│   ├── header.html
│   └── footer.html
└── _markup/
    └── render-image.html
assets/css/main.css
static/
content/
hugo.yaml
```

`layouts/`는 화면 구조, `assets/css/`는 Tailwind 스타일, `content/`는 게시글, `static/`은 그대로 공개할 파일을 담당한다. 특히 **`public/`은 빌드 결과물이므로 직접 관리하지 않는다.**

## 2. Jekyll 글을 Hugo로 변환하기

기존 Jekyll 글의 Front Matter는 다음과 같았다.

```yaml
---
layout: single
title: "[Spring Boot] vscode 개발 환경 구축하기 (MAC)"
categories: springboot
tag: [spring boot, vscode]
toc: true
---
```

Hugo에서도 이런 작성 습관을 최대한 유지하도록 taxonomy와 목차를 설정했다. 글은 다음처럼 **페이지 번들** 구조로 배치했다.

```text
content/
└── springboot/
    └── redis-connect/
        ├── index.md
        └── architecture.png
```

이렇게 하면 글 주소는 `/springboot/redis-connect/` 형태가 되고, 이미지는 본문에서 `![구성도](architecture.png)`처럼 상대 경로로 사용할 수 있다. 기존 `_posts` 파일들은 Python 변환 스크립트로 이동했고, 변환 후에는 이미지 경로와 내부 링크를 점검했다.

> 주의: Jekyll의 Liquid 코드 하이라이팅 태그는 Hugo에서 그대로 동작하지 않는다. 언어를 명시한 Markdown 코드 펜스(예: `java`)로 바꿔야 한다.

## 3. 블로그 기능 다시 채우기

기본 글 목록만으로는 아쉬워서 기존 블로그에서 쓰던 기능도 추가했다.

- **카테고리·태그:** 분류 페이지에 해당 게시글 목록을 바로 표시하고, 본문의 breadcrumb에서도 카테고리로 이동할 수 있게 했다.
- **TOC:** `toc: true`인 글에 목차를 표시한다.
- **검색:** Hugo가 생성하는 JSON 검색 인덱스를 브라우저에서 조회한다. 별도 검색 서버는 필요 없다.
- **다크모드:** 시스템 테마를 감지하고, 사용자가 직접 전환한 설정도 유지한다.
- **프로필·푸터:** 작성자 소개와 소셜 링크를 `hugo.yaml`에서 관리한다.
- **글 하단:** 카테고리, 태그, 마지막 수정일을 표시한다.

## 4. 가장 신경 쓴 부분: 코드 하이라이팅

개발 블로그라 코드 블록이 많았다. 처음에는 **라이트모드에서 코드와 배경색이 비슷해 글자가 잘 보이지 않는 문제**가 있었다. Tailwind Typography의 `prose` 스타일과 Hugo의 Chroma 하이라이팅 CSS가 서로 영향을 준 것이었다.

해결 방법은 역할을 분리하는 것이었다.

- **Tailwind:** 코드 블록의 여백, 테두리, 폰트, 가로 스크롤
- **Chroma:** 주석·키워드·문자열 등 토큰별 글자색, 라이트·다크 테마 색상

핵심 설정은 아래와 같다.

```yaml
markup:
  highlight:
    codeFences: true
    noClasses: false
    wrapperClass: highlight
```

`noClasses: false`로 Chroma의 CSS 클래스를 사용하고, 라이트·다크 스타일을 따로 정의했다. `.article .highlight code`의 상속 색상과 `prose-pre` 배경 규칙까지 함께 정리한 뒤 코드 가독성이 안정됐다.

## 5. 기존 서비스 연결과 배포

블로그를 옮긴다고 운영 도구까지 버릴 필요는 없었다.

| 서비스 | 적용 방법 |
|---|---|
| Google Search Console 등 | 인증 HTML 파일을 `static/`에 배치 |
| Google AdSense | `static/ads.txt`와 광고 스크립트 설정 |
| Google Analytics 4 | GA4 측정 ID로 `gtag` 연동 |
| Disqus | 기존 shortname으로 댓글 연결, 글별 식별자 확인 |
| GitHub Pages | GitHub Actions에서 Tailwind와 Hugo를 빌드해 배포 |

Disqus는 **주소가 바뀌면 예전 댓글이 다른 글로 인식될 수 있어** 기존 identifier 또는 URL 매핑을 확인해야 한다. 그리고 GitHub Pages에 소스만 올리면 Hugo가 자동 실행되는 것은 아니므로 빌드 워크플로를 설정했다.

로컬 개발은 아래 명령으로 진행했다.

```bash
npm install
npm run css:build
hugo server -D
```

최종 배포 전에 `hugo --minify`로 정적 파일을 생성하고, 실제 배포 주소에서 검색·코드 블록·광고 관련 파일·댓글을 확인했다.

## 마무리

이번 이전에서 가장 좋았던 점은 **블로그의 모든 레이아웃과 스타일을 내가 직접 관리할 수 있게 된 것**이다. Jekyll에 익숙했던 글 작성 방식은 유지하면서도, Hugo의 빠른 정적 사이트 생성과 Tailwind 기반 디자인을 활용할 수 있게 됐다.

처음에는 단순한 블로그 리뉴얼이었지만, 결과적으로 콘텐츠 구조부터 배포·운영 도구까지 한 번에 정리한 작업이었다. 이제는 새로운 글을 쓰는 데 집중하면 된다.
