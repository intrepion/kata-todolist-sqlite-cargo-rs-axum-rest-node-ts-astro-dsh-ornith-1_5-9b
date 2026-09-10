# 0001 — Track each field on its own forward-only line using field versions, not a single task

Context —

This is a To Do List where several sessions can be open on the same task at once. We need a way to write a record of "what this task's field looked like at this instant", and then to read that same record back *as it was at that instant*, not as it changes later. The obvious move — evolve the whole task as one changing thing — does not survive two sessions: once the task's schema shifts, every old revision of every field on it shifts too, and comparing "then vs now" becomes meaningless.

We decided to model each field that a signed-in owner keeps as its own forward-only line of state changes ("version line"): each change is a forward-only step, and every change captures the schema version of the field that produced it. Reading a revision therefore means reading a field version, and a field version never changes what it reads as. Comparing two revisions is done against the version lines they sit on: the diff is the sequence of changes the later revision adds on top of the earlier one.

Why it over the obvious —

- Single evolving task. The task is one object that changes. Problem: every change moves the entire object, so a revision captured at change N reads change-N's meaning, not what it actually held at N — old data silently migrates its semantics, and "then" stops meaning "then". Rejected because correctness of comparison depends on it.
- Pure forward-only line without per-field versioning. Keep only the newest state per field. Problem: once the field's schema changes (a flag added), the newest-line history loses the shape of the pre-change values, and a reader of an old revision cannot reconstruct its own field version id meaningfully. Rejected because the schema-registry's job (answer "what is current for this field?" plus "what did it mean at a given version?") requires the version line to be frozen.

Consequences —

- The server owns and answers schema questions: "which field version is current for this owner's list field?", "what does a value look like at version 2?", "which revision of this field is current?". Those answers live in a schema registry, and every revision carries the field-version id that produced it.
- Two tasks can share a version line, but they can share no field version line (one task owns one field). When a conflict happens to one task, the version line for that field is fully recomputed wholesale (we do not mix-and-match fields, because fields evolve on independent forward-only lines).
