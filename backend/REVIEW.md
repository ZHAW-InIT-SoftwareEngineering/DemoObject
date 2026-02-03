# Backend Review Findings

Date: 2026-02-03

## Findings (ordered by severity)

### Critical
- unnecessary: `findOneAndUpdate` returns a result wrapper; parsing it as a `Session` will throw and break all update paths.
  - File: `src/repositories/sessionRepository.ts`
  - Lines: 24-31
- DONE: Invalid `mazeId` never 404s because `getMazeById` falls back to maze `0`, so endpoints can return wrong data.
  - Files: `src/services/maze.service.ts`, `src/services/path.service.ts`, `src/api/routes/mazes.routes.ts`
  - Lines: 4-10, 19-22, 60-97

### High
- PATCH `/sessions/:sessionId` does not handle missing sessions; parsing `null` throws → 500 instead of 404.
  - Files: `src/api/routes/sessions.routes.ts`, `src/services/path.service.ts`
  - Lines: 127-139, 5-10
- API contract mismatch: PATCH claims status/path/expiresAt update but only accepts `path`. `UpdateSessionRequest` exists but unused.
  - Files: `src/api/routes/sessions.routes.ts`, `src/api/schemas/session.dto.ts`, `src/api/schemas/path.dto.ts`
  - Lines: 61-76, 14-23, 18-22
- Path validation missing; invalid/diagonal paths produce `'INVALID'` steps and still return 200.
  - Files: `src/api/routes/mazes.routes.ts`, `src/api/routes/sessions.routes.ts`, `src/services/path.service.ts`, `src/util/pathValidation.ts`, `src/domain/path.ts`
  - Lines: 72-87, 106-125, 5-16, 1-21, 30-37

### Medium
- Server starts listening before DB connection completes; early requests can fail.
  - File: `src/bin/www.ts`
  - Lines: 11-21
- `PORT` can be `undefined` or a string; `server.listen(PORT)` can misbehave without parsing/default.
  - Files: `src/config/config.ts`, `src/bin/www.ts`
  - Lines: 1-3, 6, 20
- Inconsistent mapping: reads return raw Mongo documents (with `_id`), updates parse; mapper exists but unused.
  - Files: `src/repositories/sessionRepository.ts`, `src/mappers/session.mapper.ts`
  - Lines: 22, 1-10

### Low
- Domain layer imports services (unused), which breaks layering.
  - File: `src/domain/path.ts`
  - Lines: 1-4
- `findPathBFS` does `nodes.find` per step; pre-indexing would improve performance for larger mazes.
  - File: `src/domain/path.ts`
  - Lines: 91-94
- Env var error message references `DEMO_OBJECT_COLLECTION_NAME` but code expects `SESSION_COLLECTION_NAME`.
  - File: `src/repositories/sessionRepository.ts`
  - Lines: 4-7

## Open Questions / Assumptions
- Should invalid `mazeId` return 404 strictly (no fallback), or should there be a default maze behavior?
- Do you want to reject invalid paths (400) or accept them and return validation errors in the response?
