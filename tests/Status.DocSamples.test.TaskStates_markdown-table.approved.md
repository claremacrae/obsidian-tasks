| Character           | SlrVb's description | Treated As | Query to find in Tasks | Query to exclude in Tasks  |
| ------------------- | ------------------- | ---------- | ---------------------- | -------------------------- |
| `d` | Doing | Todo | `state is doing` | `state is not doing` |
| `/` | Half Done | Todo | `state is half-done` | `state is not half-done` |
| `>` | Forwarded | Todo | `state is forwarded` | `state is not forwarded` |
| `!` | Important | Todo | `state is important` | `state is not important` |
| `space` | Unchecked | Todo | `state is unchecked` | `state is not unchecked` |
| `-` | Cancelled | Done | `state is cancelled` | `state is not cancelled` |
| `X` | Checked | Done | `state is checked` | `state is not checked` |
| `x` | Regular | Done | `state is regular` | `state is not regular` |
