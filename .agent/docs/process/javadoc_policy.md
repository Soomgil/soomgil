# JavaDoc 작성 정책

이 문서는 숨길 backend Java 코드의 JavaDoc 작성 기준을 정의한다.

JavaDoc은 코드를 길게 다시 설명하는 주석이 아니라, 팀원이 코드를 호출하기 전에 알아야 하는 계약을 한국어로 고정하는 문서다.

## 적용 범위

아래 항목은 JavaDoc을 작성한다.

- 공통 계약 class/interface/record/enum
- `Command`, `Query`, `Handler`, `Result`, `View`
- 도메인 `model`, `policy`, `event`
- 외부 모듈에서 호출하는 application interface 또는 handler
- API request/response DTO 중 필드 의미가 도메인 규칙과 연결되는 것
- infrastructure adapter 중 외부 API, storage, mapper/repository 경계를 대표하는 class
- 검증 규칙, 권한 규칙, 시간/단위/정렬/페이지 기준이 헷갈릴 수 있는 public method

아래 항목은 기본적으로 JavaDoc을 강제하지 않는다.

- private method
- 테스트 메서드
- 단순 getter/setter
- 의미가 자명한 내부 record field
- `.gitkeep`, generated code, 설정용 boilerplate

단, 단순해 보여도 팀원이 잘못 사용하면 장애나 보안 문제가 생기는 코드는 JavaDoc을 작성한다.

## 언어

- JavaDoc 본문은 한국어로 작성한다.
- 클래스명, 필드명, HTTP method, error code, 도메인 이벤트명은 코드와 같은 영문을 유지한다.
- 필요한 경우 한국어 설명 뒤에 영문 용어를 괄호로 병기한다.
- JavaDoc에 AI, Codex, 개인 작업 흔적을 남기지 않는다.

## 작성 원칙

좋은 JavaDoc은 아래 중 필요한 내용을 짧게 설명한다.

- 이 타입이 무엇을 대표하는가
- 언제 사용하고 언제 사용하지 않는가
- 호출자가 지켜야 하는 입력 조건
- 반환값의 의미
- null 허용 여부
- 시간대, 단위, page 시작 번호 같은 기준
- 권한, 보안, 개인정보 주의사항
- side effect, transaction, event 발행 여부
- 예외 또는 실패 응답 규칙

나쁜 JavaDoc은 코드만 반복한다.

```java
/**
 * tripId를 반환한다.
 */
UUID tripId();
```

좋은 JavaDoc은 사용 계약을 설명한다.

```java
/**
 * 여행방 생성 요청을 처리한다.
 *
 * <p>호출자는 이미 인증된 사용자 ID를 command에 담아야 한다.
 * handler는 여행방과 최초 OWNER 멤버를 같은 transaction 안에서 생성한다.
 */
```

## 타입별 기준

### Command

Command JavaDoc은 사용자의 의도와 처리 결과 타입을 설명한다.

```java
/**
 * 새 여행방 생성을 요청하는 command.
 *
 * <p>Controller는 HTTP request를 이 command로 변환한 뒤
 * {@code CreateTripHandler}에 전달한다.
 */
public record CreateTripCommand(...) implements Command<CreateTripResult> {
}
```

### Query

Query JavaDoc은 읽기 기준과 권한/필터 기준을 설명한다.

```java
/**
 * 여행방 상세 화면에 필요한 읽기 모델을 조회하는 query.
 *
 * <p>호출자는 trip 접근 권한 검증을 함께 수행하는 handler를 통해 조회해야 한다.
 */
public record FindTripDetailQuery(...) implements Query<TripDetailView> {
}
```

### Handler

Handler JavaDoc은 transaction, 권한, side effect를 설명한다.

```java
/**
 * {@link CreateTripCommand}를 처리해 여행방을 생성한다.
 *
 * <p>쓰기 handler이므로 transaction 경계를 가진다.
 * 성공 시 {@code CreateTripResult}를 반환하고, 권한 실패는 ProblemDetails 403으로 변환될 수 있는 예외를 던진다.
 */
```

### Domain model/policy/event

도메인 JavaDoc은 비즈니스 규칙과 불변 조건을 설명한다.

```java
/**
 * 여행방 제목 정책.
 *
 * <p>빈 제목과 최대 길이 초과를 거부한다.
 * 이 정책은 API validation과 별개로 domain 계층에서 마지막으로 보장되어야 한다.
 */
```

### Infrastructure

infrastructure JavaDoc은 외부 시스템과 실패 조건을 설명한다.

```java
/**
 * S3 호환 storage의 object metadata.
 *
 * <p>{@code publicUrl}은 공개 노출이 확정된 객체에만 존재한다.
 * 검수 전 수상작 사진이나 private media는 null이어야 한다.
 */
```

## 완료 기준

기능 완료 전에는 아래를 확인한다.

- 새 public 계약 타입에 JavaDoc이 있는가
- command/query/handler의 책임과 반환 규칙이 한국어로 설명되어 있는가
- domain policy의 판단 기준이 JavaDoc 또는 테스트명으로 추적 가능한가
- storage, event, security, error처럼 공통 계약을 쓰는 경우 오용 주의사항이 적혀 있는가
- JavaDoc이 구현 세부사항만 반복하지 않는가

JavaDoc 누락은 기능 개발 완료로 체크하지 않는다.
