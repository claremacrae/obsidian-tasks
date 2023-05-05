# Group By Function

Based on work by @weirdhorror in <https://github.com/obsidian-tasks-group/obsidian-tasks/pull/1421>

```tasks
# group by function (!due) ? '📅 4 No Due Date' : due.startOf('day').isBefore(moment().startOf('day')) ? '📅 1 Overdue' : due.startOf('day').isAfter(moment().startOf('day')) ? '📅 3 Future' : '📅 2 Today'

# Maybe reverse arguments so due is passed in to as function arg???
group by function (!due) ? '📅 4 No Due Date' : due.isBefore(moment().startOf('day')) ? '📅 1 Overdue' : due.isAfter(moment().startOf('day')) ? '📅 3 Future' : '📅 2 Today'

# group by function root === "journal/" ? root : path
# group by function path.replace("some/prefix/", "")
# group by function due ? "📅 " + due.format("YYYY-MM") : "no due date"
```
