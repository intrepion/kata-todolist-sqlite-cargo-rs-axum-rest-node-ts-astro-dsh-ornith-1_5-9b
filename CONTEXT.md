# To Do List — SQL Server Domain Model Glossary

To Do List is a signed-in, single-tenant app: the server is the source of truth, Astro is UI + a thin REST client. SQLite is the only persistent store. This glossary names what the system owns and how it means; it deliberately excludes implementation details (the REST boundary, the DB schema, or the auth token format live in `docs/adr/` and the code).

## Task

A single line of work on one person's list, stored under exactly one owner. This is the core resource; every other object ties back to it. A task's identity is stable across its whole life, including every change and deletion.
_Avoid_: todo, item, checklist entry

## Revision

An immutable snapshot of a single field's value that a signer captured of one task at one instant. A revision records the schema version of the field that produced it, so reading it is always reading that field as it *was*, never as it is now.
_Avoid_: version, state

## Owner

A signed-in user whose list belongs to them. An owner is the source of the truth for what is on it and the only one who can mutate what is on it. Revisions carry the owner who created them, so "task A at version 3" is unambiguously "for that owner's list."
_Avoid_: user, account

## Field

One attribute of a task, tracked across its own history. A field is a schema version: the value a task can hold for it moves along one forward-only line, and each field keeps its own line.
_Avoid_: property, column

## Field Version

A point on a field's forward-only line — the schema-version of that field a revision is using. Field versions are identified by a field-version id and, once superseded, are frozen: their meaning never changes, so a revision that cites version 2 of a field always reads version 2.
_Avoid_: version, state

## Schema Registry

A table that answers two questions for any field: "which revision of that field is currently current?" and, for either, "what does a value at a given version look like?". It stores the current version, the JSON schema of a value at each version, and each version's forward-only line — so two fields can evolve on their own forward-only lines at the same time.
_Avoid_: metadata

## Change

A field's value moving from one version to another at one instant as recorded in SQL Server. This is the server's audit log of what happened and who did it.
_Avoid_: audit, history

## Version Line

A forward-only sequence of changes for one field — the history of a task's state, its title, and its flags, one per field. Two tasks can share a version line (both carrying state) but never the same field line.
_Avoid_: timeline

## Field Version Line

The forward-only sequence of schema-versions a field has carried, ordered by the time they were created. The newest one is what is current; older ones are frozen and kept so old revisions keep reading as they were meant to.
_Avoid_: schema history, lineage

## Owner Sessions

The set of signed-in sessions (by owner, with a signed-in scope) that can read and write the items on an owner's list. A session is what calls the server; the server is what knows.

## Conflict

Two sessions touching the same task concurrently. Whoever started later wins, and anyone who starts even later is discarded against whoever won last. A conflict is the mechanism the app uses so that two people editing the same list never lose the earlier work.

## Schema

The set of rules describing what a field's value looks like (for each field version) on the server. The server owns the schema — it is the system that answers what a task *means* right now, in SQL Server.
