# CodeScript Toolkit way

## How this is set up

- [[TasksFunctionsJS.js]]
  - JavaScript
  - Defines simple functions that can be called as below.
- [[TasksFunctionsTS.ts]]
  - TypeScript
  - Defines simple functions that can be called as below.
  - If I paste in the definitions of the Task class, and edit in an IDE, I will get completion on the functions.
- [[startup.js]]
  - This enables [[#Searches usually work if this file is loaded in Reading mode during startup, and Tasks has been patched]] just works!

![[CodeScript Toolkit settings.png]]
*CodeScript Toolkit settings*

## Searches which always work if this file is loaded in Reading mode during startup

```tasks
# Make sure we have a parent task:
filter by function task.findClosestParentTask() !== null

group by function \
    const {parentDescription} = require('/TasksFunctionsJS.js'); \
    return parentDescription(task);
limit 1
```

```tasks
# Make sure we have a parent task:
filter by function task.findClosestParentTask() !== null

group by function require('/TasksFunctionsJS.js').parentDescription(task)
limit 1
```

## Searches usually work if this file is loaded in Reading mode during startup, and Tasks has been patched

```tasks
# Make sure we have a parent task:
filter by function task.findClosestParentTask() !== null

group by function TasksFunctionsJS.parentDescription(task)
limit 1
```

```tasks
# Make sure we have a parent task:
filter by function task.findClosestParentTask() !== null

group by function TasksFunctionsTS.parentDescription(task)
limit 1
```

These did not initially work if this file is loaded in Reading mode during startup - because they depend on `Tasks` and `TasksFunctionsTS` being initialised by the "CodeScript Toolkit" [startup script](https://github.com/mnaoumov/obsidian-codescript-toolkit?tab=readme-ov-file#startup-script), which is not always true if this code block is loaded in Reading mode during startup.

By use of [onLayoutReady()](https://docs.obsidian.md/Reference/TypeScript+API/Workspace/onLayoutReady) in Tasks main, it made this work code even during startup...

This is the diff:

```diff
Index: src/main.ts
IDEA additional info:
Subsystem: com.intellij.openapi.diff.impl.patch.CharsetEP
<+>UTF-8
===================================================================
diff --git a/src/main.ts b/src/main.ts
--- a/src/main.ts (revision 2493c6635db11d94379429fbed88c14323c5a7ff)
+++ b/src/main.ts (revision 00edbe4eb1283fd22a3226ea9587ad3d8ec0da98)
@@ -55,8 +55,14 @@
             workspace: this.app.workspace,
             events,
         });
-        this.inlineRenderer = new InlineRenderer({ plugin: this });
-        this.queryRenderer = new QueryRenderer({ plugin: this, events });
+
+        this.app.workspace.onLayoutReady(() => {
+            // Only execute searches once all plugins are loaded.
+            // This fixed use of a "CodeScript Toolkit" startup script inside
+            // notes that were already open in Reading mode when Obsdian was starting up.
+            this.inlineRenderer = new InlineRenderer({ plugin: this });
+            this.queryRenderer = new QueryRenderer({ plugin: this, events });
+        });
 
         this.registerEditorExtension(newLivePreviewExtension());
         this.registerEditorSuggest(new EditorSuggestor(this.app, getSettings(), this));

```
