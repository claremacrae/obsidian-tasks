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

- What's implemented
  - Filtering
  - Retaining of status character
  - Changed behaviour of 'done'/'not done' to allow some non-space characters to be treated as not done
- State limitations
  - Hard-coded
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
