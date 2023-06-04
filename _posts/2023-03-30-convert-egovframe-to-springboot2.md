---
layout: single
title: "[Spring Boot] 전자정부프레임워크 에서 스프링부트 변환 - (2)"
categories: springboot
tag: [spring boot, egovframe, 전자정부, 전자정부프레임워크, 스프링부트, mybatis, spring data jpa, querydsl, JFile]
toc: true
---

## 리팩토링
저번 포스팅에 이어서 리빌딩을 해보려고 한다.

지난번 포스팅은 [전자정부프레임워크 에서 스프링부트 변환 - (1)](/springboot/convert-egovframe-to-springboot/)

에서 확인할 수 있다.

### mybatis
기존은 mybatis를 썻을경우 아마도 1:1로 매퍼가 존재하고

각각의 쿼리는 매퍼와 연결된 xml 쿼리로 작성되었을 것이다.

기존은 아마 이러한 구조의 서버 흐름으로 코딩 되어있을 것이다.

**controller -> service -> (serviceImpl) -> mapper -> xml(쿼리)**

여기서 보통 serviceImpl은 있을수도 있고 없을수도 있다.

우리는 아래와 같은 서버 흐름으로 바꾸면 된다.

**controller -> (service) -> repository(쿼리)**

보면 단계도 굉장히 간소화 되었음을 알수 있다.

각 단계에 대해서는 리팩토링 하기가 그리 어렵지 않다. 

호출구조만 그냥 변경하면 된다.

그러면 남은건 실제 쿼리만 리팩토링 하면된다.

**some_mapper.xml**
```xml
<select id="selectSomeList" parameterType="String" resultType="egovMap">
  SELECT 
    a.address,
    a.detail_address,
    a.post_code
  FROM    table_some_user a
  WHERE   a.user_id = #{userId}
</select>

<select id="selectSomeList2" parameterType="String" resultType="com.some.company.user.service.UserVO">
  SELECT 
    a.address,
    a.detail_address,
    a.post_code
  FROM    table_some_user a
  WHERE   a.user_id = #{userId}
</select>
```
매퍼에는 아마도 위와 같은 구조로 작성되어있을 것이다.

우리는 이 쿼리들은 1:1 로 spring data jpa, querydsl 형태로 리팩토링 하면된다.

#### 도메인작성
먼저 해당 데이터베이스에 맞게 도메인을 작성해야한다.

**domain/SomeUser.java**
```java
@Entity
@Getter @Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "table_some_user")
public class SomeUser {
  @Id
  @Column(name = "user_id")
  @Comment(value = "유저아이디")
  private String id;

  @Column(name = "address", length = 100)
  @Comment(value = "기본주소")
  private String address;

  @Column(name = "detail_address", length = 200)
  @Comment(value = "상세주소")
  private String detailAddress;

  @Column(name = "post_code", length = 5)
  @Comment(value = "우편번호")
  private String postCode;

  // ... 나머지 컬럼들
}
```
위와 같이 테이블을 1:1로 엔티티작성을 해준다.

#### dto 작성
데이터베이스의 엔티티를 그대로 클라이언트에 내보내는건 보안에도 안좋고 유지보수에도 좋지않다.

그래서 dto를 개별적으로 만들어 주는게 좋다.

**dto/SomeUserDto.java**
```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SomeUserDto {
  private String userId;
  private String address;
  private String detailAddress;
  private String postCode;
  // ... 나머지 컬럼들
}
```

#### repository 작성
스프링 데이터 jpa를 사용하기 위해 위에 만든 엔티티로

인터페이스를 구현한다.

**repository/SomeUserRepository.java**
```java
public interface SomeUserRepository extends JpaRepository<SomeUser, String> {

}
```
여기까지만 해도 사용하는데 문제는 없지만 querydsl을 활용하기 위해 

커스텀 리파지토리도 구현한다.

