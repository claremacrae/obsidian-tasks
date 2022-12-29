# Experimental - Group by referenceDateField

- [ ] #task Remove referenceDateField - no user call for it, no point maintaining the code

groupByRegexp =
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
