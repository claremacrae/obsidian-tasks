import { App, Editor, type MarkdownFileInfo, MarkdownView, Modal, Notice, Plugin } from 'obsidian';
import { TaskRegularExpressions } from '../Task/TaskRegularExpressions';
import type { TaskDetails } from '../TaskSerializer';
import { type TaskDiagnostic, diagnoseTaskParsing } from './DiagnoseTaskParsing';
import { generateMarkdownReport } from './GenerateMarkdownReport';

// Type augmentation to tell TypeScript about the method we're adding
declare module '../TaskSerializer/DefaultTaskSerializer' {
    interface DefaultTaskSerializer {
        deserialize(line: string, collectDiagnostics?: boolean): TaskDetails & { diagnostics?: ParseDiagnostic[] };
    }
}

/**
 * Visual debug command to diagnose regex parsing issues on different platforms
 * Uses the actual Tasks parser with diagnostic output
 */
export function addDebugParserCommand(plugin: Plugin) {
    plugin.addCommand({
        id: 'debug-parser-visual',
        name: 'Debug: Visual Task Parser Diagnostic',
        editorCallback: (editor: Editor, _ctx: MarkdownView | MarkdownFileInfo) => {
            const selection = editor.getSelection();
            const cursor = editor.getCursor();

            // Get lines to diagnose (selection or current line)
            let lines: string[] = [];
            if (selection) {
                lines = selection.split('\n');
            } else {
                lines = [editor.getLine(cursor.line)];
            }

            // Filter to only task lines
            const taskLines = lines.filter((line) => TaskRegularExpressions.taskRegex.test(line));

            if (taskLines.length === 0) {
                new Notice('No task lines found');
                return;
            }

            const diagnostics = taskLines.map((line) => diagnoseTaskParsing(line));

            // Render as markdown table below the current position
            const report = generateMarkdownReport(diagnostics);

            // Insert the report below the current selection/line
            const insertLine = selection ? editor.getCursor('to').line + 1 : cursor.line + 1;

            editor.replaceRange('\n' + report + '\n', { line: insertLine, ch: 0 }, { line: insertLine, ch: 0 });

            new Notice('Diagnostic report inserted below');
        },
    });

    // Alternative: Show in modal
    plugin.addCommand({
        id: 'debug-parser-modal',
        name: 'Debug: Task Parser Diagnostic (Modal)',
        editorCallback: (editor: Editor, _ctx: MarkdownView | MarkdownFileInfo) => {
            const cursor = editor.getCursor();
            const line = editor.getLine(cursor.line);

            if (!TaskRegularExpressions.taskRegex.test(line)) {
                new Notice('Not a task line');
                return;
            }

            const diagnostic = diagnoseTaskParsing(line);
            new DiagnosticModal(plugin.app, diagnostic).open();
        },
    });
}

class DiagnosticModal extends Modal {
    diagnostic: TaskDiagnostic;

    constructor(app: App, diagnostic: TaskDiagnostic) {
        super(app);
        this.diagnostic = diagnostic;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();

        contentEl.createEl('h2', { text: 'Task Parser Diagnostic' });

        // Platform info
        const platformDiv = contentEl.createDiv('diagnostic-platform');
        platformDiv.createEl('h3', { text: 'Platform' });
        platformDiv.createEl('p', { text: `iOS: ${this.diagnostic.platform.isIOS}` });
        platformDiv.createEl('p', { text: `Safari: ${this.diagnostic.platform.safariVersion || 'N/A'}` });
        platformDiv.createEl('p', { text: `Time: ${this.diagnostic.platform.timestamp}` });

        // Original task
        contentEl.createEl('h3', { text: 'Task' });
        const taskPre = contentEl.createEl('pre');
        taskPre.createEl('code', { text: this.diagnostic.originalLine });

        // Parse errors
        if (this.diagnostic.parseErrors.length > 0) {
            contentEl.createEl('h3', { text: 'Errors', cls: 'diagnostic-error' });
            this.diagnostic.parseErrors.forEach((error) => {
                contentEl.createEl('p', { text: error, cls: 'diagnostic-error' });
            });
        }

        // Parsing steps
        contentEl.createEl('h3', { text: 'Parsing Steps' });

        if (this.diagnostic.parsingSteps.length === 0) {
            contentEl.createEl('p', { text: '❌ No fields could be parsed', cls: 'diagnostic-error' });
        } else {
            const table = contentEl.createEl('table', { cls: 'diagnostic-table' });
            const header = table.createEl('thead').createEl('tr');
            header.createEl('th', { text: 'Step' });
            header.createEl('th', { text: 'Field' });
            header.createEl('th', { text: 'Matched' });
            header.createEl('th', { text: 'Extracted' });

            const tbody = table.createEl('tbody');
            this.diagnostic.parsingSteps.forEach((step) => {
                const row = tbody.createEl('tr');
                row.createEl('td', { text: step.stepNumber.toString() });
                row.createEl('td', { text: step.fieldName });
                row.createEl('td', { text: step.matched ? '✅' : '❌' });
                row.createEl('td', { text: step.extractedValue || '—' });
            });
        }

        // Final state
        if (this.diagnostic.finalRemainingText) {
            contentEl.createEl('h3', { text: 'Final Description' });
            contentEl.createEl('p', { text: this.diagnostic.finalRemainingText, cls: 'diagnostic-final' });
        }

        // Emoji tests
        const emojiTests = Object.entries(this.diagnostic.emojiSpacingTests).filter(([_, result]) => result);
        if (emojiTests.length > 0) {
            contentEl.createEl('h3', { text: 'Emoji Patterns Found' });
            const list = contentEl.createEl('ul');
            emojiTests.forEach(([test]) => {
                list.createEl('li', { text: test.replace(/_/g, ' ') });
            });
        }

        // Add some basic styles
        this.addStyles();
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .diagnostic-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .diagnostic-table th { background: var(--background-modifier-border); padding: 5px; text-align: left; }
            .diagnostic-table td { padding: 5px; border-bottom: 1px solid var(--background-modifier-border); }
            .diagnostic-error { color: var(--text-error); font-weight: bold; }
            .diagnostic-final { background: var(--background-secondary); padding: 5px; border-radius: 3px; font-family: monospace; }
            .diagnostic-platform { background: var(--background-secondary); padding: 10px; border-radius: 5px; margin: 10px 0; }
        `;
        document.head.appendChild(style);
    }
}
