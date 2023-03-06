# Issue 1680 - Reading Mode line numbers not updated on editing

## Instructions

**Given** a file is open in both two panes:

- an editing mode (Source or Live Preview)
- Reading mode

**When** I add or remove lines from the file

**Then** rendered tasks in the Reading pane should be updated, so that that when I toggle them, the correct line is toggled.

## Tasks Section 1

Some random tasks

- [ ] #task Task 1 in Section 1
- [ ] #task Task 2 in Section 1

## Tasks Section 2

Some more random tasks

- [ ] #task Task 1 in Section 2
- [ ] #task Task 2 in Section 2

## Query results

```tasks
path includes Reading Mode line numbers not updated on editing
```
