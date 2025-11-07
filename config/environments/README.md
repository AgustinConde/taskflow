# Environment Profiles

This folder stores reusable environment profiles used by `scripts/use-env.ps1`.

1. Copy one of the `*.ps1.example` files to a file without the `.example` suffix (for example, `local.ps1`).
2. Edit the copy and provide the variable values and secret file locations that match your environment.
3. Run `scripts\use-env.ps1 <profile>` to import the variables and copy the referenced files.

> The `.ps1` files are ignored by git so that secrets remain local. Only the `.example` templates are tracked.
