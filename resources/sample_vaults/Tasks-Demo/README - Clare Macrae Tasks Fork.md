# README - Clare Macrae Tasks Fork

## Summary

- This **development** build of the Obsidian Tasks plugin is from Clare Macrae's development fork:
  - <https://github.com/claremacrae/obsidian-tasks>
- It is based on the Tasks **1.19.0** release, so **does not contain all the latest official Tasks features**.

## Experimental features, not in Tasks

The following are features I have implemented for my own use. This is the Tasks version I use on my own vault.

I am confident that the code is well tested.

But I **make no promise that any of the features here will make it in to the Core Tasks**, nor that this version will be kept up to date with new features in the core Tasks plugin.

So you **should not rely on new features here in your own vault**.

## Experimental Features - for Feedback

### Run Tasks commands in Javascript

See [[Custom Javascript]].

- [ ] Add notes to [[Custom Javascript]] file, explaining it.
- [ ] And a statement that it is purely experimental.

    let status: Status;
    // / = Half Done
    // d = Doing
    // ! = Important
    // > = Forward
    if (' /d!>'.includes(statusString)) {
        status = Status.TODO;

hideOptionsRegexp =
        /^(hide|show) (task count|backlink|priority|start date|scheduled date|done date|due date|recurrence rule|tags

pByRegexp =
        /^group by (backlink|done|due|filename|folder|happens|heading|path|priority|recurrence|recurring|referenceDateField

    private static getReferenceDateField(task: Task): string[] {
        let referenceName = 'None';
        if (task.dueDate != null) {
            referenceName = 'Due';
        } else if (task.scheduledDate != null) {
            referenceName = 'Scheduled';
        } else if (task.startDate != null) {
            referenceName = 'Start';
        }
        return [referenceName];
    }

| Character           | SlrVb's description | Treated As | Query to find in Tasks | Query to exclude in Tasks  |
| ------------------- | ------------------- | ---------- | ---------------------- | -------------------------- |
| `[space character]` | Unchecked           | Todo       | `state is unchecked`   | `NOT (state is unchecked)` |
| `x`                 |                     |            |                        |                            |
| `X`                 |                     |            |                        |                            |
| `!`                 | Important           | Todo       | `state is important`   | `NOT (state is important)` |
| `/`                 | Half Done           | Todo       | `state is half-done`   | `NOT (state is half-done)` |
| `-`                 | Dropped             |            | `state is cancelled`   | `NOT (state is cancelled)` |
| `>`                 | Forward             | Todo       | `state is forwarded`   | `NOT (state is forwarded)` |
| `d`                 |                     | Todo       | `state is doing`       | `NOT (state is doing)`     |
