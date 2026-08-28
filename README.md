# dsh-plugin-template

English | [中文](README.zh.md)

[![dsh.so security](https://www.dsh.so/badge/dsh-plugin-template.svg)](https://www.dsh.so/artifact/dsh-plugin-template)
[![dsh.so install](https://www.dsh.so/badge/install/dsh-plugin-template.svg)](https://www.dsh.so/artifact/dsh-plugin-template)

A complete dual-side [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin template. It demonstrates the full plugin surface — a **host** plugin exposing a Typert Remote, and a **client** plugin mounting that Remote into a React view — with type-checking, linting, unit tests, CI, and publishing metadata wired up.

Out of the box it registers a `greet` Remote: the host composes `"Hello, <name>"` from a configurable prefix, and the client renders the result in a new "Greet" tab.

## Structure

```text
package.json           # dsh.bundle + dsh.client manifests, scripts, peer deps
cordis.patch.yml       # mounts the host plugin row into a profile
dsh.plugin.json        # dsh.so registry manifest
src/index.ts           # host entry: Config schema + Typert manifest registration
src/runtime.ts         # host Remote service (TypertRemoteService)
src/typert.ts          # Typert model manifest
src/contract.ts        # strict wire contract shared by host and client
src/types.ts           # shared host/client types
src/client/index.tsx   # client entry: mounts Remote + registers the view slot
src/client/remote.ts   # client Remote contribution + typed namespace
src/client/locales.ts  # zh / en dictionaries
src/client/view.tsx    # minimal React view
src/client/styles.ts   # theme-token stylesheet
tests/                 # vitest unit tests (contract + runtime)
build.mjs              # esbuild dual build (host ESM + client CJS)
.github/workflows/ci.yml
dsh-testkit.yaml       # real-host lifecycle expectations
.github/workflows/dsh-lifecycle.yml
.agents/skills/dsh-testkit/SKILL.md
```

`package.json` is the only manifest Harness needs. `dsh.bundle.patch` makes the package an installable profile bundle; `dsh.client` declares the Web client bundle and the client packages it injects. The host entry is the ordinary Cordis `name`/`apply` export; the client entry is bundled to `lib/client.js` and loaded by the Web harness module loader.

## Requirements

- Node.js `>= 22.19` (or `>= 24`)
- pnpm `>= 9`
- DeepSeek Harness `>=0.1.0-rc.6`

## Install from a local checkout

```sh
pnpm install
pnpm run build
dsh plugin --profile web add .
```

Restart the Web Harness after rebuilding the plugin. A "Greet" tab appears in the session view ring showing `Hello, DSH`.

Remove it with:

```sh
dsh plugin --profile web remove dsh-plugin-template
```

## Install from Git

```sh
dsh plugin --profile web add github:you/dsh-plugin-template
```

A Git install fetches sources, not built artifacts, so pnpm runs the `prepare` script to build `lib/`. pnpm ≥10 blocks that build until you allow it; on the first failed `add`, `dsh` prints the fix — copy the package key it shows into the profile's `pnpm-workspace.yaml`:

```yaml
allowBuilds:
  dsh-plugin-template: true
```

then re-run the `add`. That allowance lets the package run code at install time, so only allow packages you trust (and pin a commit).

## Development

```sh
pnpm run check
```

`check` runs `typecheck`, `lint`, `test`, and `build`. CI runs the same command after `pnpm install --frozen-lockfile`.

Individual scripts:

```sh
pnpm run build      # esbuild dual bundle + declaration emit
pnpm run typecheck  # tsc over src and tests
pnpm run lint       # eslint
pnpm run test       # vitest
pnpm run test:lifecycle # real DSH install, boot, register, remove, and reboot
```

## Real-host lifecycle gate

`pnpm run test:lifecycle` first builds a package tarball with the repository's locked toolchain, then uses [DSH Testkit v0.4.0](https://github.com/iiwish/dsh-testkit/releases/tag/v0.4.0) with DSH `0.1.1-rc.2` in Docker. The scenario installs that exact artifact into a real host, verifies the `dsh-plugin-template` row and `greet` service, removes the plugin, and reboots the same profile. It does not need a model API key.

The external-pull-request job explicitly grants only `contents: read`; it runs the pinned npm release directly and retains the evidence without invoking a write-capable third-party Action. The trusted-branch job adds `checks: write` so the pinned Testkit Action can publish its JUnit check. Every referenced Action is pinned to an immutable commit.

The current Testkit scenario observes host registrations; it does not directly assert the client-side `conversation.view` slot. Type-checking and the client build cover its static integration, while the existing unit tests cover the shared contract and host runtime rather than live slot injection.

## Renaming the package

Keep these values in sync when you rename:

- `package.json` → `name`, `exports`, `files`
- `build.mjs` → the `__ModuleLoader__.load` id
- `src/index.ts` → `name`
- `src/client/remote.ts` → package id and the `TypertRemoteNamespace$…` hex of the service key
- `src/client/locales.ts` → locale namespace key
- `src/client/index.tsx` → slot id
- `src/typert.ts` → `package`
- `src/contract.ts` → invocation ids
- `cordis.patch.yml` → `id` and `name`
- `dsh.plugin.json` → `id`

## Discoverability

Add the GitHub topic [`dsh-plugin`](https://github.com/topics/dsh-plugin) to your fork:

```sh
gh api --method PUT repos/YOUR-USER/dsh-plugin-template/topics \
  -H 'Accept: application/vnd.github+json' \
  -f 'names[]=dsh-plugin'
```

## License

MIT
