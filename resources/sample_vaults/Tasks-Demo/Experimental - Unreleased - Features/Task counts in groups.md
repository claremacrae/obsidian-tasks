# Task counts in groups

## Related issues

- [Optionally display the number of tasks in groups #1627](https://github.com/obsidian-tasks-group/obsidian-tasks/issues/1627)

## Features

- The number of tasks in the group is appended to the end of each task group.
- If group size is limited, such as with `limit groups 1`, it also shows the original number of tasks.

## Limitations

- It only shows the count in leaf groups, so if several `group by` lines are present, you don't see the counts in higher level groups.
- There is no way to turn it off.

## Possible improvements

- Add `show/hide group task count` instruction.
- Show the task count on non-leaf groups too.
- Add ability to style the task counts.
- Also make the main search tasks count show the original number of tasks, in case the number tasks exceeding the `limit`.
- Introduce a TaskCount class or similar.

![[Task counts in groups - screenshot.png|500]]
