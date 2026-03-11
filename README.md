# Primer Modules

Official module registry for [Primer](https://github.com/wharton-generative-ai-labs/primer), the interactive AI experience platform from Wharton Generative AI Labs.

## What are Modules?

Modules are self-contained Primer experiences that can be browsed, downloaded, and installed directly from within Primer. They include templates, meta-experiences, and other reusable building blocks.

## Available Modules

| Module | Kind | Description |
|--------|------|-------------|
| **Experience Creator** | meta | Interviews an educator and builds a complete Primer experience. Requires roleplay-template and teachback-template. |
| **Experience Creator with Interface Design** | meta | Extended creator that also designs custom interactive UI components. Requires tutor-template and lab-template. |
| **Game Agent** | bundled | An elevator pitch learning experience. |
| **Roleplay Template** | template | A template roleplay experience with mentor → practice → feedback flow. |
| **Teachback Template** | template | A template teachback experience with mentor → practice → feedback flow. |
| **Tutor Template** | template | A template for interactive tutoring with custom component support. |
| **Lab Template** | template | A template for multi-agent interactive lab experiences following the 5E model. |

## Repository Structure

```
modules/
  experience-creator/                          # Voice-driven experience builder
  experience-creator-with-interface-design/    # Extended builder with custom UI components
  game-agent/                                  # Elevator pitch game
  roleplay-template/
  teachback-template/
  tutor-template/
  lab-template/
scripts/
  build-manifest.sh       # Regenerates modules.json from experience.json files
modules.json              # Registry manifest (used by Primer for discovery)
```

- **`modules/`** contains the raw, browsable source files for each module. Each module has an `experience.json` (metadata, version, agent configs), agent prompts in `resources/instructions/agent/`, and supporting resources.
- **`modules.json`** is the registry manifest that Primer fetches to discover available modules
- **ZIPs** are built automatically by GitHub Actions and published as release assets (never committed)

## Installing Modules

### From within Primer

1. Open the Experience Catalog
2. Click **Browse Modules**
3. Click **Install** on any module — dependencies are resolved and installed automatically

### Manual Installation

Download a module ZIP from the [latest release](https://github.com/wharton-generative-ai-labs/primer-modules/releases/latest) and upload it via Primer's "Install Experience" button.

## Dependencies

Modules can declare dependencies on other modules via the `requires` field in their `experience.json`. When installing a module through Primer, missing dependencies are automatically installed first.

For example, the Experience Creator requires both template modules:

```json
{
  "requires": ["roleplay-template", "teachback-template"]
}
```

## Making Changes

To update a module (e.g. editing an agent prompt, changing configuration):

1. **Edit the module files** under `modules/<module-id>/` (prompts live in `resources/instructions/agent/`)
2. **Bump the version** in the module's `experience.json` — this is required so Primer recognizes the update as a new version
3. **Commit and push** your changes to `main`
4. **Tag a release** to trigger the build:
   ```bash
   git tag v1.2.0
   git push origin v1.2.0
   ```
5. The GitHub Action will package, hash, and publish the modules automatically (see [Releases](#releases))

> **Important:** Pushing to `main` alone does not publish anything. You must push a version tag (`v*`) to trigger the release workflow.

You can also regenerate `modules.json` locally for verification:

```bash
./scripts/build-manifest.sh          # Rebuild manifest from experience.json files
./scripts/build-manifest.sh --zip    # Also build ZIPs into dist/ and compute hashes
```

## Publishing Your Own Modules

You can host your own module registry by creating a repository with the same structure and a `modules.json` manifest. Configure Primer to use your registry by adding its URL to the `MODULE_REGISTRY_URLS` environment variable (comma-separated, multiple registries supported).

## Releases

Releases are created by pushing a version tag (e.g., `git tag v1.0.0 && git push origin v1.0.0`), or via manual workflow dispatch. The GitHub Action automatically:

1. Zips each module directory
2. Computes SHA-256 hashes for integrity verification
3. Updates `modules.json` with the hashes and commits the change back to `main`
4. Publishes the ZIPs as release assets on a GitHub Release

## License

Mozilla Public License 2.0
