# 0002 — Conflict resolution, single-owner-per-task, explicit sessions

Context —

We have one owner per task, and several signed-in sessions for that owner can be editing the same list at once. The earlier ADR ("field versions") gave us immutable snapshots keyed by field version, which lets us *compare* two revisions. Now we need to decide what "winning" means when two sessions touch the same task concurrently.

We decided the rule is last-writer-wins on a whole task, keyed by the task version, with the revision carrying the full (owner_id, task_id, field_name, field version id, payload, deleted, updated_at). We do not merge field versions between the sessions: when two sessions edit different fields of the same task concurrently, we do not interleave field versions — we recompute the task version line wholesale. Why — because fields evolve on their own forward-only lines, and interleaving them means one field starts carrying a version number that another field never reached (e.g. one session at v1, another at v2 for the same logical field). Rejected because that produces invalid version-line semantics — the whole line is shared, so the line is all-or-nothing.

Consequences —

- The server is authorized only by (owner_id, task_id, version), and a conflict is resolved by comparing the two competing versions of the same task. The session that started later wins; someone who starts even later is discarded against whoever won last.
- The server owns sessions: a session is what makes a call, the server is what knows. Sessions can be scoped (global vs. single-owner vs. multi-owner) so callers only reach what they should.
- Read-only sessions never conflict, because they do not write the version line — they only read the latest revision each field version holds.
