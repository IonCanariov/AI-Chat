**📌 Purpose of this file**


*To define:*

the exact lifecycle of a user message
what is synchronous vs asynchronous
where failures are allowed
where data is persisted
who is authoritative at every step

This prevents:

race conditions
double AI runs
phantom messages
token miscounting
“AI did something weird” bugs

**1️⃣ High-level orchestration principle**

The backend is the single authority and conductor.

AI systems (Agent & Executor) are advisors and workers, never decision owners.

**2️⃣ Full lifecycle of a user message** 

Step-by-step (authoritative flow)
User
 ↓
Frontend
 ↓
POST /api/chat
 ↓
Backend

*Step 1 — Request validation & auth (SYNC)*

Backend:

authenticates user
validates request body
rejects malformed requests immediately

❌ No DB
❌ No AI
❌ No side effects

*Step 2 — Persist user message (SYNC, IDP-safe)*

Backend:

saves user message to messages
enforces idempotency via DB
returns existing message if duplicate

At this point:

message is guaranteed persisted
message has a stable ID
This is the first and only hard guarantee.

*Step 3 — Immediate response to frontend (SYNC)*

Backend responds:

{
  "status": "accepted",
  "message": { ... },
  "duplicate": false
}


Frontend:

updates UI
does NOT wait for AI
treats duplicates as success

This ensures:

fast UI
retry safety
no spinner hell

**3️⃣ Agent invocation (ASYNC or SYNC — backend choice)**

After responding to frontend, backend may:
invoke Agent immediately
enqueue Agent work
delay execution
skip execution entirely

Important:

Agent invocation is not part of the API contract.

Backend decides.

**4️⃣ Agent decision phase**

Backend sends:

sanitized project data
user message
retrieved context
system rules

Agent returns:

intent
complexity
action
executor recommendation

Agent cannot:

modify DB
see auth data
run tools
call executors

**5️⃣ Backend approval & control**

Backend evaluates Agent output:

Checks may include:

cost limits
rate limits
project settings
daily token caps
allowed executor types

Backend may:

approve
downgrade model
override executor
ask clarifying question
stop execution

This is where *company policy lives.*



**6️⃣ Executor invocation**

If approved:

Backend:

constructs executor task
applies constraints
invokes executor

Executor:

performs work
returns result + usage
never retries itself

**7️⃣ Persist assistant message (SYNC)**

Backend:

saves assistant message
logs token usage
updates project totals
This is separate from user message persistence.

If executor fails:

backend decides fallback
user still has their message saved

**8️⃣ Frontend update (PUSH or POLL)**

Frontend may:

poll for new messages
receive WebSocket update
receive SSE stream (future)
This is UI concern, not core logic.

**9️⃣ Failure scenarios (explicitly allowed)**

Allowed failures:

Agent fails → user message still exists
Executor fails → user message still exists
AI timeout → retry later
Model limit reached → fallback model

Forbidden failures:

Losing user messages
Double token counting
Duplicate AI responses
AI writing directly to DB

**10️⃣ Why this architecture scales**

This flow allows:

async workers
background queues
streaming responses
multi-agent logic
offline processing
audit & replay

Without breaking:

/api/chat
DB integrity
frontend logic

**11️⃣ Mental model (memorize this)**

Persist first. Decide second. Execute third. Respond independently.

( If you remember only one thing, remember this.  )