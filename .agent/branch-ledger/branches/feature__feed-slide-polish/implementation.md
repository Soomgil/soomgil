# 홈 배치 및 커뮤니티 슬라이드

- 최신 develop에서 feature/feed-slide-polish 생성.
- 홈 둘러보기 버튼을 사진 컨트롤 위로 이동하고 라벨/캡션 위치 교환.
- 인기 여행기 두 헤더 문구 제거, 영역 접근성 이름 유지.
- 공유 게시물 상세 피드의 out-in 대기를 동시 슬라이드로 변경. 사진은 방향에 맞는 좌우 슬라이드.
- 드래그 종료 위치에서 피드 전환 시작, 전환 상태 중복 방지 및 휠 관성 중복 전환 제한.
- 잔떨림 원인: original.css의 scroll-snap-type:y mandatory가 transform과 충돌해 전환 매 프레임 scrollTop을 보정. 브라우저에서 최대 762px의 자동 스크롤과 1px 내외 제자리 진동 재현.
- 피드 viewport에 scroll-snap-type:none, overflow:clip, scroll-padding:0, overflow-anchor:none을 적용하고 카드 snap 제거.
- 수정 후 브라우저 프레임 계측: scrollTop 0 유지, 778px 실제 슬라이드 이동. 사진 양방향, 휠/키보드/드래그, 정착 후 위치 안정성 확인.
- 데스크톱 1440px, 모바일 390px fixture 화면 점검. 홈/커뮤니티 테스트 10개 및 production build 검증.
