# Design Spec: Obsidian Snippets Manager Rewrite

## 1. Overview
Rewrite the `obsidian-snippets-manager` plugin by porting logic from the `references/MySnippets-Plugin` project. The goal is to restore CSS snippet management functionality in modern Obsidian while adhering to a clean, modular architecture and specific environment requirements.

## 2. Requirements & Constraints
- **Logic Port**: Extract and adapt core snippet management logic (list, toggle, create, reload) from `references/MySnippets-Plugin`.
- **Author Privacy**: Remove all author-related metadata, icons, or links from the reference project.
- **Environment**:
  - Use **pnpm** as the package manager.
  - Enable **hard links** via pnpm configuration.
  - Use the latest versions of all dependencies.
- **Build System**:
  - Update `esbuild.config.mjs` to output directly to the user's vault: `/Users/xy/Repo/obsidian-vault-bfcs/.obsidian/plugins/obsidian-snippets-manager`.
- **Architecture**: Follow `AGENTS.md` guidelines for a modular, multi-file structure.

## 3. Architecture

### 3.1 Directory Structure
```text
src/
  main.ts           # Plugin entry point, lifecycle (onload/onunload)
  settings.ts       # Settings definitions (defaults, interface, tab)
  types.ts          # TypeScript definitions for Obsidian's internal app.customCss API
  ui/
    statusbar.ts    # Management of the Status Bar icon and click events
    menu.ts         # Logic for building and showing the snippet toggle menu
    modal.ts        # Modal for creating new snippets
  manager/
    snippets.ts     # Core logic for interacting with app.customCss and app.vault
  utils/
    dom.ts          # DOM helpers (like setAttributes from reference)
```

### 3.2 Core Logic (SnippetManager)
A singleton or class-based manager to wrap `app.customCss`:
- `listSnippets()`: Get names of all available snippets.
- `getEnabledSnippets()`: Get the set of enabled snippet names.
- `setSnippetStatus(name, enabled)`: Call `app.customCss.setCssEnabledStatus`.
- `createSnippet(name, content)`: Use `app.vault.create` to save a new `.css` file in the snippets folder.
- `reloadSnippets()`: Call `app.customCss.requestLoadSnippets`.

### 3.3 UI Components
- **Status Bar Icon**: A clickable icon (e.g., `palette` or custom icon) that opens the `SnippetMenu`.
- **Snippet Menu**: A native Obsidian `Menu` that lists snippets with:
  - A toggle switch for each snippet.
  - A button to open the snippet file with the default app.
  - Action buttons: Reload, Open Snippets Folder, Create New Snippet.
- **Create Modal**: A `Modal` with a text input for the filename and a textarea for the CSS content.

## 4. Implementation Strategy

### Phase 1: Environment Setup
1. Remove `package-lock.json` and `node_modules`.
2. Create `.npmrc` with `node-linker=hoisted` (to ensure compatibility with some Obsidian build patterns while using pnpm).
3. Initialize `pnpm` and install latest dependencies.
4. Update `esbuild.config.mjs` for the custom output path.

### Phase 2: Logic Porting
1. Implement `types.ts` with modern `app.customCss` definitions.
2. Port `SnippetManager` logic into `src/manager/snippets.ts`.
3. Port UI components into `src/ui/`.

### Phase 3: Lifecycle & Integration
1. Update `main.ts` to initialize the `SnippetManager` and register the status bar icon.
2. Update `settings.ts` to manage defaults and the settings tab.

## 5. Success Criteria
- Plugin builds successfully and outputs to the specified vault path.
- Status bar icon appears and opens the snippet menu.
- Toggling a snippet in the menu immediately applies the change in Obsidian.
- Creating a new snippet via the modal adds a file to the vault and enables it.
- No reference to original author "MiniSettings" or similar remains.
