**📌 Purpose of this file**

To clearly define:

what AI is NEVER allowed to do
what data boundaries exist
how cost & abuse are controlled
where trust begins and ends

If this file exists, future developers (including future-you) cannot accidentally break the system.

**1️⃣ Core security principle (LOCK THIS IN)**

AI has zero authority.
The backend has total authority.

AI:

cannot authenticate
cannot authorize
cannot persist
cannot execute tools freely

Backend:

validates
decides
enforces
persists

**2️⃣ Authentication & authorization boundaries**
Authentication

handled only by backend
via session / JWT / middleware
never by AI
never by frontend alone
Authorization
project access is checked before persistence
AI never sees auth tokens
AI never decides access



**3️⃣ Absolute AI prohibitions (VERY IMPORTANT)**

AI (Agent or Executor) must never:

access the database directly
write files
read environment variables
see API keys
call external APIs freely
decide pricing
decide billing
decide permissions
bypass backend rules
modify past messages

If an AI suggests any of the above:

Backend must ignore or reject it.




**4️⃣ Prompt & reasoning safety**

Rules:

system prompts are backend-only
agent reasoning is ephemeral
chain-of-thought is never stored
chain-of-thought is never returned to users

You store:

outputs
not reasoning

This protects:

security
IP
compliance
model upgrades later




**5️⃣ Cost & token guardrails**
Backend-enforced limits

Backend must enforce:

per-project daily token limits
per-model daily caps
executor timeouts
fallback model rules
AI may suggest models.
Backend decides.
Model fallback rule

If a preferred model:

hits daily cap
times out
errors

Backend:

selects next allowed model
logs fallback
continues execution
User experience continues uninterrupted.





**6️⃣ Rate limiting & abuse prevention**

Backend must protect:

/api/chat
ingestion endpoints
background execution

Rules:

rate limit per user
rate limit per project
never trust frontend throttling

This protects you even internally.

**7️⃣ Environment & secrets handling (GitHub-safe**)

Rules:

.env files are NEVER committed
API keys live only in environment
secrets never appear in logs
secrets never reach AI
secrets never reach frontend

Minimum setup:

.env
.env.example
.gitignore



**8️⃣ Logging rules**

Allowed to log:

request IDs
message IDs
project IDs
execution status
token counts

Never log:

prompts
embeddings
API keys
auth tokens
full user messages in prod logs




**9️⃣ n8n-specific guardrails**

n8n:

is automation-only
has limited DB access
never handles live chat
never holds secrets permanently
runs ingestion & batch jobs only
n8n is a worker, not a brain.

**🔟 Future-proofing rule**

Any future feature must answer:

who authorizes this?
who persists this?
who pays for this?
what happens if AI fails?

If the answer is unclear → feature is rejected.

**11️⃣ Mental model (final one)**

AI is a powerful tool.
The backend is the law.
The database is the truth.

Memorize this. It will save you years.