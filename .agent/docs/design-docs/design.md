# Soomgil 디자인 기준

작성 기준일: 2026-06-12
기준 코드: `frontend/`의 Vue 컴포넌트, 라우터, 전역 스타일, 페이지별 scoped style

이 문서는 현재 구현된 UI를 기준으로 Soomgil의 디자인 언어와 화면 패턴을 정리한다. 기획용 프롬프트나 과거 정적 목업이 아니라, `frontend/` 코드가 현재 source of truth이다.

## 1. 디자인 방향

Soomgil은 그룹 여행자가 함께 취향을 모으고, 지도에서 동선을 만들고, 여행기를 공유하는 서비스다. 현재 UI는 다음 세 가지 인상을 결합한다.

- 여행 콘텐츠 서비스: 큰 여행 사진, 장소 카드, 지역 이미지, 후기 피드가 중심이다.
- 협업형 플래너: 지도, 일정 패널, 멤버 아바타, 초대, 실시간 활동 알림을 사용한다.
- 모바일 앱을 확장한 웹 UI: 스와이프 카드, pill 버튼, 둥근 카드, 바텀/사이드 패널, 모달 중심 인터랙션을 쓴다.

전체 톤은 밝은 블루 계열의 기술감, 여행 사진의 감성, SNS형 피드의 친근함을 함께 사용한다. 제품의 핵심 시각 신호는 `지도`, `사진 카드`, `스와이프`, `겹친 멤버 아바타`, `그라디언트 CTA`다.

## 2. Source of Truth

현재 디자인 근거는 아래 파일에 분산되어 있다.

- `frontend/src/styles/main.css`: Tailwind 4 테마 토큰, 폰트, 외부 CSS import.
- `frontend/src/styles/original.css`: 대부분의 전역 디자인 토큰, 레이아웃, 버튼, 카드, 지도, 커뮤니티, 여행 관리, 모달 스타일.
- `frontend/src/styles/scroll-explore.css`: 랜딩 페이지 전용 스크롤/히어로/갤러리 스타일.
- `frontend/src/styles/mypage.css`: 마이페이지와 사용자 프로필 전용 스타일.
- `frontend/src/components/common/*`: Tailwind 기반 공통 컴포넌트.
- `frontend/src/pages/*`: 페이지별 구조와 scoped style.

주의: `original.css` 안에는 현재 페이지에서 직접 쓰는 스타일과 과거/미사용으로 보이는 스타일이 섞여 있다. 디자인 변경 시 `original.css`를 source로 보되, 실제 사용 여부는 Vue 템플릿에서 함께 확인해야 한다.

## 3. 시각 토큰

현재 핵심 토큰은 CSS 변수와 Tailwind theme에 중복 정의되어 있다.

| 역할 | 토큰 | 값 |
| --- | --- | --- |
| 배경 | `--bg` | `#f4f9ff` |
| 기본 표면 | `--surface` | `#ffffff` |
| 보조 표면 | `--surface-2` | `#ebf4ff` |
| 본문 텍스트 | `--ink` | `#1a2033` |
| 보조 텍스트 | `--muted` | `#68718a` |
| 경계선 | `--line` | `#e3eaf4` |
| 브랜드 블루 | `--violet` | `#0066ff` |
| 라이트 블루 | `--lavender` | `#80b3ff` |
| 시안 블루 | `--blue` | `#00d1ff` |
| 민트 | `--cyan` | `#00e0d1` |
| 좋아요/강조 | `--rose` | `#ff5c8d` |
| 슈퍼라이크/주의 | `--yellow` | `#ffc857` |

그림자는 `--soft-shadow: 0 10px 26px rgba(0, 102, 255, .08)`와 `--shadow: 0 18px 44px rgba(0, 102, 255, .12)`가 기준이다. 주요 CTA와 활성 상태는 `linear-gradient(135deg, var(--violet), var(--blue))`를 반복 사용한다.

## 4. 타이포그래피

