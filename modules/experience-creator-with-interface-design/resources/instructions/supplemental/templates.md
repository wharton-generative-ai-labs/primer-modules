# Interactive Experience Templates

## Template Discovery

**CRITICAL: Template folder names are NOT fixed.** Template experiences are identified by their `kind: "template"` field in `experience.json`, not by hardcoded folder names. In production environments, templates are typically uploaded via the Experience Catalog and assigned random UUID folder names.

**Always use `listTemplateExperiences` tool to discover available templates dynamically.** This tool returns:
- `id`: The folder name (UUID or custom name) - use this when referencing templates
- `title`: Human-readable template name
- `description`: What the template is for
- `kind`: Will be "template" for all template experiences
- `agents`: List of agent keys available in the template
- `agentInstructions`: List of instruction files available

**Never assume template folder names like "tutor-template" or "lab-template" - these are development-only conventions.**

## Available Template Types

### Tutor Template
**Identification**: Look for templates with titles containing "Tutor" or descriptions mentioning tutoring/interactive
**Use Case**: Focused, component-driven tutoring where a single agent guides students through interactive learning with visual tools.

**Structure**: Single-agent experience with interactive components
- **Tutor Agent**: Introduces concepts, guides practice using components, adapts difficulty, assesses understanding

**Best For**:
- Math problem-solving with visual manipulables
- Science concept exploration with simulations
- Step-by-step skill practice with immediate feedback
- Data analysis with interactive charts
- Any subject where a single focused tutor with interactive tools is sufficient

**Learning Pattern**: Student works with one tutor who uses interactive components as the primary teaching tools. The tutor explains, the component visualizes, the student interacts, and the tutor adapts.

### Lab Template
**Identification**: Look for templates with titles containing "Lab" or descriptions mentioning lab/exploration/5E
**Use Case**: Multi-phase exploration experiences following the 5E instructional model, where students are introduced to concepts, explore through hands-on experimentation, and debrief their discoveries.

**Structure**: Three-phase experience with interactive components
- **Guide Agent**: Introduces concepts, demonstrates components, prepares students for exploration (Engage + Explain)
- **Lab Agent**: Facilitates hands-on experimentation using components, encourages hypothesis-testing (Explore + Elaborate)
- **Debrief Agent**: Reviews discoveries, connects to theory, assesses understanding (Evaluate)

**Best For**:
- Science experiments and simulations
- Open-ended mathematical exploration
- Data investigation and pattern discovery
- Any subject where students benefit from structured exploration phases
- Topics where the "aha moment" comes from hands-on discovery

**Learning Pattern**: Student is introduced to concepts by a guide, then explores freely with a lab facilitator who asks questions rather than giving answers, then debriefs to consolidate understanding.

## Template Selection Guidelines

### For Intake Agents

When interviewing educators, consider these factors:

**Choose the Tutor template when**:
- Learning objectives involve focused skill practice
- A single progression of increasing difficulty serves the goal
- The component is the primary learning tool
- Students need guided practice more than open exploration
- The experience is relatively linear (learn → practice → master)

**Choose the Lab template when**:
- Learning objectives involve discovery and exploration
- Students benefit from a foundation phase before hands-on work
- The exploration is open-ended with multiple valid paths
- A structured debrief would help consolidate discoveries
- The experience follows a natural explore-then-reflect pattern

### Agent Role Mapping

**Tutor Template:**
- **Tutor**: Teaches, demonstrates with components, guides practice, adapts difficulty, assesses

**Lab Template:**
- **Guide**: Sets context, teaches foundations, briefly demonstrates components, builds curiosity
- **Lab Facilitator**: Asks questions, sets up experiments via components, adapts difficulty, encourages exploration
- **Debrief Coach**: Reviews discoveries, connects to theory, optionally uses components for assessment

### Component Usage by Template

**Tutor Template**: The tutor has full control of components throughout the entire experience.

**Lab Template**: Component usage varies by phase:
- Guide: Brief demonstrations only
- Lab Facilitator: Primary component driver -- most interaction happens here
- Debrief Coach: Optional -- revisit scenarios or run final assessments
