# Azure Ai Cloud Developer Associate

tokens = chunk of text, how model process text. Tokens have tokenized id like 45867.

2 types of prompts: system prompt and user prompt
system prompt: defines role, behavior, contraints of llm ( config) like "You are a poet".
user prompt: what you want from llm to do? ex: "write a poem"
system prompt has higher priority than user prompt, output is combinnation of both prompts.

Chat completions API: generated response based on conversation history, maintains context. Requires model deployment name and message payload as request body for the API.

Modality: type of data, unimodal models - can handle one type of input , multimodal models - can handle multiple types of input like image, text, audio, video etc.

Microsoft foundary ecosystem:

models: deploy model on serverless inference from claude, chatgpt , meta etc with pas per token pricing

agent service: agents with tools and knowledge base, we can also bring our own agents.

iq: brings enterprise knowledge with agentic retrieval systems.

tools: functionalities/ business logic from mcp servers, vector indices etc

machine learning: make base models more domain centric with fine tuning

control panel: track how agents are behaving, observability for agents

edge: deploy fully local agents with foundry local