**repository/SomeUserRepositoryCustom.java**
```java
public interface SomeUserRepositoryCustom {
  List<SomeUserDto> selectSomeList(String userId);
}
```

**repository/SomeUserRepositoryImpl.java**
```java
public class SomeUserRepositoryImpl implements SomeUserRepositoryCustom {

  private final JPAQueryFactory queryFactory;

  public SomeUserRepositoryImpl(EntityManager em) {
    this.queryFactory = new JPAQueryFactory(em);
  }

  @Override
  public List<SomeUserDto> selectSomeList(String userId) {
    List<SomeUserDto> content = queryFactory
        .select(Projections.fields(SomeUserDto.class,
            someUser.address.as("address"),
            someUser.detailAddress.as("detailAddress"),
            someUser.postCode.as("postCode")))
        .from(someUser)
        .where(someUser.id.eq(userId))
        .fetch();

    return content;
  }
}
```

커스텀 리파지토리는 다 작성하면

기존 리파지토리 도 바꿔준다

**repository/SomeUserRepository.java**
```java
public interface SomeUserRepository extends JpaRepository<SomeUser, String>, SomeUserRepositoryCustom {

}
```

이렇게만하면 기존 **selectSomeList** 매퍼에서 작성한 쿼리와 같은 쿼리가 완성된다.

이런식으로 기존 mybatis 의 mapper 쿼리를 1:1로 querydsl 쿼리로 매핑해주면 된다.

그리고 호출은 기존 방식과 같다. 컨트롤러나 서비스단에서 리파지토리 호출을 하면된다.

### JFile
JFile은 전자정부 프레임워크에 포함된 파일관련 처리 컴포넌트이다.

일단 이 컴포넌트를 활용한 데이터 베이스를 만들었다고 가정하자.

공식문서에 있는 db 생성문을 보면 아래와같다.

```sql
CREATE TABLE J_ATTACHFILE 
(
	FILE_ID VARCHAR2(13) NOT NULL,
	FILE_SEQ INTEGER NOT NULL,
	FILE_NAME VARCHAR2(100) NOT NULL,
	FILE_SIZE INTEGER,
	FILE_MASK VARCHAR2(100),
	DOWNLOAD_COUNT INTEGER,
	DOWNLOAD_EXPIRE_DATE VARCHAR2(8),
	DOWNLOAD_LIMIT_COUNT INTEGER,
	REG_DATE DATE,
	DELETE_YN VARCHAR2(1),
CONSTRAINT  J_ATTACHFILE_PK PRIMARY KEY (FILE_ID, FILE_SEQ)
);
```

그리고 실제 api를 분석해 보면 기존 파일이름을 파일마스크로 교체하는것을 알수가있다.

이걸 활용해서 우리는 리팩토링할 파일 유틸을 만들면 된다.

#### 파일 업로드 구현
우선 업로드를 구현해보자.

기존 업로드 메소드를 자세히 관찰해보면

파일은 업로드 되는데 파일은 전부 파일마스크로 교체된다. 

그래서 파일명만 디비에 보관하고 필요할때 파일마스크 파일을 해당 파일이름으로 리턴하는식이다.

비슷하게 구현할려면 파일마스크를 흉내내야한다.

그래서 랜덤 스트링 생성 함수를 먼저 만들어주자

**util/FileUtils.java**
```java
  public static String randomString(int len) {
    String chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk"
          +"lmnopqrstuvwxyz";
    Random rnd = new Random();
    StringBuilder sb = new StringBuilder(len);
    for (int i = 0; i < len; i++)
      sb.append(chars.charAt(rnd.nextInt(chars.length())));
    return sb.toString();
  }
```
위와같이 랜덤스트링 함수를 구현하고, 클라이언트로 부터 받은 multipart 폼 파일데이터를

파일마스크로 변경하는 로직을 넣어서 저장한다.

