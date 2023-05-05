# Group By Function

## Credit

Based on work by @weirdhorror in <https://github.com/obsidian-tasks-group/obsidian-tasks/pull/1421>

## Examples

### Example 1

```task
# group by function (!due) ? '📅 4 No Due Date' : due.startOf('day').isBefore(moment().startOf('day')) ? '📅 1 Overdue' : due.startOf('day').isAfter(moment().startOf('day')) ? '📅 3 Future' : '📅 2 Today'

# Maybe reverse arguments so due is passed in to as function arg???
group by function (!due) ? '📅 4 No Due Date' : due.isBefore(moment().startOf('day')) ? '📅 1 Overdue' : due.isAfter(moment().startOf('day')) ? '📅 3 Future' : '📅 2 Today'

# group by function root === "journal/" ? root : path
# group by function path.replace("some/prefix/", "")
# group by function due ? "📅 " + due.format("YYYY-MM") : "no due date"
```

### Example 2

```tasks
limit 100
group by function due.format('YYYY-WW')
group by function due.format('YYYY-MM-DD dddd')
```

## Limitations

- The expression is only checked when the tasks block is rendered
  - Any errors in the expression are displayed as the group name