기본 폰트는 Pretendard Variable을 우선하고, Inter와 시스템 sans-serif를 fallback으로 둔다.

- 본문 기본: `line-height: 1.6`, `letter-spacing: -0.02em`.
- 전역 `h1`: `clamp(44px, 5vw, 72px)`, 강한 굵기, hero나 큰 페이지 헤더용.
- 전역 `h2`: `clamp(30px, 3vw, 42px)`.
- `.eyebrow`: 브랜드 컬러, uppercase, 작은 라벨, 굵은 weight.
- `.lead`: 19-20px 수준의 보조 설명, `--muted`.

일부 컴팩트 카드와 패널은 페이지 scoped style에서 12-15px 텍스트를 많이 쓴다. 큰 hero 텍스트와 패널 내부 텍스트의 스케일 차이는 현재 디자인의 중요한 리듬이다.

## 5. 공통 레이아웃

- 헤더 높이는 72px이고, `.topbar`는 fixed glass header다.
- 일반 페이지는 `.section`을 사용하며 최대 폭은 1440px, 좌우 padding은 40px 계열이다.
- 대시보드형 페이지는 `.content-container`를 사용해 흰색/유리 표면, 40px radius, 큰 그림자를 만든다.
- 경로 설계 화면은 예외적으로 헤더 아래 전체 viewport를 쓰는 full-screen layout이다.
- 주요 responsive breakpoint는 1120, 1024, 900, 768, 680, 640, 480px 주변에 분산되어 있다.

일반 정보 페이지는 중앙 정렬된 큰 section, 작업형 화면은 좌우 grid 또는 panel layout을 쓴다.

## 6. 공통 컴포넌트 패턴

### Header

`AppHeader.vue`는 랜딩과 서비스 내부에서 서로 다른 nav item을 보여준다.

- 좌측: 로고 이미지와 `Soomgil` 워드마크.
- 중앙: pill형 nav, active 상태는 브랜드 블루.
- 우측: 로그인/회원가입 또는 브리핑, 알림, 프로필 드롭다운.
- 드롭다운은 흰색 카드, 16px radius, blur/scale transition을 쓴다.

### Button

전역 `.btn`은 pill radius, 42px 이상 높이, 굵은 텍스트, hover lift를 기본으로 한다.

- `.btn.primary`: 블루-시안 그라디언트, 흰 텍스트.
- `.btn.ghost`: 흰색/유리 배경, `--line` border, muted 텍스트.
- `BaseButton.vue`: Tailwind variant로 `primary`, `ghost`, `premium`, `icon`을 별도 제공한다.

현재는 전역 `.btn`과 Tailwind 공통 컴포넌트가 혼재한다.

### Card

카드는 대부분 흰색 또는 반투명 유리 배경, `--line` border, `--soft-shadow`, 18-40px radius를 사용한다. 콘텐츠 카드에는 여행 이미지가 먼저 나오고, hover 시 이미지 scale 또는 카드 lift가 들어간다.

### Badge, Tag, Avatar

- tag/badge는 8px 또는 999px radius, 브랜드 색상 tint 배경을 사용한다.
- 멤버 아바타는 원형, 흰 border, 겹침 배치가 기본이다.
- 상태/랭킹/카테고리는 작은 pill로 표현한다.

### Form, Modal, Toast

- `.field`는 rounded rectangle, focus ring, icon prefix 패턴을 쓴다.
- 모달은 `modal-overlay`, `modal-card`, `story-overlay` 계열이 함께 쓰인다.
- 큰 커뮤니티/프로필 모달은 `story-overlay-panel`을 재사용한다.
- Toast는 우측 상단 또는 route page 하단 중앙에서 blur card로 표시된다.

## 7. 화면별 디자인 기준

### Landing

`LandingPage.vue`와 `scroll-explore.css`가 담당한다.

