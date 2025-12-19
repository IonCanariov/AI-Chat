# AI Chat (Internal Company Assistant)

This repository contains a **the backend of a custom internal AI chat system**
built for company use.  
The system is designed as a **shared, multi-user project-based chat**
where conversations and documents act as long-term company memory.

⚠️ **Important:**  

It is **not a production-ready system**.

---

## 🚀 Features

- Project-based chat (each project = one shared conversation)
- Node.js + Express backend
- React frontend
- PostgreSQL database (local development)
- Token usage tracking per project
-  AI agent
- File & document support (architecture-ready)
- Designed for future RAG (embeddings + retrieval)

---

## 🧠 Architecture Overview


---

## 🛠️ Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **AI Orchestration (Planned) our own AI agent that runs on our local server.
- **Storage (Planned):** MinIO (S3-compatible)
- **Embeddings (Planned):** pgvector

---
🧠 Internal AI Chat Platform (full description)

An internal, project-based AI chat system designed to act as a shared company knowledge hub.

This platform allows teams to create shared chat projects, ask questions with full historical context, and progressively build a long-term “company brain” powered by AI.

✨ Key Features

Shared AI projects (company-wide chats)

Project-level context & rules

Persistent chat history

Markdown-rendered AI responses

Token usage tracking per project

Retrieval-Augmented Generation (RAG) ready

Scalable architecture (Agent + Executor model)

🏗 Architecture Overview

Backend (Node.js + Express)
Single authority for persistence, validation, and AI orchestration.

AI Agent (Decision Layer)
Determines intent, retrieval needs, and model selection.

AI Executor (Execution Layer)
Executes AI tasks and returns results.

Database (PostgreSQL + pgvector)
Stores messages, projects, embeddings, documents, and token usage.

🧠 Memory & RAG

All knowledge is persisted in the database.

Embeddings are used only for similarity search.

Top-K retrieval selects the most relevant context without losing historical data.

Documents and prior projects form reusable company memory.

🔐 Security by Design

AI has no database or authorization access.

Backend enforces all rules, limits, and persistence.

Secrets never reach AI or frontend.

Token usage and model fallback are fully controlled.

🚧 Project Status

This repository currently contains:

A complete system architecture and data model

Backend foundations with idempotent messaging

A UI prototype in progress

Temporary AI integration via n8n for rapid prototyping

The system is designed to transition cleanly from prototype → production.

🧠 Core Principle

AI is a tool.
The backend is the law.
The database is the truth.