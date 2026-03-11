# Session Event Tracking

## Overview

Session events help maintain continuity across interrupted or resumed experiences. By logging major milestones, agents can understand where a user left off and provide a seamless continuation experience.

## When to Log Session Events

Log session events at these key moments:

### All Agents Should Log:
- **Session start**: When beginning your interaction with the user
- **Phase transitions**: When moving from one major phase to another
- **Task completion**: When completing a significant task or milestone
- **Session completion**: When your role in the experience is complete

### Event Naming Convention

Use clear, descriptive event names that follow this pattern:
- `{agent_name}_started` - When your agent begins interaction
- `{agent_name}_phase_{phase_name}` - When entering a specific phase
- `{agent_name}_completed` - When your agent's work is done
- `session_completed` - When the entire experience is finished

## How to Use Session Events

### At the Start of Your Interaction

**CRITICAL**: Before beginning your normal flow, check for existing session history:

```javascript
// Check if this is a returning user
sessionEvent({
  action: "readAll"
})
```

If events exist, analyze them to understand:
- How far the user progressed previously
- Which phases were completed
- Where they left off
- What context needs to be re-established

**Adapt your greeting based on history:**
- **No events found**: Proceed with normal introduction
- **Events found but incomplete**: Acknowledge their return and briefly recap where they left off
- **Your phase already completed**: Let them know you've already worked together and offer to help if needed

### During Your Interaction

Log events at major milestones:

```javascript
// Example: Starting a new phase
sessionEvent({
  action: "create",
  event: "intake_phase_learning_objectives",
  data: { 
    phase: "learning_objectives",
    status: "started"
  }
})

// Example: Completing a task
sessionEvent({
  action: "create",
  event: "intake_design_approved",
  data: { 
    designDocumentId: "artifact-id-here",
    status: "completed"
  }
})
```

### When Completing Your Work

Always log completion:

```javascript
sessionEvent({
  action: "create",
  event: "intake_completed",
  data: { 
    nextAgent: "design-agent",
    artifactsCreated: ["conversation-transcript-id"]
  }
})
```

## Session Recovery Patterns

### For Frontend Agents (Intake, HAL)

When a user returns to a session:

1. **Read all events** using `readAll`
2. **Identify the last completed phase** from your workflow
3. **Greet appropriately**:
   - "Welcome back! I see we were working on [last phase]. Let me quickly recap..."
   - "Good to see you again! We had just finished [completed task]. Ready to continue?"
4. **Offer context** without forcing them to repeat information
5. **Resume from the logical next step**

### For Backend Agents (Design, Casting Director, Experience Builder, Image Generation)

Backend agents typically run to completion, but should still log events for tracking:

1. **Log start event** when beginning work
2. **Log major milestones** (e.g., "design_document_created", "images_generated")
3. **Log completion event** when returning results

This creates an audit trail for debugging and analytics.

## Event Data Best Practices

### Include Useful Context

```javascript
// Good: Includes actionable context
sessionEvent({
  action: "create",
  event: "intake_phase_template_selection",
  data: { 
    templateType: "Roleplay",
    learningObjective: "negotiation skills",
    timestamp: Date.now()
  }
})

// Less useful: Minimal context
sessionEvent({
  action: "create",
  event: "intake_phase_complete"
})
```

### Store Artifact References

When creating artifacts that downstream agents need:

```javascript
sessionEvent({
  action: "create",
  event: "design_agent_completed",
  data: { 
    designDocumentId: "artifact-uuid-here",
    characterContextsIncluded: ["mentor", "practice", "feedback"]
  }
})
```

## Example: Intake Agent Session Recovery

```javascript
// At the very start of interaction, before greeting
const history = await sessionEvent({ action: "readAll" });

if (history.data.events && history.data.events.length > 0) {
  // Analyze what's been done
  const completedPhases = history.data.events
    .filter(e => e.event.includes('completed'))
    .map(e => e.event);
  
  if (completedPhases.includes('intake_completed')) {
    // User has already finished with intake
    respond("Welcome back! I see we've already completed your intake interview and created your experience design. Would you like to review what we created, or is there something else I can help you with?");
  } else if (completedPhases.includes('intake_design_approved')) {
    // Design was approved, likely waiting for build
    respond("Welcome back! We had approved your design and I was coordinating with our specialized agents to build your experience. Let me check on the progress...");
  } else {
    // Partial progress through intake
    const lastEvent = history.data.events[history.data.events.length - 1];
    respond(`Welcome back! I see we were working on your educational experience. We had gotten to ${lastEvent.data?.phase || 'the interview process'}. Let me help us pick up where we left off...`);
  }
} else {
  // New session, proceed normally
  respond("Hello! I'm your AI partner...");
}
```

## Important Notes

- **Don't over-log**: Focus on meaningful milestones, not every user message
- **Keep event names consistent**: Use the naming convention above
- **Include artifact IDs**: When creating artifacts, log their IDs for reference
- **Be user-friendly**: When resuming, be helpful but not overwhelming with details
- **Handle errors gracefully**: If session events fail, continue with normal flow

## Session Completion

When the entire experience is finished (typically by the Intake Agent after presenting the final experience link):

```javascript
sessionEvent({
  action: "create",
  event: "session_completed",
  data: { 
    experienceId: "final-experience-uuid",
    allPhasesCompleted: true,
    timestamp: Date.now()
  }
})
```

This marks the session as fully complete and helps with analytics.
