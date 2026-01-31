"""
🤖 Agentic Framework - Multi-Agent Task Execution

Sistema di esecuzione parallela con LLM locali (Radeon 7900 XTX via Ollama).

Usage:
    from agentic import Dispatcher, AgentType
    
    # Quick task
    d = Dispatcher()
    result = d.run("Write a Python function to calculate fibonacci")
    print(result.output)
    
    # Parallel execution
    results = d.parallel([
        "Write the API routes",
        "Create database models",
        "Write unit tests"
    ])
    
    # Forced agent type
    result = d.run("Write tests for user auth", agent_type=AgentType.TESTER)
    
    # Pipeline
    results = d.pipeline([
        {"agent": "coder", "task": "Write a user model", "name": "model"},
        {"agent": "tester", "task": "Test this: {model}", "name": "tests"},
    ])
"""

from .dispatcher import (
    Dispatcher,
    Task,
    TaskResult,
    AgentType,
    LLMClient,
    AGENT_MODELS,
    AGENT_PROMPTS,
)

__all__ = [
    "Dispatcher",
    "Task",
    "TaskResult",
    "AgentType",
    "LLMClient",
    "AGENT_MODELS",
    "AGENT_PROMPTS",
]

__version__ = "0.1.0"
