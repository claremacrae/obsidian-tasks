| Character           | SlrVb's description | Treated As | Query to find in Tasks | Query to exclude in Tasks  |
| ------------------- | ------------------- | ---------- | ---------------------- | -------------------------- |
| `d` | Doing | Todo | `state is doing` | `NOT (state is doing)` |
| `/` | Half Done | Todo | `state is half-done` | `NOT (state is half-done)` |
| `>` | Forwarded | Todo | `state is forwarded` | `NOT (state is forwarded)` |
| `!` | Important | Todo | `state is important` | `NOT (state is important)` |
| `space` | Unchecked | Todo | `state is unchecked` | `NOT (state is unchecked)` |
| `-` | Cancelled | Done | `state is cancelled` | `NOT (state is cancelled)` |
| `X` | Checked | Done | `state is checked` | `NOT (state is checked)` |
| `x` | Regular | Done | `state is regular` | `NOT (state is regular)` |
