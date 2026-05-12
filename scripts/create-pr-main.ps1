# Cria o PR feature/anderson-backend-setup -> main (corpo preenchido).
# Pré-requisito (uma vez): gh auth login
#   ou: $env:GH_TOKEN = "seu_personal_access_token"

$ErrorActionPreference = "Stop"

$body = @'
## Objetivo
Unificar na **main** o frontend (issues **#1**, **#2**, **#9**) com o backend Javalin, documentação completa e fluxo Git (**#5**).

## Correção incluída
O `pom.xml` tinha ficado sem **Javalin**, **BCrypt** e driver **JDBC** PostgreSQL; isso quebrava `mvn package` e a CI. Restaurado + classe **`com.nextcut.app.App`** conforme issue **#3**.

## Critérios de aceite (Semana 1)
- [x] **#1** — Vite + React + Tailwind + README
- [x] **#2** — Button / Input / Card + demonstração
- [x] **#3** — Maven, deps, pacotes, `App`, porta 8080, `GET /` 200
- [x] **#5** — CONTRIBUTING + template de PR (+ conferir proteção da `main` nas Settings)
- [x] **#9** — `mvn test`, `npm test`, Actions, badge (Vitest no frontend)

Após merge, validar workflow **NextCut — CI Tests** na aba Actions.
'@

$bodyFile = Join-Path $env:TEMP "nextcut-pr-body.md"
$body | Set-Content -Path $bodyFile -Encoding utf8

$gh = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) { $gh = "gh" }

& $gh pr create `
    --repo AndersonFQueiroz/NextCut `
    --base main `
    --head feature/anderson-backend-setup `
    --title "feat: unificar frontend + backend na main (Semana 1 — #1 #2 #3 #5 #9)" `
    --body-file $bodyFile

Write-Host "Concluído."
