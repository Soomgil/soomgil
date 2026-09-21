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
운영 media bucket에 [s3-cors.json](./s3-cors.json)을 적용해야 `https://soomgil.me`의 preflight가 통과한다.

```powershell
aws s3api put-bucket-cors `
  --bucket <production-media-bucket> `
  --cors-configuration file://infra/aws/s3-cors.json

aws s3api get-bucket-cors --bucket <production-media-bucket>
```

`put-bucket-cors`는 기존 bucket CORS 규칙 전체를 교체하므로, 다른 origin이나 애플리케이션이 같은
bucket을 사용한다면 필요한 기존 규칙을 `s3-cors.json`에 병합한 뒤 적용한다.