**util/FileUtils.java**
```java
  public static String saveFile(String prefix, String fileName, MultipartFile multipartFile) throws IOException {
    // ... 경로 파싱로직
    // String[] splitDate 

    Path uploadPath = Paths.get(prefix + File.separator + splitDate[0] + File.separator + splitDate[1]);

    if (!Files.exists(uploadPath)) {
      Files.createDirectories(uploadPath);
    }

    String fileId = randomString(16);
    String fileMask = splitDate[0] + splitDate[1] + fileId;

    try (InputStream inputStream = multipartFile.getInputStream()) {
      Path filePath = uploadPath.resolve(fileMask);
      Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
    } catch (IOException ioe) {       
      throw new IOException("Could not save file: " + fileName, ioe);
    }

    return fileMask;
  }
```
위와 같이 파일저장 유틸 메서드를 만들어준다. 그러면 컨트롤러나 서비스단에서 구현할때 호출만 하면된다.

그러면 컨트롤러 에서는 멀티파트 폼 데이터를 받으면 아래와 같이 코딩하면 된다.

**구현된컨트롤러**
```java
    String fileName = StringUtils.cleanPath(multipartFile.getOriginalFilename());
    String fileMask = FileUtils.saveFile("./uploads", fileName, multipartFile);
```
그러면 처음에 생성된 디비구조에 알맞는 데이터를 다 획득할 수있고, 실제 저장된 파일도 파일마스크 로 변환된다.

#### 파일 다운로드 구현
다운로드는 기존에 디비에서 파일마스크를 찾아서 디비에 저장되어있는 파일이름으로 클라이언트로 응답하면된다.

**util/FileUtils.java**
```java
  private Path foundFile;
     
  public static Resource getFileAsResource(Path dirPath, String fileMask) throws IOException {  
    Files.list(dirPath).forEach(file -> {
      if (file.getFileName().toString().startsWith(fileMask)) {
        foundFile = file;
        return;
      }
    });

    if (foundFile != null) {
      return new UrlResource(foundFile.toUri());
    }
      
    return null;
  }
```
다운로드는 더 간단하다. 위와 같이 구현하면 된다.

그러면 컨트롤러에서는 아래와 같이 구현하면된다.

**구현된컨트롤러**
```java
    // ... 경로 파싱로직
    // String[] splitDate 
    Path dirPath = Paths.get("./uploads" + File.separator + splitDate[0] + File.separator + splitDate[1]);

    Resource resource = null;
    try {
      resource = FileUtils.getFileAsResource(dirPath, fileMask);
    } catch (IOException e) {
      return ResponseEntity.internalServerError().build();
    }

    // ... 이후 리소스 리턴 로직
```

위와같이 구현하면 해당 파일마스크의 리소스를 가져올수있고 적절할 로직을 써서 리턴하면 된다.

#### 파일 미리보기 구현
파일 미리보기 구현은 더 간단하다.

**구현된컨트롤러**
```java
    // ... 경로 파싱로직
    // String[] splitDate 
    Path dirPath = Paths.get("./uploads" + File.separator + splitDate[0] + File.separator + splitDate[1]);

    Resource resource = null;
    try {
      resource = FileUtils.getFileAsResource(dirPath, fileMask);
    } catch (IOException e) {
      System.out.println(e);
    }

    return resource;
```

다운로드랑 거의 똑같다. 미리보기는 바로 리소스를 리턴하면된다.

위와 같이 구현했을때 Thymelaef 에서는 그냥 이미지 소스 어트리뷰트에

구현한 컨트롤러 엔드포인트를 할당하면된다.

```html
<img src="구현된컨트롤러엔드포인트" alt="이미지">
```

여기까지 파일까지 리팩토링하는 방법에 대하여 포스팅하였다.

나머지 기술스택 변환 방법에 대해서는 다음 포스팅에서 쓰겠습니다.

다음 포스팅은 [전자정부프레임워크 에서 스프링부트 변환 - (3)](/springboot/convert-egovframe-to-springboot3/)