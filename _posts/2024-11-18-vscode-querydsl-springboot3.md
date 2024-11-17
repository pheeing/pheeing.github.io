---
layout: single
title: "[Spring Boot] Spring Boot3 에서 QueryDSL 세팅(with.vscode) "
categories: springboot
tag: [spring boot3, vscode, setting, querydsl, spring data jpa, windows, mac]
toc: true
---

## 1. 개요
오늘은 최신 Spring Boot 3.3.x 환경에서 vscode 에디터를 사용하여 
querydsl 세팅하는 방법에 대해서 포스팅 하겠습니다.

이 방법은 mac, windows 동일하게 세팅이 가능합니다.

### 1.1 메이븐사용
저는 원래 빌드툴은 Gradle 을 더 선호하는 편이긴 한데 vscode 로 스프링부트를 개발 하다 보면 알 수 없는 에러들 때문에 (익스텐션 오류같음) 프로젝트를 재 세팅해야 하는 경우가 몇번 있었습니다.

그때마다 gradle 캐시를 전부 삭제하고 다시 세팅하면 되긴 됐지만 원인을 찾지 못해 고생 했던 기억이 있습니다. 

같은 프로젝트를 인텔리제이 에서 세팅하면 아무문제 없이 잘 돌아 가긴 하더군요.

하지만 저는 vscode 환경이 너무 좋아서 스프링부트 개발환경으로 사용하는 입장이라 방법을 찾고 싶었고 maven으로 빌드툴을 바꾸니 그런 에러는 사라졌습니다. 

그래서 vscode 로 스프링부트 를 개발 하려고 하시는 분들은 maven 을 사용 하시는것을 권장 합니다. 

인텔리제이나 STS4 를 쓰는경우는 빌드툴의 영향은 없을듯 합니다.

## 2. 준비
### 2.1 샘플프로젝트 세팅
![project-setting](/images/2024-11-18-vscode-querydsl-springboot3/querydsl1.PNG)

위와 같이 빌드툴 maven, jdk는 21을 선택해 줍니다.

### 2.2 application.yml 세팅
`application.properties` 파일을 `application.yml` 로 변경하고 h2 데이터 베이스에 대한 세팅을 우선 해줍니다.

```yaml
server:
  port: 8085

spring:
  application:
    name: demo

  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: ''
  h2:
    console:
      enabled: true
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
    hibernate:
      ddl-auto: create-drop
    show-sql: true
```

### 2.3 pom.xml 수정
```xml
		<!-- QueryDSL Start -->
		<dependency>
			<groupId>com.querydsl</groupId>
			<artifactId>querydsl-jpa</artifactId>
			<version>${querydsl.version}</version>
			<classifier>jakarta</classifier>
		</dependency>
		<dependency>
			<groupId>com.querydsl</groupId>
			<artifactId>querydsl-apt</artifactId>
			<version>${querydsl.version}</version>
			<classifier>jakarta</classifier>
		</dependency>
		<!-- QueryDSL End -->
```
`pom.xml` 파일에서 위 내용만 추가하면 querydsl 의 모든 세팅이 끝이납니다.

시시하게도 이게 끝입니다. 

## 3. 테스트로직 작성
QueryDSL 에 대한 세팅이 끝났으니 테스트를 해봅시다.

테스트를 위한 간단한 로직들을 작성해봅시다.

### 3.1 엔티티, DTO 작성
우선 테스트를 위한 아주 간단한 엔티티를 작성합니다.  

**Todo.java**
```java
package com.codingjalhaja.demo.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor
public class Todo {
  
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String content;
}

```

**TodoDto.java**
```java
package com.codingjalhaja.demo.dto;

import lombok.Data;

@Data
public class TodoDto {
  private Long todoId;
  private String todoContent;
}

```

### 3.2 리파지토리 작성
**TodoRepository.java**
```java
package com.codingjalhaja.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.codingjalhaja.demo.entity.Todo;

public interface TodoRepository extends JpaRepository<Todo, Long>, TodoRepositoryCustom {
  
}

```
**TodoRepositoryCustom.java**
```java
package com.codingjalhaja.demo.repository;

import java.util.List;

import com.codingjalhaja.demo.dto.TodoDto;

public interface TodoRepositoryCustom {
  List<TodoDto> getTodos();
}

```
**TodoRepositoryImpl.java**
```java
package com.codingjalhaja.demo.repository;

import java.util.List;

import com.codingjalhaja.demo.dto.TodoDto;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;

import jakarta.persistence.EntityManager;

import static com.codingjalhaja.demo.entity.QTodo.todo;

public class TodoRepositoryImpl implements TodoRepositoryCustom{
  private final JPAQueryFactory queryFactory;

  public TodoRepositoryImpl(EntityManager em) {
    this.queryFactory = new JPAQueryFactory(em);
  }

  @Override
  public List<TodoDto> getTodos() {
    return queryFactory
      .select(Projections.fields(TodoDto.class,
        todo.id.as("todoId"),
        todo.content.as("todoContent")
      ))
      .from(todo)
      .fetch();
  }
}

```
### 3.3 컨트롤러 작성
컨트롤러는 간단히 테스트만을 위해서 등록과 조회 두가지만 만들겠습니다.  

원래는 비지니스 로직은 서비스 빈을 만들어 처리하는게 맞지만 지금은 간단한 테스트만 하기 때문에 컨트롤러 에서 다 작성하겠습니다.

**TodoController.java**
```java
package com.codingjalhaja.demo.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.codingjalhaja.demo.dto.TodoDto;
import com.codingjalhaja.demo.entity.Todo;
import com.codingjalhaja.demo.repository.TodoRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TodoController {
  private final TodoRepository todoRepository;
  
  @GetMapping("/todo")
  public List<TodoDto> getTodos() {
    return todoRepository.getTodos();
  }

  @PostMapping("/todo")
  public void postTodo(@RequestBody TodoDto todoDto) {
    Todo todo = new Todo();
    todo.setContent(todoDto.getTodoContent());
    todoRepository.save(todo);

    return;
  }
}

```

## 4. 테스트
이제 간단한 로직도 다 작성했고, QueryDSL이 잘동작 하는지 테스트를 해봅시다.

### 4.1 등록테스트
포스트맨으로 간단한 로직을 작성했으니 api 를 날려봅니다.

![post-test](/images/2024-11-18-vscode-querydsl-springboot3/querydsl2.PNG)

위와 같이 잘 등록이 된거 같습니다.

h2 데이터베이스도 확인해봅시다.

![post-test](/images/2024-11-18-vscode-querydsl-springboot3/querydsl3.PNG)

디비에도 잘 들어간걸로 확인이 됩니다.

### 4.2 조회테스트
데이터를 잘 등록했으니 조회를 해봐야겠죠.

조회로직은 QueryDSL 로 작성했으니 잘 되나 테스트해봅시다.

![get-test](/images/2024-11-18-vscode-querydsl-springboot3/querydsl4.PNG)

조회 로직 역시 위와 같이 잘 동작 하는걸 확인할 수 있습니다.

## 5. 결론
위와 같이 vscode 에서도 아주 간단하게 QueryDSL 을 설정 하고 활용 할 수가 있습니다. 

이 방법은 windows, mac 동일하게 잘 동작합니다. 

제가 두 환경다 vscode 로 개발하기 때문에 아무문제 없이 잘 사용하고 있습니다.

사실 처음에는 vscode 에서는 spring 개발을 하기 힘들었는데 갈수록 더 편해지는 방법이 나와서 좋은것 같습니다. 

오늘의 포스팅은 여기서 마치겠습니다. 