---
id: 20260907T112700Z-bugfix__settings-preferences-note
branch: bugfix/settings-preferences
branchKey: bugfix__settings-preferences
createdAt: 2026-09-07T11:27:00.000Z
baseRef: develop
scope: settings-preferences
status: ready
---

# 환경 설정 기능 정리 및 동작 보강

## 변경 요약

- 설정 화면에서 타임존과 마케팅 이메일 수신 항목, 알림 설정 헤더와 구분선을 제거하고 단일 환경 설정 카드로 통합했습니다.
- 표시 언어를 한국어와 영어로 제한하고 공통 내비게이션, 설정, 로그인, 회원가입 화면에 실제 번역을 적용했습니다.
- 비공개 프로필은 본인과 승인된 팔로워가 자기소개와 팔로우 목록을 볼 수 있도록 보강했습니다. 공개 커뮤니티 게시물은 계속 공개됩니다.
- 여행 초대 이메일 수신에 동의하고 기본 이메일 인증을 마친 사용자에게만 초대 이메일을 발송합니다.
- 인앱 여행 초대 경로를 실제 프론트엔드 라우트와 일치하도록 수정했습니다.
- 새로고침 시 저장된 토큰을 갱신하고 현재 사용자 정보를 복원한 뒤 라우터가 보호 화면에 진입하도록 수정했습니다.
- `useAuth`가 반환하는 사용자 상태의 반응성을 유지해 설정 화면의 프로필 정보가 복원 후 즉시 표시되도록 했습니다.

## 운영 참고

- 배포 환경에서는 `MAIL_TRIP_INVITE_BASE_URL`을 공개 프론트엔드의 `/trip-invites` 주소로 설정해야 합니다.
- 이메일 발송 실패는 여행 초대와 인앱 알림 생성을 취소하지 않습니다.

## develop 통합 시 반영할 내용

- frontend/backend submodule commit과 orchestration pointer 및 `.env.example`을 함께 갱신합니다.
- 통합 후 branch ledger 인덱스를 재생성합니다.
