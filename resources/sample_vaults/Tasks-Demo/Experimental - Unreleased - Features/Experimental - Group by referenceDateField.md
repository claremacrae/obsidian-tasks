# Experimental - Group by referenceDateField

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
