# Experimental - Custom Task States

## Supported Initially

<!-- include: Status.DocSamples.test.TaskStates_markdown-table.approved.md -->
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
<!-- endInclude -->

## Things to explain

- What's implemented
  - Filtering
  - Retaining of status character
  - Changed behaviour of 'done'/'not done' to allow some non-space characters to be treated as not done
- State limitations - please don't submit feedback on...
  - Hard-coded set of states
  - Have to manually install CSS in your own vault
  - No guarantee I will use this vocabulary
  - How it works with recurrence
  - Can't edit the status character in Modal - have to edit the markdown
  - No commands
  - Setting on next status (not done -> in-progress -> done)
- Feedback wanted
  - Names
  - Behaviour
  - Selection of status options
  - Should search be on status character or display name?