- 첫 화면은 한국 여행 이미지 full viewport hero, 어두운 overlay, 큰 로고, 대형 headline, premium CTA로 구성된다.
- 기능 소개는 좌우 교차 feature step과 glass mockup을 사용한다.
- 추천 루트는 가로 marquee gallery 카드로 보여준다.
- 마지막 CTA는 어두운 사진 카드 위에 흰 CTA 버튼을 둔다.

주의: `scroll-explore.css`는 `body` 스타일을 직접 변경한다. 라우트 전환 후 CSS 영향 범위는 별도 확인이 필요하다.

### Auth

`LoginPage.vue`, `RegisterPage.vue`는 split auth card를 사용한다.

- 왼쪽 visual panel은 여행 사진과 dark gradient overlay.
- 오른쪽 form panel은 OAuth 버튼, divider, icon field, primary action.
- 로그인/회원가입 모두 같은 구조를 공유하고 hero image만 다르다.

### Home

`HomePage.vue`는 서비스 내부 대시보드의 시작 화면이다.

- glass `content-container` 안에 copy + 이미지 carousel hero를 둔다.
- quick action cards는 4열 grid이며, 기능 아이콘과 짧은 설명을 쓴다.
- Super-like TOP 3, 다음 여행 이미지 카드, 커뮤니티 인기 여행 후기, 친구 초대 CTA가 이어진다.

### My Trips

`MyTripsPage.vue`는 여행 관리 대시보드다.

- 페이지 헤더는 큰 gradient headline과 새 여행 CTA.
- 다음 여행은 boarding pass metaphor를 사용한다.
- 티켓에는 출발/도착 코드, 동행자, 날짜, 장소 수, 체크리스트, QR 초대 영역이 포함된다.
- 여행 목록은 timeline card, 필터 tab, 검색 input으로 구성된다.

### Swipe

`SwipePage.vue`는 취향 수집의 핵심 인터랙션 화면이다.

- 상단은 페이지 설명, 중앙은 glass workspace.
- 큰 스와이프 카드에는 관광지 사진, 주소, 제목, 요약, tag가 들어간다.
- 좌/우/상 방향 가이드가 `NOPE`, `LIKE`, `SUPER LIKE`로 표시된다.
- XP bar, 카드 drag/rotate, decision overlay, particle burst가 들어간다.
- 하단 photo strip과 우측 장소 상세 패널을 함께 제공한다.

### Route

`RoutePage.vue`는 헤더 아래 전체 화면을 쓰는 지도 기반 작업 화면이다.

- 좌측은 itinerary/sidebar, day tabs, stop list, drag and drop 일정 관리.
- 중앙/우측은 Kakao 지도 canvas와 custom place overlay, day별 route polyline.
- toolbar, undo/redo, route pen, memo/todo 패널, 초대/설정 모달, 커스텀 일정 모달이 포함된다.
- 지도 marker는 사진 카드형 pin과 day badge를 사용해 여행 카드와 지도 정보를 결합한다.

### Community, Feed, Stories

커뮤니티 영역은 SNS 피드와 여행 매거진의 혼합이다.

- `CommunityPage.vue`: hero header, 인기 여행기 carousel, 전체 여행기 grid, 검색, 페이지네이션.
- overlay feed는 세로 스크롤 feed와 댓글 sidebar를 함께 보여준다.
- `FeedPage.vue`: 독립 feed 화면으로 최신 여행 이야기와 우측 widget/comment panel을 제공한다.
- `StoryWritePage.vue`와 `StoryWriteModal.vue`: 여행기 작성 form, markdown toolbar, 사진 업로드, live preview를 제공한다.

### Record

`RecordPage.vue`는 여행 사진 아카이브다.

- 상단은 큰 제목과 사진 추가/정렬/보기 전환 액션.
- 여행별 horizontal slider로 필터링한다.
- 기록 이미지는 masonry column layout으로 배치한다.
- hover 시 사진 하단 overlay에 일정명과 업로더를 보여준다.
- 사진 추가 모달은 여행 선택, drag/drop 스타일 업로드 zone, preview를 가진다.

