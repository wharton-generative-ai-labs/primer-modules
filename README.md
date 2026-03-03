# Primer Modules

Official module registry for [Primer](https://github.com/wharton-generative-ai-labs/artifex), the interactive AI experience platform from Wharton Generative AI Labs.

## What are Modules?

Modules are self-contained Primer experiences that can be browsed, downloaded, and installed directly from within Primer. They include templates, meta-experiences, and other reusable building blocks.

## Available Modules

| Module | Kind | Description |
|--------|------|-------------|
| **Intake Agent** | meta | Interviews an educator to create a Primer Experience. Requires roleplay-template and teachback-template. |
| **Roleplay Template** | template | A template roleplay experience with mentor → practice → feedback flow. |
| **Teachback Template** | template | A template teachback experience with mentor → practice → feedback flow. |

## Repository Structure

```
modules/
  intake-agent/           # Browsable source files
  roleplay-template/
  teachback-template/
modules.json              # Registry manifest (used by Primer for discovery)
```

- **`modules/`** contains the raw, browsable source files for each module
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

For example, the Intake Agent requires both template modules:

```json
{
  "requires": ["roleplay-template", "teachback-template"]
}
```

## Publishing Your Own Modules

You can host your own module registry by creating a repository with the same structure and a `modules.json` manifest. Configure Primer to use your registry by adding its URL to the `MODULE_REGISTRY_URLS` environment variable (comma-separated, multiple registries supported).

## Releases

Releases are created by tagging a commit (e.g., `v1.0.0`). The GitHub Action automatically:

1. Zips each module directory
2. Computes SHA-256 hashes for integrity verification
3. Updates `modules.json` with the hashes
4. Publishes the ZIPs as release assets

## License

Mozilla Public License 2.0
