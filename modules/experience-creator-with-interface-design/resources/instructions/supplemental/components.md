# Component Design Guidance

This reference helps you understand what interactive components are and how to discuss them with educators during the intake process.

## What Are Components?

Components are interactive visual tools that students can manipulate during an experience. They run alongside the AI tutor/facilitator and enable hands-on learning. Examples:

- A draggable triangle for exploring trigonometric ratios
- A simulation where students adjust variables and observe effects
- A quiz with immediate visual feedback
- A data visualization students can filter and explore
- A 3D model students can rotate and examine
- A virtual lab bench with adjustable parameters

## What Components Can Do

Components can:
- Display interactive visualizations (charts, graphs, 3D models, diagrams)
- Accept student input (clicking, dragging, typing, selecting)
- Provide immediate visual feedback (correct/incorrect, animations, state changes)
- Communicate with the AI agent bidirectionally (agent updates component, component reports student actions)
- Adapt in real-time (agent changes difficulty, reveals hints, advances problems)

Components cannot:
- Access the internet or external APIs
- Store data between sessions
- Play audio or video
- Access the student's camera or microphone

## Discussing Components with Educators

When exploring interactivity needs, help educators think about:

1. **What should students see?** (visualization type)
2. **What should students be able to do?** (interaction model)
3. **What feedback should they get?** (immediate response)
4. **How should difficulty change?** (adaptation)

### Good Questions to Ask

- "If you could give students a tool to explore this concept, what would it look like?"
- "What would students manipulate or change? What would they observe as a result?"
- "How would you know a student is getting it vs. struggling, based on their interactions?"
- "Should the tool start simple and get harder, or should students explore freely?"

### Translating Educator Ideas to Component Specs

Educators won't speak in technical terms. Translate their ideas:

| Educator says | Component concept |
|---|---|
| "They should be able to change the angle and see what happens" | Interactive geometry with state-driven visualization |
| "Like a virtual lab where they mix chemicals" | Simulation with adjustable parameters and visual outcomes |
| "A quiz that shows them why they're wrong" | Assessment component with explanatory feedback |
| "They should explore the data and find patterns" | Interactive data visualization with filtering |
| "Something they can rotate and look at from different angles" | 3D model viewer with orbit controls |

## Component Limitations

Be honest with educators about what's possible:
- Components are visual and interactive, not video or audio
- They work best for concepts that benefit from manipulation and visualization
- Very complex simulations (full physics engines, etc.) may need to be simplified
- Components should serve the learning objective, not be technology for technology's sake