### My Page, User Profile

`MyPage.vue`, `UserProfilePage.vue`, `mypage.css`가 담당한다.

- glass profile card, avatar ring, verified badge, tag, 통계 grid, 프로필 액션을 쓴다.
- 좋아요한 장소는 이미지 카드 grid, 여행기는 magazine list로 표현한다.
- 하단 insight는 내 여행 지도와 여행 취향 donut chart를 사용한다.
- 팔로워/팔로잉, 좋아요 장소, 내 여행기는 overlay modal로 확장한다.

### Settings

`SettingsPage.vue`는 현재 가장 단순한 Tailwind card UI다.

- 프로필, 알림, 계정, 로그아웃 섹션으로 구성된다.
- 다른 페이지의 glass/card/gradient 스타일보다 절제되어 있다.
- `original.css`에는 더 풍부한 settings 스타일이 있으나 현재 템플릿은 대부분 사용하지 않는다.

## 8. 인터랙션과 모션

현재 UI는 가벼운 움직임을 제품 감성의 일부로 사용한다.

- 카드 hover: translateY, shadow 강화, 이미지 scale.
- 버튼 hover: lift와 shadow 강화.
- 모달/dropdown: opacity, translate, scale transition.
- 랜딩: reveal, marquee gallery, hero scroll cue.
- 스와이프: drag rotate, decision state, particle burst.
- 기록: masonry fade in과 hover overlay.

`mypage.css`와 일부 전역 스타일에는 `prefers-reduced-motion` 처리가 있으나, 모든 페이지에 일관되게 적용되지는 않았다.

## 9. 접근성과 사용성 메모

잘 적용된 부분:

- 다수의 icon button에 `aria-label`이 있다.
- 모달 일부는 `role="dialog"`와 `aria-modal`을 사용한다.
- 검색 input, 업로드 영역, 슬라이더 버튼 등에 접근성 label이 일부 존재한다.
- focus-visible 스타일이 마이페이지와 일부 카드에 있다.

개선이 필요한 부분:

- 일부 clickable card가 `div`로 구현되어 키보드 접근성이 약하다.
- `href="#"` 기반 액션이 많아 버튼과 링크 역할이 섞인다.
- inline style이 많아 focus/hover/disabled 상태를 일관되게 점검하기 어렵다.
- 모든 motion에 reduced-motion 대응이 적용되어 있지는 않다.

## 10. 현재 디자인 부채

1. 전역 CSS가 너무 크고 페이지별 책임이 섞여 있다.
   `original.css`는 디자인 시스템, 페이지 스타일, legacy 가능성이 있는 스타일을 함께 포함한다.

2. Tailwind 컴포넌트와 전역 `.btn`, `.panel`, `.field`가 혼재한다.
   새 화면을 만들 때 어느 패턴을 우선해야 하는지 명확히 정리할 필요가 있다.

3. `settings` 화면은 다른 서비스 화면보다 단순하고 시각 밀도가 낮다.
   전체 대시보드 톤과 맞추려면 별도 정리가 필요하다.

4. 랜딩 전용 CSS가 `body`를 직접 제어한다.
   라우트 전환 후 body padding/background 영향이 남는지 브라우저 검증이 필요하다.

5. 지도 구현과 스타일 의존성이 혼재한다.
   `main.css`는 Mapbox CSS를 import하지만 Route page는 Kakao SDK를 직접 로드한다.

## 11. 적용 예정 Best Practice

### 디자인 시스템 수렴

디자인 시스템 정리는 한 번에 전체 CSS를 교체하지 않고, 새 작업부터 기준을 적용한 뒤 점진적으로 수렴한다.

1. `frontend/src/styles/main.css`를 토큰 진입점으로 둔다.
   색상, 폰트, shadow, radius, spacing 이름은 이 파일과 Tailwind theme 기준으로 관리한다.

