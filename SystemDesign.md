# System Design

## Overview

The Rent A Room platform connects tenants with room owners through a hybrid, AI-powered compatibility engine. It combines deterministic filtering, semantic retrieval, and LLM-based reasoning to recommend the most suitable rooms.

The frontend is built with Next.js, the backend with FastAPI, and Supabase PostgreSQL stores structured data. Cloudinary manages room images, Pinecone handles semantic vector search, and Ollama (Qwen3:4B) generates compatibility explanations locally.

## Compatibility Scoring Design

The recommendation pipeline follows a multi-stage approach to balance performance with recommendation quality.

### 1. SQL Filtering

When a tenant searches for rooms, PostgreSQL first applies deterministic filtering using structured fields such as:

- Preferred location
- Budget range
- Move-in date

This removes irrelevant listings before any AI processing, reducing computation and improving response time.

### 2. Semantic Retrieval

Each room listing is converted into a synthesized document containing location, rent, room type, furnishing status, tags, and description. This document is embedded using the Sentence Transformers model `all-MiniLM-L6-v2` and stored in Pinecone.

When a tenant submits a search, their preferences, tags, and optional natural-language description are embedded using the same model. Pinecone then performs cosine similarity search only on the SQL-filtered candidate rooms and returns the top-K most semantically relevant listings.

### 3. Rule-Based Compatibility

For every retrieved listing, a deterministic compatibility score is calculated using the following weights:

| Factor | Score |
|--------|-------|
| Location match | 30 points |
| Budget match | 30 points |
| Move-in date compatibility | 20 points |
| Tag and amenities match | 20 points |

This produces a stable baseline score that remains consistent for identical inputs.

### 4. AI Compatibility Reasoning

The top-K listings are passed to Ollama running the Qwen3:4B model through LangChain ChatOllama.

Instead of calculating compatibility from scratch, the LLM receives:

- Tenant profile
- Room listing
- Rule-based score
- Semantic similarity score

The model evaluates semantic alignment between the tenant's preferences and the room description, and it may adjust the score by at most ±5 points. It returns structured JSON containing:

- Final compatibility score
- Summary
- Strengths
- Missing preferences
- Recommendation

Compatibility results are stored in PostgreSQL and reused for future searches to avoid repeated LLM execution.

## LLM Integration and Fallback

The LLM is integrated using LangChain with ChatOllama and Pydantic structured output validation.

To ensure reliability, every AI request includes fallback handling. If Ollama is unavailable, times out, or returns invalid output, the system skips AI reasoning and returns the deterministic rule-based score with a fallback message indicating that AI reasoning was unavailable.

This keeps search functionality available while providing graceful degradation.

Compatibility results are also cached per tenant-room pair. Cache entries are invalidated whenever a room listing or tenant profile changes, keeping recommendations accurate while minimizing unnecessary LLM calls.

## Real-Time Chat Implementation

Communication between tenants and owners is enabled only after an owner accepts an interest request.

FastAPI WebSockets provide bidirectional real-time messaging without requiring page refreshes. Each accepted request creates a dedicated chat channel where both users can exchange messages instantly.

Messages are persisted in PostgreSQL with sender ID, receiver ID, room ID, timestamp, and message content. This allows users to retrieve previous conversations even after reconnecting.

The frontend maintains an active WebSocket connection while the chat page is open, ensuring low-latency communication similar to modern messaging applications.

## Notification Flow

The platform implements both in-app notifications and email notifications.

### In-App Notifications

Notification records are stored in PostgreSQL and displayed in the application's notification center. Examples include:

- New interest request received
- Request accepted
- Request rejected
- Listing marked as filled

### Email Notifications

Emails are delivered using Resend.

The system sends emails for important events such as:

- A tenant with a compatibility score above the configured threshold expresses interest in a room.
- An owner accepts a tenant's request.
- An owner rejects a tenant's request.

Email delivery runs through FastAPI BackgroundTasks, allowing API responses to return immediately while notifications are sent asynchronously. This prevents email latency from affecting user experience.

## Overall Architecture

The system separates responsibilities across specialized components:

| Component | Responsibility |
|-----------|----------------|
| PostgreSQL (Supabase) | Users, listings, chats, compatibility cache, notifications |
| Cloudinary | Room image storage |
| Sentence Transformers | Local embedding generation |
| Pinecone | Semantic vector retrieval |
| Rule Engine | Deterministic compatibility scoring |
| Ollama (Qwen3:4B) | AI reasoning and explanation |
| Resend | Email notifications |
| FastAPI WebSockets | Real-time chat |

This hybrid architecture combines deterministic filtering, semantic search, and AI reasoning to produce scalable, explainable, and efficient room recommendations while maintaining graceful fallback behavior and responsive real-time communication.