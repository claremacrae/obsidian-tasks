import type { Task } from '../../Task';
import type { GrouperFunction } from '../Grouper';
import { TextField } from './TextField';

export class RootField extends TextField {
    public fieldName(): string {
        return 'root';
    }

    public value(task: Task): string {
        return task.file.root;
    }

    // TODO Replace this with use of TasksFile instead, after merge
    public static root(originalPath: string) {
        let path = originalPath.replace(/\\/g, '/');

        if (path.charAt(0) === '/') {
            path = path.substring(1);
        }

        const separatorIndex = path.indexOf('/');
        if (separatorIndex == -1) {
            return '/';
        }
        return path.substring(0, separatorIndex + 1);
    }

    public supportsGrouping(): boolean {
        return true;
    }

    public grouper(): GrouperFunction {
        return (task: Task) => {
            return [TextField.escapeMarkdownCharacters(this.value(task))];
        };
    }
}
