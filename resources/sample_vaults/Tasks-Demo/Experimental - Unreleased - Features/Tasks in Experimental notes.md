# Tasks in Experimental notes

```dataviewjs
function callout(text, type, title) {
    const allText = `> [!${type}] ${title}\n` + text;
    const lines = allText.split('\n');
    return lines.join('\n> ') + '\n'
}

const query = `
not done
path includes ${dv.current().file.folder}
sort by due date
sort by description

group by folder
group by filename
group by heading
# hide task count

short mode
`;

dv.paragraph(callout('```tasks\n' + query + '\n```', 'tasks-in-this-file', 'Tasks in this folder'));
```
