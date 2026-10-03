---
name: CodeExecution file paths
description: Path handling when the durable JavaScript runtime assembles files from binary assets.
---

For impure filesystem operations in CodeExecution, pass explicit absolute paths rather than calling `process.cwd()`. Read binary assets directly with `node:fs/promises` instead of moving large base64 strings through `shellExec` output.

**Why:** In this workspace, `process.cwd` was not a function in the impure runtime, and large shell output did not return the full encoded payload even when a larger limit was requested.

**How to apply:** Pass absolute input and output paths into an impure function, read the binary files there, and write the complete generated file in that same operation.