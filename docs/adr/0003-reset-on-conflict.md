# 0003 — Reset a competing session when its later revision loses a conflict

Context —

A revision that edits the same task at the losing side of a conflict becomes invalid: it holds a version of the field its owner never actually shipped in the new task. The revision's owner may expect the server to treat its payload as the field's current schema version. We needed a recovery path that did not corrupt the winning revision.

We decided that the server, holding the losing revision, resets the owner's current schema version for that task to the winning version, and returns the owner an id (a session id) to call a reset on next time. That id is scoped to a single owner: only calls from that owner reach that version. Why — because once a revision loses, its version id no longer identifies a real schema version, and silently leaving it live means the owner can keep reading "current" as if that lost revision were still authoritative. Rejected to auto-purge the revision's old version line, because other sessions' revisions might also hold versions the owner once shared; only the *owner's* reset is safe to do.

Consequences —

- A reset is a forward-only step on the state version line: it moves current state to the winning version. The owner's copy of the field version id now points at the winning version, and next compare/commit uses that.
- The winning revision is never rewritten, because it is already authoritative — the losing owner's revision stays a history; only that owner's view of "current" changes.
