# GitHub Copilot Orchestration Prompt

## Context: AI Agent Orchestration Framework Implementation

You are tasked with understanding and potentially implementing an AI agent orchestration framework for a coding assistant called darbot-coder. This prompt provides comprehensive analysis of current AI coding tools and their architectural patterns.

## AI Coding Assistant Capability Matrix

### Claude (Anthropic) - The Strategic Orchestrator
**Role**: Technical Architect, Code Mentor, Safety Inspector, Task Coordinator
**Strengths**:
- Deep problem analysis and architectural thinking (5/5)
- Code review and debugging intelligence (5/5)
- Cross-language and cross-domain expertise (5/5)
- Documentation and knowledge transfer (5/5)
- Safety and best practices enforcement (5/5)

**Limitations**:
- No execution environment or real-time testing
- No development environment integration
- Limited real-time knowledge (training cutoff)
- No persistent project context between sessions

**Optimal Use Cases**: System design, code review, problem decomposition, orchestration coordination

### GitHub Copilot CLI - The Command Execution Specialist
**Role**: Command Execution Agent, Terminal Assistant
**Strengths**:
- Real-time execution and command translation (5/5)
- Shell integration across multiple environments (4/5)
- Safety features with confirmation prompts (4/5)
- GitHub ecosystem integration (4/5)

**Limitations**:
- Limited deep reasoning capabilities (3/5)
- Basic repository understanding (2/5)
- Single-model limitation (2/5)

**Optimal Use Cases**: Terminal operations, git commands, system administration, quick scripts

### Aider (Paul Gauthier) - The Autonomous File Editor
**Role**: Implementation Agent, File System Manager, Git Workflow Handler
**Strengths**:
- Repository-level understanding with PageRank mapping (5/5)
- Direct file editing and git integration (5/5)
- Multi-LLM support and cost optimization (5/5)
- Autonomous code generation and validation (5/5)

**Limitations**:
- Deep architectural reasoning (3/5)
- Complex problem decomposition (3/5)
- Safety and security analysis (3/5)

**Optimal Use Cases**: Direct code implementation, file modifications, git operations, refactoring

### Qwen3-Coder (Alibaba) - The Code Generation Specialist
**Role**: Code Generation Specialist, Domain-Specific Implementation
**Strengths**:
- Pure code generation capabilities (5/5)
- Multilingual support (especially Chinese/English) (5/5)
- Open source flexibility and customization (5/5)
- Cost-effective deployment options (5/5)

## darbot-coder Architecture Foundation

darbot-coder (formerly darbot-coder) provides an excellent foundation for AI orchestration with:

**Existing Infrastructure (80% Complete):**
1. Custom Modes System: Specialized AI personas (.darbotmodes)
2. Tool Architecture: 20+ specialized tools for file ops, commands, browser automation
3. Task Management: Hierarchical task orchestration via darbotStack
4. Multi-LLM Support: Provider switching and configuration per mode
5. MCP Integration: External tool expansion capabilities

**Current Limitations:**
- Manual mode switching (no intelligent agent selection)
- Sequential-only task execution (no parallel processing)
- Single agent validation (no cross-agent review)
- Limited workflow automation (manual orchestration)

## Proposed Orchestration Framework

**Core Architecture Pattern:**
```
Human Request → Claude (Analysis & Planning) → Intelligent Agent Selection → Parallel/Sequential Execution → Cross-Agent Validation → Integration Review → Delivery
```

**Key Enhancement Areas:**
1. **Intelligent Task Distribution**: Replace manual mode switching with autonomous agent selection based on task complexity, capabilities, and cost optimization
2. **Parallel Agent Coordination**: Enable multiple agents to work simultaneously on testing, security analysis, documentation, etc.
3. **Cross-Agent Validation**: Multi-agent review processes where implementation is validated by security, testing, and documentation agents
4. **Cost-Optimized Model Routing**: Smart model selection - simple tasks to efficient models, complex reasoning to premium models
5. **Workflow Automation Engine**: Pre-defined templates for feature development, bug fixes, releases, code reviews

## Your Mission:

Analyze the darbot-coder codebase and propose specific implementations for transforming it into an AI agent orchestration platform. Focus on:

1. **Architectural Integration**: How to build orchestration on existing darbot-coder foundation
2. **Agent Communication**: Protocols for multi-agent coordination
3. **Workflow Design**: Templates for common development scenarios
4. **Performance Optimization**: Cost and efficiency improvements
5. **User Experience**: Seamless interaction despite underlying complexity

The goal is to create the first true AI agent orchestration platform for software development, building on darbot-coder's strong foundation while adding the coordination intelligence that makes agent teams more powerful than individual agents.

Remember: The Darbot framework emphasizes "proficiency and determination through ethical results driven outcomes" - ensure all orchestration designs maintain ethical oversight and deliver tangible value to developers.

---

## 📂 **Files to Save**
1. **Save this as**: docs/copilot-orchestration-prompt.md in your darbot-coder repo
2. **Save the analysis as**: docs/ai-orchestration-analysis.md in your darbot-coder repo

These documents will give any AI agent (including future sessions with me) complete context about your orchestration framework vision and the architectural analysis we've conducted. The documentation captures the **evolutionary path** from current AI tools to true AI agent orchestration, with darbot-coder as the ideal platform to implement this vision! 🚀

## Implementation Context

**Repository Location**: ${DARBOT_CODER_ROOT}

**Key Files to Examine**:
- `.darbotmodes` - Current mode definitions
- `src/core/task/Task.ts` - Main task coordination
- `src/core/config/CustomModesManager.ts` - Mode management
- `.darbot/` - Existing workflow XML files
- `src/core/` - Core architecture modules

**Current Capabilities Discovered**:
- ✅ XML-based workflow system with delegation
- ✅ Multi-agent task coordination (see `.darbot/rules-pr-reviewer/1_orchestrator_workflow.xml`)
- ✅ Event-driven task architecture
- ✅ Tool orchestration framework
- ✅ Task persistence and checkpointing

**Next Steps**:
1. Implement intelligent agent selection engine
2. Add parallel task execution capabilities
3. Create cross-agent validation framework
4. Build workflow template system
5. Optimize cost and performance routing