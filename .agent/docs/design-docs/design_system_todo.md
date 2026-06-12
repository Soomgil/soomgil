# 디자인 시스템 및 Settings 정리 TODO

작성 기준일: 2026-06-12
대상: `frontend/` Vue 앱
근거 문서: `design.md`

이 문서는 디자인 시스템 수렴과 `SettingsPage.vue` 화면 통일 작업을 시작하기 위한 실행 프롬프트와 TODO 목록이다. 접근성/인터랙션 전수 개선은 Vue 이관 이후 별도 작업으로 다룬다.

## 작업 프롬프트

아래 프롬프트를 새 작업 요청으로 사용할 수 있다.

```text
frontend의 현재 UI 기준을 유지하면서 디자인 시스템 정리와 Settings 화면 통일 작업을 진행해줘.

근거 문서:
- .agent/docs/design-docs/design.md
- .agent/docs/design-docs/design_system_todo.md

목표:
1. main.css를 디자인 토큰 진입점으로 두고, original.css는 당장 삭제하지 않는 레거시 공통 스타일로 취급한다.
2. 새 코드와 수정 코드는 가능한 한 components/common의 BaseButton, BaseCard, BaseInput, BaseModal, BaseBadge, BaseAvatar 패턴을 우선한다.
3. hard-coded 색상/그림자/폰트는 기존 토큰(var(--violet), var(--blue), var(--rose), var(--surface), var(--line), var(--soft-shadow) 또는 Tailwind brand token)으로 수렴한다.
4. SettingsPage.vue를 다른 서비스 내부 화면과 같은 대시보드 톤으로 맞춘다.
5. original.css에 이미 있는 .settings-* 스타일을 먼저 확인하고 재사용한다. 새 스타일은 필요한 최소 범위만 추가한다.

범위:
- frontend/src/pages/SettingsPage.vue
- frontend/src/styles/main.css
- frontend/src/styles/original.css 중 Settings와 공통 토큰에 필요한 부분
- 필요 시 frontend/src/components/common/*의 variant 확장
- 관련 문서 갱신

비범위:
- 전체 original.css 대규모 삭제
- 모든 페이지의 스타일 일괄 리팩터링
- Vue 이관 중인 접근성/인터랙션 전수 수정
- 기능/API 동작 변경

검증:
- npm run build
- /settings 데스크톱/모바일 화면 확인
- /home, /mypage, /community 중 최소 1개 이상 회귀 확인
- 변경한 문서의 링크와 TODO 상태 확인

완료 조건:
- SettingsPage.vue가 AppShell 기반에서 settings-heading, settings-layout, settings-summary, settings-form 구조를 사용한다.
- 설정 화면이 Soomgil의 glass/card/gradient/panel 톤과 맞는다.
- 새 hard-coded 색상 추가가 없거나, 불가피한 경우 이유가 주석 또는 문서에 남아 있다.
- 디자인 시스템 정리 방향이 design.md와 이 문서에 반영되어 있다.
```

## TODO 목록

### 1. 사전 확인

- [ ] `git status --short`로 기존 변경 범위를 확인한다.
- [ ] `frontend/src/styles/main.css`, `original.css`, `SettingsPage.vue`, `components/common/*`를 읽는다.
- [ ] `original.css`의 `.settings-*` 클래스가 현재 템플릿에서 어느 정도 재사용 가능한지 확인한다.
- [ ] 기존 `SettingsPage.vue`가 실제로 사용하는 Tailwind class와 기능 상태를 정리한다.

### 2. 디자인 시스템 기준 적용

- [ ] `main.css`의 Tailwind theme 토큰과 `original.css`의 `:root` 토큰 차이를 비교한다.
- [ ] 새 토큰이 필요하면 먼저 기존 토큰으로 표현 가능한지 확인한다.
- [ ] 공통 버튼, 입력, 카드, 모달, 배지, 아바타 사용 기준을 코드에서 확인한다.
- [ ] 새 Settings 작업에서 가능한 hard-coded hex 값을 추가하지 않는다.
- [ ] 새 inline style은 피하고, 불가피하면 마이그레이션 TODO 또는 scoped style로 제한한다.
- [ ] `original.css`를 삭제하거나 대규모 재배치하지 않는다.

### 3. SettingsPage 구조 개편

- [ ] `AppShell`은 유지한다.
- [ ] 최상위 레이아웃을 `section.settings-page.section` 구조로 바꾼다.
- [ ] 상단에 `settings-heading`을 둔다.
- [ ] 본문을 `settings-layout` 2열 구조로 만든다.
- [ ] 좌측에 `settings-summary` 프로필 요약 카드를 둔다.
- [ ] 우측에 `settings-form`과 `settings-panel` 섹션을 둔다.
- [ ] 프로필, 알림, 계정, 보안/연결 계정을 패널 단위로 나눈다.
- [ ] 하단 저장/취소/로그아웃 액션 영역을 `settings-actions-card` 톤으로 정리한다.

### 4. Settings 화면 UI 세부 기준

- [ ] 프로필 요약에는 아바타, 이름, 이메일, 태그, 상태 배지를 포함한다.
- [ ] 알림 설정은 현재 checkbox를 유지하되 카드형 toggle row로 정리한다.
- [ ] 계정/보안 액션은 아이콘, 제목, 설명, chevron 또는 액션 버튼을 갖게 한다.
- [ ] 주요 저장 액션은 primary gradient 버튼을 사용한다.
- [ ] 보조 액션은 ghost/button 또는 조용한 text action을 사용한다.
- [ ] 로그아웃/위험 액션은 `--rose` 계열로 구분한다.
- [ ] 설정 화면에는 landing hero 수준의 큰 장식이나 과한 이미지 배경을 넣지 않는다.

### 5. 반응형 확인

- [ ] 데스크톱에서는 요약 카드 + 설정 패널 2열 구조를 확인한다.
- [ ] 900px 이하에서는 1열로 전환되는지 확인한다.
- [ ] 모바일에서 버튼 텍스트가 넘치지 않는지 확인한다.
- [ ] 알림 toggle row와 하단 액션 버튼이 줄바꿈되어도 겹치지 않는지 확인한다.

### 6. 검증

- [ ] `npm run build`를 실행한다.
- [ ] `/settings`를 데스크톱과 모바일 viewport에서 확인한다.
- [ ] `/home`, `/mypage`, `/community` 중 최소 1개 이상을 열어 공통 스타일 회귀를 확인한다.
- [ ] 변경한 CSS가 landing, route full-screen layout, modal overlay에 영향을 주지 않았는지 확인한다.
- [ ] 필요하면 `design.md`와 이 TODO 문서를 갱신한다.

## 남겨둘 별도 TODO

아래 항목은 Vue 이관 완료 후 별도 접근성/인터랙션 작업으로 처리한다.

- 클릭 가능한 `div`/`article`을 `button` 또는 `a`로 전환.
- `href="#"` 액션을 실제 `button`으로 변경.
- 모달 focus trap, focus restore, Esc close, background scroll lock 통일.
- drag/drop과 swipe의 키보드 대체 동작 검토.
- toast, form error, carousel disabled 상태의 접근성 보강.
- `prefers-reduced-motion` 전역 적용 확대.
