📌 Purpose of this file

To answer clearly:

What embeddings are for
What they are not
How “company memory” works
Why TOP K = 5 does not mean “only remembers 5 things”
How agent rules like “check existing templates first” are enforced




1️⃣ Core truth about embeddings (LOCK THIS IN)

Embeddings do not store memory.
They store similarity.

Your database stores everything.
Embeddings are just an index to find relevant things faster.

If embeddings disappeared:

you would lose speed

not knowledge



2️⃣ What “memory” actually means

In your system:

Memory = persisted data that can be retrieved later.

This includes:

old projects
chat messages
documents
templates
rules
historical files
Embeddings do NOT replace memory.
They point to parts of memory.

3️⃣ Types of memory in your system
🧠 Short-term memory

recent messages in the current project
passed directly as text
no embeddings required

Used for:

conversation flow
context continuity

🧠 Long-term memory (company memory)

documents
old projects
templates
prior decisions

Accessed via:

embeddings
similarity search

4️⃣ Why embeddings are stored separately

Rules:

embeddings are never inline
embeddings live in their own table

embeddings reference:

message_id OR
document_chunk_id

Why:

different embedding models later
re-embedding possible
faster search
cleaner schema

5️⃣ What TOP K = 5 REALLY means (IMPORTANT)

This query:

SELECT *
FROM embeddings
ORDER BY embedding <-> query_embedding
LIMIT 5;


❌ DOES NOT mean:

“The system only remembers 5 things”

✅ It means:

“Give me the 5 most relevant things for this specific question”

The rest of the memory:

still exists
still searchable
still reusable

just not relevant right now

6️⃣ Why limiting K is REQUIRED

LLMs have:

context limits
cost constraints
diminishing returns

Sending:

200 documents ❌
50 messages ❌

Sending:

top 3–10 relevant chunks ✅

This is precision, not forgetting.

7️⃣ RAG retrieval flow (step by step)

When a user asks something:
User message is saved
Agent analyzes intent
Backend decides:
do we need memory?

If yes:

embed the query
search embeddings table
retrieve top-K chunks
These chunks are passed to:

Agent (for decision)
Executor (for generation)
Embeddings are never sent to the frontend.


8️⃣ Rule: “Check DB first before generating”

Your earlier rule:
“If the user asks for a template, check DB first”
This is enforced by:

Agent intent classification
Backend-controlled retrieval
Executor only runs after retrieval
No executor ever generates blindly.



9️⃣ Embedding creation rules
Messages

embedded asynchronously
only after persistence
only once
immutable
Documents
chunked (≈500–1000 tokens)
each chunk embedded
reusable across projects




🔟 Embeddings are NOT used for

Never use embeddings for:

authorization
filtering users
deciding permissions
storing facts
ranking users
deciding truth

Embeddings are approximate similarity only.

11️⃣ Why pgvector is enough for you

For:

10–15 users
internal system
thousands to low-millions of chunks

PostgreSQL + pgvector:

is sufficient
is simpler
is easier to deploy
is easier to backup

You can migrate later if needed.

12️⃣ Mental model (remember this)

The database remembers everything.
Embeddings help you ask the database the right question.

If you remember only one sentence, remember that.