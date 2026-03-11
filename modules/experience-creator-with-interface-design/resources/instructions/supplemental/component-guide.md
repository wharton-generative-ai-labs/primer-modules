# Interactive Component Guide

This is a reference for how interactive components work in Primer experiences. It is used by the Intake Agent to understand component capabilities and by the Design Agent to write component specifications.

## Component Architecture

Components are React JSX files that run in a sandboxed browser environment. They communicate with AI agents bidirectionally:

### Agent to Component (State Updates)

The agent controls the component by updating its state:

```javascript
customComponent({
  action: 'updateState',
  instanceId: 'instance-id',
  stateUpdates: { key: 'newValue' }
})
```

The component receives updates via its `externalState` prop. A `useEffect([externalState])` hook merges the updates into internal state.

### Component to Agent (Events)

When a student interacts with a component, it fires events:

```javascript
await onEvent?.('event-type', { data });
```

The event flows through Socket.IO and arrives in the agent's conversation as:
```
[Component Event] User interaction with {componentId}: {eventType} - Data: {eventData}
```

The agent sees this message and can respond conversationally and/or update component state.

### Component to Agent (State Changes)

Components report passive state changes via `onStateChange(newState)`. These are logged but not injected into the agent's conversation.

### Component to Agent (Completion)

Components signal task completion via `onSubmit(data)`. The agent receives this as an event.

## Component Props

Every component accepts:
- `initialState` - Starting state set by the agent
- `externalState` - Agent-driven state updates
- `onStateChange` - Callback for passive state reporting
- `onEvent` - Callback for user interaction events
- `onSubmit` - Callback for task completion
- `instanceId` - Unique instance identifier

## Available Libraries

Components have access to:
- React (useState, useEffect, useRef, etc.)
- shadcn/ui (Button, Card, Input, etc.)
- THREE.js (3D graphics, via `window.THREE`)
- math.js (calculations, via `window.math`)
- Lodash (utilities, via `window._`)
- Recharts (charts, via `window.Recharts`)
- Tailwind CSS (styling)

## Security Constraints

Components cannot use: fetch, localStorage, eval, XMLHttpRequest, or any network/storage APIs. All data flows through the props system.
