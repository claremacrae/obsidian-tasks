# Reading Mode line numbers in blockquote

## Instructions

**Given** a file **with tasks in a blockquote** is open in both two panes:

- an editing mode (Source or Live Preview)
- Reading mode

**When** I view the tasks in Reading mode with debug enabled

**Then** I see that the callout seems to start a new section line, but the backlinks show the actual ordinary heading name.

## Section 1

Some random tasks

- [ ] #task Task 1 in Section 1
- [ ] #task Task 2 in Section 1

> - [ ] #task Task 3 in Section 1 - in blockquote
> - [ ] #task Task 4 in Section 1 - in blockquote

## Query results

```tasks
path includes Reading Mode line numbers in blockquotes
```
