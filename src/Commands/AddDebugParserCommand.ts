import { App, Editor, type MarkdownFileInfo, MarkdownView, Modal, Notice, Plugin } from 'obsidian';
import { DEFAULT_SYMBOLS } from '../TaskSerializer/DefaultTaskSerializer';

/**
 * Visual debug command to diagnose regex parsing issues on different platforms
 * Renders results directly in a modal or as markdown in the document
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
            const taskLines = lines.filter((line) => line.match(/^[\s\t>]*[-*+\d.)] \[.\]/));

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

            if (!line.match(/^[\s\t>]*[-*+\d.)] \[.\]/)) {
                new Notice('Not a task line');
                return;
            }

            const diagnostic = diagnoseTaskParsing(line);
            new DiagnosticModal(plugin.app, diagnostic).open();
        },
    });
}

interface ParsingStep {
    stepNumber: number;
    remainingText: string;
    fieldType: string;
    regex: string;
    matched: boolean;
    extracted?: string;
    textAfterExtraction?: string;
}

interface TaskDiagnostic {
    platform: {
        userAgent: string;
        isIOS: boolean;
        safariVersion: string | null;
    };
    originalLine: string;
    taskBody: string;
    parsingSteps: ParsingStep[];
    finalRemainingText: string;
    successfullyParsed: boolean;
    extractedFields: Record<string, string>;
    emojiSpacingTests: Record<string, boolean>;
}

function diagnoseTaskParsing(line: string): TaskDiagnostic {
    const diagnostic: TaskDiagnostic = {
        platform: {
            userAgent: navigator.userAgent,
            isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
            safariVersion: getSafariVersion(),
        },
        originalLine: line,
        taskBody: '',
        parsingSteps: [],
        finalRemainingText: '',
        successfullyParsed: false,
        extractedFields: {},
        emojiSpacingTests: {},
    };

    // Extract task body for parsing
    const taskMatch = line.match(/^([\s\t>]*)([-*+]|\d+[.)]) \[.\] (.*)/);
    if (!taskMatch) return diagnostic;

    diagnostic.taskBody = taskMatch[3];
    let remainingText = taskMatch[3];
    const { TaskFormatRegularExpressions } = DEFAULT_SYMBOLS;

    // Test each field regex in order (same order as DefaultTaskSerializer)
    const fields = [
        { name: 'priority', regex: TaskFormatRegularExpressions.priorityRegex },
        { name: 'doneDate', regex: TaskFormatRegularExpressions.doneDateRegex },
        { name: 'cancelledDate', regex: TaskFormatRegularExpressions.cancelledDateRegex },
        { name: 'dueDate', regex: TaskFormatRegularExpressions.dueDateRegex },
        { name: 'scheduledDate', regex: TaskFormatRegularExpressions.scheduledDateRegex },
        { name: 'startDate', regex: TaskFormatRegularExpressions.startDateRegex },
        { name: 'createdDate', regex: TaskFormatRegularExpressions.createdDateRegex },
        { name: 'recurrence', regex: TaskFormatRegularExpressions.recurrenceRegex },
        { name: 'onCompletion', regex: TaskFormatRegularExpressions.onCompletionRegex },
        { name: 'id', regex: TaskFormatRegularExpressions.idRegex },
        { name: 'dependsOn', regex: TaskFormatRegularExpressions.dependsOnRegex },
    ];

    let stepNumber = 0;
    const maxIterations = 20;
    let anyMatched = false;

    do {
        anyMatched = false;
        for (const field of fields) {
            const match = remainingText.match(field.regex);
            if (match) {
                const step: ParsingStep = {
                    stepNumber: stepNumber++,
                    remainingText,
                    fieldType: field.name,
                    regex: field.regex.source,
                    matched: true,
                    extracted: match[0],
                    textAfterExtraction: remainingText.replace(field.regex, '').trim(),
                };

                diagnostic.parsingSteps.push(step);
                diagnostic.extractedFields[field.name] = match[0];
                remainingText = step.textAfterExtraction || '';
                anyMatched = true;
            }
        }
    } while (anyMatched && stepNumber < maxIterations && remainingText);

    diagnostic.finalRemainingText = remainingText;
    diagnostic.successfullyParsed = diagnostic.parsingSteps.length > 0;

    // Run emoji spacing tests on the specific line
    diagnostic.emojiSpacingTests = runEmojiTests(diagnostic.taskBody);

    return diagnostic;
}

function runEmojiTests(text: string): Record<string, boolean> {
    const tests: Record<string, boolean> = {};

    // Test if various patterns exist and if they match expected regexes
    if (text.includes('🔺 ⏳')) {
        tests['has_triangle_space_hourglass'] = true;
        tests['triangle_at_end_before_space'] = /🔺$/.test('test 🔺');
        tests['hourglass_at_end_after_triangle_space'] = /⏳/.test(text.substring(text.indexOf('🔺 ⏳')));
    }

    if (text.includes('🔺⏳')) {
        tests['has_triangle_no_space_hourglass'] = true;
        tests['dense_emoji_at_end'] = /🔺⏳$/.test(text);
    }

    // Test $ anchor with these specific emojis
    tests['triangle_with_dollar'] = /🔺$/.test('🔺');
    tests['hourglass_with_dollar'] = /⏳$/.test('⏳');
    tests['triangle_space_with_dollar'] = /🔺 $/.test('🔺 ');

    return tests;
}

function getSafariVersion(): string | null {
    const match = navigator.userAgent.match(/Version\/(\d+\.\d+)/);
    return match ? match[1] : null;
}

function generateMarkdownReport(diagnostics: TaskDiagnostic[]): string {
    let report = '## 🔍 Task Parser Diagnostic Report\n\n';

    // Platform info
    const d = diagnostics[0];
    report += '### Platform\n';
    report += `- **iOS**: ${d.platform.isIOS ? 'Yes' : 'No'}\n`;
    report += `- **Safari**: ${d.platform.safariVersion || 'N/A'}\n`;
    report += `- **User Agent**: \`${d.platform.userAgent.substring(0, 50)}...\`\n\n`;

    // Process each task
    diagnostics.forEach((diagnostic, index) => {
        report += `### Task ${index + 1}\n`;
        report += '```\n' + diagnostic.originalLine + '\n```\n\n';

        // Summary
        report += `**Parsed**: ${diagnostic.successfullyParsed ? '✅ Yes' : '❌ No'} | `;
        report += `**Fields Found**: ${Object.keys(diagnostic.extractedFields).length}\n\n`;

        // Field extraction table
        if (diagnostic.parsingSteps.length > 0) {
            report += '#### Fields Extracted\n\n';
            report += '| Step | Field | Value | Remaining After |\n';
            report += '|------|-------|-------|------------------|\n';

            diagnostic.parsingSteps.forEach((step) => {
                const remaining = step.textAfterExtraction
                    ? '`' +
                      step.textAfterExtraction.substring(0, 30) +
                      (step.textAfterExtraction.length > 30 ? '...' : '') +
                      '`'
                    : '_(empty)_';
                report += `| ${step.stepNumber} | ${step.fieldType} | \`${step.extracted}\` | ${remaining} |\n`;
            });
            report += '\n';
        }

        // Final state
        if (diagnostic.finalRemainingText) {
            report += `**Final Unparsed Text**: \`${diagnostic.finalRemainingText}\`\n\n`;
        }

        // Emoji tests if relevant
        const emojiTests = Object.entries(diagnostic.emojiSpacingTests);
        if (emojiTests.length > 0) {
            report += '#### Emoji Pattern Tests\n';
            emojiTests.forEach(([test, result]) => {
                report += `- ${test}: ${result ? '✅' : '❌'}\n`;
            });
            report += '\n';
        }
    });

    report += '---\n';
    report += '_Generated by Tasks Parser Diagnostic_\n';

    return report;
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

        // Original task
        contentEl.createEl('h3', { text: 'Task' });
        const taskPre = contentEl.createEl('pre');
        taskPre.createEl('code', { text: this.diagnostic.originalLine });

        // Parsing steps
        contentEl.createEl('h3', { text: 'Parsing Steps' });

        if (this.diagnostic.parsingSteps.length === 0) {
            contentEl.createEl('p', { text: '❌ No fields could be parsed', cls: 'diagnostic-error' });
        } else {
            const table = contentEl.createEl('table', { cls: 'diagnostic-table' });
            const header = table.createEl('thead').createEl('tr');
            header.createEl('th', { text: 'Step' });
            header.createEl('th', { text: 'Field' });
            header.createEl('th', { text: 'Extracted' });
            header.createEl('th', { text: 'Remaining' });

            const tbody = table.createEl('tbody');
            this.diagnostic.parsingSteps.forEach((step) => {
                const row = tbody.createEl('tr');
                row.createEl('td', { text: step.stepNumber.toString() });
                row.createEl('td', { text: step.fieldType });
                row.createEl('td', { text: step.extracted || '' });
                row.createEl('td', { text: (step.textAfterExtraction || '').substring(0, 20) });
            });
        }

        // Final state
        if (this.diagnostic.finalRemainingText) {
            contentEl.createEl('h3', { text: 'Unparsed Text' });
            contentEl.createEl('p', { text: this.diagnostic.finalRemainingText, cls: 'diagnostic-unparsed' });
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
            .diagnostic-unparsed { background: var(--background-modifier-error); padding: 5px; border-radius: 3px; }
            .diagnostic-platform { background: var(--background-secondary); padding: 10px; border-radius: 5px; margin: 10px 0; }
        `;
        document.head.appendChild(style);
    }
}
