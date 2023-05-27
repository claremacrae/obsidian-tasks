# Group By Function

## Credit

Based on work by @weirdhorror in <https://github.com/obsidian-tasks-group/obsidian-tasks/pull/1421>

## Reference

Supported values:

- `created`
- `description`
- `done`
- `due`
- `filename`
- `folder`
- `happens`
- `header`
- `indentation`
- `markdown`
- `path`
- `priority`
- `recurrence`
- `root`
- `scheduled`
- `start`
- `status`
- `tags`
- `urgency`

See also [[Referring to fields in JavaScript]].

## Examples

### Example 1

```tasks
limit 150

group by function (!due) ? '📅 4 No Due Date' : due.startOf('day').isBefore(moment().startOf('day')) ? '📅 1 Overdue' : due.startOf('day').isAfter(moment().startOf('day')) ? '📅 3 Future' : '📅 2 Today'

# This would be nice, except that the groups are sorted alphabetically by name, which makes the output
# really hard to read:
group by function due ? due.fromNow() : 'No due date'

# Failed attempt at nicer order of grouping by relative date
# group by function  { if (due.fromNow().includes('ago')) {     if (due.fromNow().includes('year')} return '1 Overdue by years';     if (due.fromNow().includes('month')} return '2 Overdue by months';     if (due.fromNow().includes('day')} return '3 Overdue by days';     if (due.fromNow().includes('year')} return '4 Overdue'; } return '5 Other'; }

# Maybe reverse arguments so due is passed in to as function arg???
# group by function (!due) ? '📅 4 No Due Date' : due.isBefore(moment().startOf('day')) ? '📅 1 Overdue' : due.isAfter(moment().startOf('day')) ? '📅 3 Future' : '📅 2 Today'

# group by function root === "journal/" ? root : path
# group by function path.replace("some/prefix/", "")
# group by function due ? "📅 " + due.format("YYYY-MM") : "no due date"

# group by function folder.replace('{{query.folder}}', '')
# group by function folder.replace('{{query.folder}}', '.../')
# group by function path.replace('{{query.folder}}', '')
# group by function path.replace('{{query.folder}}', '.../')

# group by function happens ? happens.format("YYYY-MM MMM") : "no  date"
```

### Example 2

```tasks
limit 100
group by function reverse due.format('YYYY-WW')
group by function reverse due.format('YYYY-MM-DD dddd')
```

## Features

- Can use if blocks
- Can use variables??? Maybe???

## Limitations

- The expression is only checked when the tasks block is rendered
  - Any errors in the expression are displayed as the group name
- Cannot spread code over lines - has to be collapsed in to one line
- Cannot define functions and call them
