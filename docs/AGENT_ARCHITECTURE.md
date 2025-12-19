***Purpose of this file***

To define:

what the Agent (Brain) is
what the Executor is
what the backend is responsible for
what is AI-driven vs rule-driven

**1️⃣ High-level overview**

This system uses a two-layer AI architecture:

Agent (Brain AI)
→ decides what should happen

Executor (Worker AI / Tooling)
→ performs the task decided by the agent

The backend orchestrates both but does not replace them.

**2️⃣ Agent (Brain AI) — Responsibilities**

The Agent is an AI system whose job is decision-making, not content generation.

The Agent receives:

user message

project context

retrieved memory (RAG)

system rules

The Agent decides:

intent of the message

complexity level

whether existing company knowledge should be reused

whether AI execution is required

which model / executor should be used

whether the task should be synchronous or asynchronous

The Agent does NOT:

generate long responses

write final output

save messages to the database

talk directly to the frontend


**3️⃣ Executor (Worker) — Responsibilities**

The Executor is responsible for doing the work.

Executors may include:

LLM calls (OpenAI, local models)

template generation

summarization

classification

document analysis

tool calls

future automations

The Executor:

receives a task instruction

produces an output

returns metadata (tokens, model used, etc.)

The Executor does NOT:

decide whether it should run

decide which model to use

access the database directly

decide how results are stored


**4️⃣ Backend — Responsibilities**

The backend is the orchestrator and enforcer.

It:

authenticates users

validates requests

persists messages

enforces idempotency

calls the Agent

calls the Executor

saves outputs

logs tokens and costs

updates project totals

The backend never delegates authority to AI.


**5️⃣ Why Agent ≠ Hardcoded Rules**

Some decisions cannot be reliably hardcoded:

“Is this question simple or complex?”

“Does this match an existing company template?”

“Should I reuse prior project knowledge?”

“Is GPT-5.1 overkill here?”

“Is this a request for a document, analysis, or chat?”

These are classification and reasoning problems, not if/else logic.

Therefore:

the Agent itself is an AI

but it operates under strict backend rules


**6️⃣ Safety boundary (CRITICAL)**

The Agent:

can recommend actions

can select models

can request tools

But the backend:

approves or rejects

enforces limits

handles failures

owns persistence

AI never has final authority.


**7️⃣ Example (mental model)**

User says:

“I need a contract template for suppliers”

Flow:

/api/chat stores message

Backend sends context to Agent

Agent decides:

intent: “template request”

check company memory first

Backend retrieves documents

Agent decides:

reuse existing template

fill missing info

Executor generates output

Backend saves assistant message

Frontend just sees messages appear.