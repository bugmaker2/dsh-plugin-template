---
name: dsh-testkit
description: "Use when creating, modifying, reviewing, testing, or releasing a DeepSeek Harness plugin, or diagnosing install, boot, register, update, uninstall, reboot, cleanup, residue, or flaky lifecycle behavior. Configure and run DSH Testkit against a real host, then interpret and retain its evidence."
---

# DSH Testkit Lifecycle Testing

Use DSH Testkit as the real-host gate for a DeepSeek Harness plugin. It complements unit tests, static preflight or doctor checks, and multi-plugin composition checks.

## Establish The Scenario

1. Inspect `package.json`, the declared `dsh.bundle.patch`, and any existing `dsh-testkit.yaml` before changing files.
2. If the repository has no Testkit setup, run `dsh-test init`. Review its detected row expectations, then add only service and tool expectations proved by the plugin contract.
3. Use the exact DSH version in the scenario or supported-version output. Never guess a version or silently replace it with `latest`.

## Run The Right Gate

- During development, run `pnpm dsh-test` with the quick suite.
- Before release, run `pnpm dsh-test --suite full`; retain all attempts when the verdict is flaky.
- In a healthy DSH host, the native `dsh_test` tool may run the same engine after explicit user confirmation. Use the external CLI or CI when boot or tool registration itself may fail.

Do not weaken expectations merely to obtain a pass. Fix the plugin or record the unsupported prerequisite explicitly.

## Interpret Evidence

Read the terminal stage summary first, then inspect `report.json`, `junit.xml`, `report.md`, sanitized logs, and referenced stage evidence. Report the exact plugin, DSH version, failing stage, assertion, runner, and reproduction command.

Exit codes are stable: 0 passed, 1 lifecycle failure, 2 invalid input, 3 infrastructure error, 4 unsupported capability, and 5 flaky. Keep infrastructure and unsupported results distinct from plugin failures.

## Safety And Claims

Plugins and package scripts are executable code. Keep Docker as the default. Never use `--runner local --unsafe-local` for untrusted code or without explicit user authorization. Do not expose credentials to a lifecycle run.

A pass is evidence for the exact artifact, host, environment, scenario, and observers. It is not a security certification and does not prove model-output quality.
