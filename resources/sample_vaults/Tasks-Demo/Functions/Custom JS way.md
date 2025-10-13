# Custom JS way

## How this is set up

- [[Tasks.js]]
  - JavaScript
  - Defines static functions on a class

![[Custom JS settings.png]]
*Custom JS settings*

## Searches which do not work if this file is loaded in Reading mode during startup

These depend on the `customJS` variable being initialised, which is not always true if this file is loaded in Reading mode during startup.

```tasks
group by function \
    const {Tasks} = customJS; \
    return Tasks.byParentItemDescription(task);
limit 1
```

```tasks
group by function customJS.Tasks.byParentItemDescription(task);
limit 1
```

See earlier discussion:

See <https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3024#issuecomment-2285073838>.
