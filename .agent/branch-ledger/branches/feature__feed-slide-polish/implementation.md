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

## 후속 전환 수정
- 커뮤니티 자체 상세창과 공통 상세창의 중복 구현 모두에 동시 전환 및 wheel gate를 적용.
- 400ms 입력 정지와 900ms 전환 간격을 함께 확인해 지연 관성 입력의 중복 넘김 방지. 키 반복 입력 차단.
- 드래그 중 다음/이전 글의 표지·제목 미리보기를 포인터에 붙여 표시하고 인접 표지 이미지 선로딩.
- 3개 글 fixture로 관성 입력 후 두 번째 글 유지, 전환 및 드래그 중 글 사이 공백 1px 이하, 도착 후 위치 고정 검증.
- production build 및 관련 테스트 13개 통과.

## 커뮤니티 카드와 헤더
- 그리드 축소: 4/3/2열 및 한 페이지 2행(8/6/4개). 리스트 최대 900px, 약 136~168px 높이, 한 페이지 2개. 보기/폭 변경 시 첫 페이지.
- 헤더 fixed + body 고정 padding 및 홈 음수 margin 조합을 제거. sticky 정상 흐름으로 실제 헤더 높이 확보, 불투명 배경 적용.
- 1440/768/390px 카드 크기·가로 넘침·초기 본문/헤더 경계 fixture 검증. App/Home/Community 테스트 및 production build 통과, 반응형 페이지 개수 회귀 테스트 추가 통과.
