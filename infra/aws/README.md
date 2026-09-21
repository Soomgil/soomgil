# AWS 운영 설정

## OAuth callback

운영 프론트엔드는 `PUBLIC_APP_URL=https://soomgil.me`를 사용하며 다음 callback URI를 생성한다.

- Google: `https://soomgil.me/auth/oauth/google/callback`
- Kakao: `https://soomgil.me/auth/oauth/kakao/callback`

Google Cloud Console의 OAuth 2.0 Client `승인된 리디렉션 URI`와 Kakao Developers의
`제품 설정 > 카카오 로그인 > Redirect URI`에 위 값을 대소문자, scheme, host, path까지 동일하게 등록한다.
백엔드 운영 환경의 `GOOGLE_REDIRECT_URI`, `KAKAO_REDIRECT_URI`도 각각 같은 값으로 둔다.

## S3 browser upload CORS

브라우저는 signed PUT URL에 `content-type`, `content-length`와 AWS 서명 header를 전송한다.
운영 media bucket에 [s3-cors.json](./s3-cors.json)의 규칙을 적용해야 `https://soomgil.me`의 preflight가 통과한다.
다음 스크립트는 버킷의 기존 CORS 규칙을 보존하고 숨길 업로드 규칙만 추가하거나 갱신한다.
`s3:GetBucketCORS`, `s3:PutBucketCORS` 권한이 있는 AWS 자격 증명과 Python `boto3`가 필요하다.

```powershell
python -m pip install boto3
python infra/aws/ensure_s3_cors.py --bucket soomgil-media-prod-264347117940-ap-northeast-2
python infra/aws/ensure_s3_cors.py --bucket soomgil-media-prod-264347117940-ap-northeast-2 --apply
```

적용 후 `https://soomgil.me`에서 프로필 사진을 저장해 브라우저의 S3 `OPTIONS`와 `PUT` 요청이 성공하는지 확인한다.
