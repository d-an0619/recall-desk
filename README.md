# codegeist-2026

Atlassian Codegeist 2026 해커톤(Devpost) 출품작. Forge 앱.

- 규칙: https://codegeist2026.devpost.com/rules
- 마감: 2026-12-22 12:00 PT (한국 12/23 수 05:00)

## 반드시 지킬 것
- Forge 플랫폼 앱 + Atlassian 제품 1개 이상 연동 (Jira, Confluence, JSM, Bitbucket, Teamwork Graph, Rovo).
- 심사위원이 설치 링크로 깔 수 있어야 함. 설치·설정 안내 포함.
- 5분 미만 YouTube 데모 영상, 기능 설명문.
- 카테고리 1개 선택: Software Teams / Business Teams / Specialized Industries.

## 주제와 심사 (규칙 원문, 2026-11-24 확인)
- 표어: "Build with context. Ship with confidence." 연결된 맥락(context)을 팀에 주는 앱.
- Specialized Industries: "Give experts in healthcare, finance, manufacturing, automotive, or other fields the context to do their best work."
- 심사 5개 항목, 동일 가중치:
  - Technological Implementation: 얕은 래퍼나 하드코딩된 데모 경로가 아닌 실제 동작하는 구현인가
  - Design: 기술 검증이 아닌 완결된 제품 경험인가
  - Potential Impact: 실제 대상의 실제 문제를 구체적으로 푸는가
  - Innovation/Idea: 기존 것과 얼마나 다른가
  - Presentation: 영상이 처음부터 끝까지 동작을 보여주고, 문제·대상·이유를 전달하는가
- 동점이면 위 순서대로 앞 항목 점수가 높은 쪽.

## 출품작: Recall Desk
- 카테고리 Specialized Industries (automotive), 보너스 Best Agents (`rovo:agent`).
- 정비소·딜러의 JSM 요청에서 VIN으로 차량 정보와 미해결 리콜을 조회해 패널에 표시. Rovo 에이전트가 고객 답변 초안과 작업 체크리스트 작성.
- 데이터: NHTSA 공개 API (키 불필요)
  - `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{VIN}?format=json`
  - `https://api.nhtsa.gov/recalls/recallsByVehicle?make=&model=&modelYear=`

## 개발 환경
- Forge CLI 16.0.0 은 Node `^22.23.4 || ^24.22.1 || >=26.12.1` 필요. `nvm use` (`.nvmrc` = 24) 후 `forge` 실행.
