**📌 Purpose of this file**

To answer once and forever:

What gets written to the database
At which step in the flow
By which component
What is never persisted

This file must align with:

your existing DB schema
idempotency rules
async execution model

**1️⃣ Core persistence principle (LOCK THIS IN)**

Only the backend is allowed to write to the database.

Agent ❌

Executor ❌

Frontend ❌

n8n ❌ (except ingestion workflows later)

This is non-negotiable.

**2️⃣ messages table — rules**
What is stored
Field	           Source	      When
project_id     	backend	         always
user_id	      auth context	 user messages only
role	         backend	     always
content     user / executor	     always
metadata	      backend	     optional
created_at	        DB	         automatic




*User messages*

Saved:

synchronously
before any AI runs
idempotent

Rules:

role = user
must include client_message_id in metadata
duplicates return existing row
content is saved verbatim
Assistant / agent messages

Saved:

after executor completes
only once
never idempotent

Rules:

role = assistant or agent
user_id = NULL
metadata may include:
model used
executor type
agent decision reference

What is NEVER stored in messages
prompts:

system rules
full RAG context
raw agent JSON
internal errors
retries

Messages are conversation history, not debug logs.

**3️⃣ tokens_log table — rules**

Purpose

Internal accounting only.

Used for:

audits
cost analysis
monitoring
fallback logic
Not user-facing (except project totals).
When a row is written
A row is written only if an executor successfully runs.

Never written:

for user messages
for duplicate messages
for failed executions
for agent-only decisions

Fields (conceptual)

Field	                 Meaning
project_id	          cost attribution
message_id	          assistant message
model	              actual model used
tokens_input	      prompt + context
tokens_output	      generated text
total_tokens	      sum
created_at	          DB time


**4️⃣ Project-level token totals**

projects.total_tokens_used
Rules:

updated only after successful executor runs
incremented atomically with tokens_log
never decremented
never recalculated live

This is a cached value for UI.

**5️⃣ Embeddings persistence (overview only)**

(Details come in File 7.)

Rules for now:

embeddings are saved separately
messages and documents may have embeddings
embeddings are never overwritten
embedding creation is async

**6️⃣ Documents & document chunks**
Documents

Saved when:

user uploads files
historical data is imported
n8n ingestion runs

Rules:

document text is chunked
chunks are embedded
documents are reusable across projects (company memory)

Chunks

Rules:

immutable
linked to parent document
embeddings stored per chunk
retrieval is read-only

**7️⃣ Attachments**

Rules:

binary files → object storage (MinIO)
DB stores metadata only
attachments belong to:
a message or
a document
never both


**8️⃣ What is NEVER persisted (important)**

These things must never hit the DB:

API keys
raw prompts
full agent reasoning
chain-of-thought
temporary RAG results
executor retries
partial generations

If it’s not needed for:

history
auditing
costs

→ it does not belong in the DB.


**9️⃣ Failure guarantees**

Even if:

agent crashes
executor times out
model quota is exceeded
The following are guaranteed:
user message exists
DB is consistent
no duplicate tokens
no partial rows



**10️⃣ Mental model (remember this)**

Persist facts, not thoughts.

Facts:

messages
costs
totals

Thoughts:

agent reasoning
prompts
context

Thoughts stay ephemeral.