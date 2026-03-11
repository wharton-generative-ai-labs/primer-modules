# Educational Experience Templates

## Template Discovery

**CRITICAL: Template folder names are NOT fixed.** Template experiences are identified by their `kind: "template"` field in `experience.json`, not by hardcoded folder names. In production environments, templates are typically uploaded via the Experience Catalog and assigned random UUID folder names.

**Always use `listTemplateExperiences` tool to discover available templates dynamically.** This tool returns:
- `id`: The folder name (UUID or custom name) - use this when referencing templates
- `title`: Human-readable template name
- `description`: What the template is for
- `kind`: Will be "template" for all template experiences
- `agents`: List of agent keys available in the template
- `agentInstructions`: List of instruction files available

**Never assume template folder names like "roleplay-template" or "teachback-template" - these are development-only conventions.**

## Available Template Types

### Roleplay Template
**Identification**: Look for templates with titles containing "Roleplay" or descriptions mentioning role-playing
**Use Case**: Role-playing scenarios and character interactions where students practice skills through simulated conversations and interactions.

**Structure**: Three-phase experience with character-based learning
- **Mentor Agent**: Introduces concepts, provides context, and prepares students for practice
- **Practice Agent (Gamemaster)**: Acts as a counterpart character for role-playing scenarios (negotiator, interviewer, customer, etc.)
- **Feedback Agent**: Evaluates performance and provides constructive feedback (often the same character as the mentor)

**Best For**:
- Business negotiations
- Job interviews  
- Customer service scenarios
- Sales pitches
- Conflict resolution
- Public speaking to specific audiences

**Learning Pattern**: Student practices interpersonal skills by adopting a role and interacting with AI characters in realistic scenarios.

### Teachback Template
**Identification**: Look for templates with titles containing "Teachback" or descriptions mentioning teaching/knowledge demonstration
**Use Case**: Knowledge demonstration and explanation scenarios where students must teach concepts back to validate their understanding.

**Structure**: Three-phase experience focused on knowledge transfer
- **Mentor Agent**: Introduces complex concepts, provides examples, and sets up the teaching challenge
- **Practice Agent (Student Character)**: Acts as a learner who needs concepts explained (confused student, new employee, etc.)
- **Feedback Agent**: Evaluates the clarity and accuracy of the student's explanations (often the same character as the mentor)

**Best For**:
- Complex concept mastery
- Technical knowledge validation
- Teaching skills development
- Knowledge synthesis
- Explaining procedures or processes
- Breaking down complex ideas for others

**Learning Pattern**: Student demonstrates mastery by teaching concepts to AI characters, requiring deep understanding and clear communication.

## Template Selection Guidelines

### For Intake Agents

When interviewing educators, consider these factors to select the appropriate template:

**Choose the Roleplay template when**:
- Learning objectives involve interpersonal skills
- Students need to practice conversations or negotiations  
- The skill requires adapting to different personality types
- Real-world application involves interacting with specific roles (customers, bosses, etc.)
- Assessment focuses on communication style and adaptability

**Choose the Teachback template when**:
- Learning objectives involve understanding complex concepts
- Students need to demonstrate knowledge mastery
- The skill involves explaining things to others
- Real-world application requires teaching or training others
- Assessment focuses on comprehension depth and explanation clarity

### Character Role Mapping

Each template has consistent character roles that serve different pedagogical functions:

**Mentor Agent Role**: 
- Sets context and stakes
- Teaches foundational concepts
- Prepares students for practice
- Provides encouragement and guidance

**Practice Agent Role**:
- *In Roleplay template*: Counterpart character with specific motivations and goals
- *In Teachback template*: Learner character who needs concepts explained

**Feedback Agent Role**:
- Evaluates student performance against learning objectives
- Provides specific, actionable feedback
- Highlights strengths and areas for improvement
- Often returns to the mentor character persona