2. `frontend/src/styles/original.css`는 당장 삭제하지 않고 레거시 공통 스타일로 취급한다.
   현재 화면에서 실제로 쓰는 클래스가 많으므로, 사용 여부를 Vue 템플릿과 함께 확인하면서 점진 분리한다.

3. 새 코드의 우선순위는 공통 Vue 컴포넌트다.
   `BaseButton`, `BaseCard`, `BaseInput`, `BaseModal`, `BaseBadge`, `BaseAvatar` 같은 재사용 컴포넌트를 먼저 사용하고, 부족한 variant만 추가한다.

4. 스타일 책임을 분리한다.
   - 전역 토큰: `main.css`
   - 재사용 UI: `components/common/*`
   - 페이지 고유 레이아웃: page scoped style 또는 명확한 page CSS
   - 임시 마이그레이션: TODO 주석이 있는 제한적 inline style

5. hard-coded color보다 토큰을 우선한다.
   예: `#0066ff` 직접 사용보다 `var(--violet)` 또는 `text-brand-violet`을 사용한다.

6. 장기적으로는 스타일을 아래 구조로 분리하는 것을 목표로 한다.

```text
styles/
  main.css
  tokens.css
  base.css
  components.css
  pages/
    landing.css
    route.css
    community.css
    mypage.css
```

### Settings 화면 통일

`SettingsPage.vue`는 다른 서비스 화면과 톤이 다르므로, 전체 제품의 작업형 대시보드 톤에 맞춘다.

1. `AppShell`은 유지한다.
2. 바깥 구조는 서비스 내부 화면과 같은 `section` 기반 레이아웃을 사용한다.

```text
section.settings-page.section
  settings-heading
  settings-layout
    settings-summary
    settings-form
```

3. 좌측에는 프로필 요약 카드를 둔다.
   아바타, 이름, 이메일, 여행 태그, 계정 상태, 저장 상태를 보여준다.

4. 우측에는 설정 패널을 둔다.
   프로필, 알림, 계정, 보안, 연결 계정, 하단 액션 영역을 패널 단위로 나눈다.

5. 이미 `original.css`에 있는 `.settings-*` 스타일을 우선 재사용한다.
   새 스타일을 추가하기 전에 현재 미사용 설정 스타일을 실제 템플릿에 연결할 수 있는지 확인한다.

6. 설정 화면은 작업형 화면이므로 과한 hero나 장식은 피한다.
   `mypage`보다 조용하고, `home`보다 밀도 있는 화면을 목표로 한다.

상세 작업 프롬프트와 체크리스트는 `design_system_todo.md`를 따른다.

## 12. 새 디자인 작업 원칙

새 화면이나 컴포넌트를 만들 때는 아래 순서를 따른다.

1. 기존 토큰을 우선 사용한다: `--violet`, `--blue`, `--rose`, `--surface`, `--line`, `--soft-shadow`.
2. 주요 CTA는 primary gradient, 보조 액션은 ghost/pill을 따른다.
3. 여행 콘텐츠는 실제 사진 또는 장소 이미지를 먼저 배치한다.
4. 협업 정보는 겹친 avatar, activity, member count로 표현한다.
5. 작업형 화면은 panel/grid 구조를 유지하고, 장식보다 조작성과 스캔성을 우선한다.
6. 카드 hover, 모달 transition, 이미지 scale은 사용하되 motion이 핵심 조작을 방해하지 않게 한다.
7. 새 스타일은 가능하면 페이지 scoped style 또는 명확한 컴포넌트 스타일로 격리한다.

## 13. 문서 운영

- 현재 구현 기준 디자인 문서는 이 파일을 우선한다.
- 제품 요구사항이나 UX 정책은 `product-specs/`에 두고, 이 문서에서는 구현된 UI 기준을 설명한다.
- 디자인 변경이 페이지 구조, 색상 토큰, 공통 컴포넌트 패턴에 영향을 주면 이 문서와 `design-docs/index.md`를 함께 갱신한다.
