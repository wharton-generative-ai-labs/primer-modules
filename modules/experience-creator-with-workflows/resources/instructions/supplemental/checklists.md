## Your Checklist Management

This experience has TWO classes of checklist artifact in the same session. The `checklist` tool will NOT auto-route to the right one — you must pick. Read this section before any `check` / `uncheck` call.

### Public vs private checklists

- **Private (your own process notes)** — tagged `private:<agent-key>`. For the intake agent: `Intake Checklist` (tag `private:intake`). For the casting-director agent: `Casting Director Checklist` (tag `private:casting-director`). These checklists are for the agent's internal tracking; the educator does not see them.

  When ticking your *own* private checklist, the tool's tag-less fallback resolves to it correctly, so a minimal call works:

  ```
  checklist({ action: 'check', itemText: 'Set an appropriate scene' })
  ```

- **Public phase checklists** — tagged `phase:<phase-id>`. These drive the educator-facing surface during the run:
  - `Design Progress` (tag `phase:intake`) — items: `Briefing the Design Agent`, `Drafting the design document`, `Saving the draft`. Ticked during the `intake` workflow phase while the design-agent is in flight.
  - `Build Progress` (tag `phase:build`) — items: `Initiating build`, `Creating character prompts`, `Generating visual assets`, `Building the experience`, `Applying final polish`. Ticked during the `build` workflow phase as backend agents return.

  When ticking ANY public checklist, **always pass the `tags` filter explicitly:**

  ```
  checklist({ action: 'check', itemText: 'Briefing the Design Agent', tags: ['phase:intake'] })
  checklist({ action: 'check', itemText: 'Building the experience',   tags: ['phase:build'] })
  ```

  Without the `tags` arg the tool's fallback selects your private checklist (e.g. `Intake Checklist`), can't find the item there, and rejects the call with `Could not find checklist item containing "<itemText>"`. The error response includes the full available-items list of the wrong checklist — that is your signal you missed the `tags`.

### General usage

NOTE: These are starter examples. Read your checklist first via `checklist({ action: 'get' })` to see the exact item text — `check` matches by substring, but each item must match a unique substring to land.

1. **Check off completed items**: `checklist({ action: 'check', itemText: 'Set an appropriate scene' })`
2. **Get checklist content**: `checklist({ action: 'get' })` — returns the currently-routed checklist (private if you have one, otherwise the first match). Pass `tags` to read a specific public one.
3. **Show progress**: `checklist({ action: 'showProgress' })` — surface the routed checklist to the user. As with `get`, pass `tags` for public ones.

CRITICAL: You MUST update your private checklist after completing each domain step. Examples for the intake agent's private `Intake Checklist`:

- ✅ After scene setup and introduction → `checklist({ action: 'check', itemText: 'Set an appropriate scene' })`
- ✅ After gathering lesson topic → `checklist({ action: 'check', itemText: 'Ask about their lesson topic' })`
- ✅ After learning context assessment → `checklist({ action: 'check', itemText: 'Document student prior knowledge' })`
- ✅ After choosing practice format → `checklist({ action: 'check', itemText: 'Consider multiple ways the student could practice skill. Pick 1.' })`
- ✅ After narrative design → `checklist({ action: 'check', itemText: 'Select appropriate narrative arc' })`
- ✅ After teacher validation → `checklist({ action: 'check', itemText: 'Present single, confident recommendation' })`

These minimal calls work because they target your private `Intake Checklist`. For the public `Design Progress` / `Build Progress` ticks driven from the orchestration gates, see the literal signatures in your agent prompt and ALWAYS include the matching `tags` array.
