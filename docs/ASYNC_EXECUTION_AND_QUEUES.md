📌 Purpose of this file

To define:

when async execution is REQUIRED
when sync execution is acceptable
what async actually means in your system
how failures are isolated
how this scales from 1 → 15 → 100 users

**1️⃣ Fundamental rule (LOCK THIS IN)**

User-facing APIs must never depend on AI execution to complete.

AI is:

slow

unpredictable
expensive
rate-limited

Persistence is:

fast
deterministic
cheap

Therefore:

/api/chat = synchronous
Agent / Executor = optional async


**2️⃣ Synchronous vs Asynchronous — Definitions**

🔹 Synchronous execution

Happens in the same request lifecycle
User waits for response
Errors propagate immediately

🔹 Asynchronous execution

Happens after API response
Triggered by backend
Result arrives later (polling, push, refresh)

**3️⃣ What MUST be synchronous**

These steps must always be synchronous:

Authentication
Request validation
Message persistence
Idempotency handling
API response to frontend
If any of these are async → system is broken.

4️⃣ What SHOULD be asynchronous (default)

These should default to async:

Agent decision-making
RAG retrieval
LLM calls
Long document processing
Multi-step tool execution
Retry logic
Fallback models

Why:

prevents UI blocking
isolates failures
enables retries
supports queues later


**5️⃣ When synchronous AI is acceptable (rare)**

Synchronous Agent/Executor calls are acceptable only if ALL are true:

Expected execution < 500ms
No document retrieval
No multi-step reasoning
No retries needed
Low cost model
User explicitly expects instant response

Example:

intent classification
simple routing decision
yes/no questions

Even then:

Persistence must already be done first.


**6️⃣ Async execution models (conceptual)**

Your system supports three async models, progressively:

Model A — Fire-and-forget (initial)
Backend triggers Agent
Result saved when ready
Frontend polls
Simple, enough for now.
Model B — Background worker
Backend enqueues task
Worker consumes queue
Results persisted
Better isolation, retry support.
Model C — Streaming
Executor streams tokens
Backend forwards to frontend
Persistence happens incrementally
Advanced, optional later.

**7️⃣ Failure handling rules (IMPORTANT)**

If Agent fails:

Log failure
Optionally retry
User message remains valid

If Executor fails:

Save failure metadata
Optionally fallback model
Optionally notify user

If backend crashes:

Persisted messages are safe
Async tasks can resume later


**8️⃣ What async does NOT change**

Async execution does NOT change:

DB schema
/api/chat contract
idempotency logic
frontend behavior

This is internal system behavior only.

**9️⃣ Why queues are a LATER concern**

You do NOT need:

Redis
RabbitMQ
Kafka
BullMQ
Yet.

For 10–15 users:

in-process async
background jobs
cron-style retries
Are enough.

This file exists so you don’t overbuild too early.

**10️⃣ Mental model (remember this)**

Async is about isolating risk, not about speed.

Speed comes later.
Correctness comes first.