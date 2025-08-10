import { App, Editor, type MarkdownFileInfo, MarkdownView, Modal, Notice, Plugin } from 'obsidian';
import type { TaskDetails } from '../TaskSerializer';
import { DEFAULT_SYMBOLS, DefaultTaskSerializer } from '../TaskSerializer/DefaultTaskSerializer';
import { TaskRegularExpressions } from '../Task/TaskRegularExpressions';

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

export interface ParseStep {
    stepNumber: number;
    fieldName: string;
    regex: string;
    inputBeforeMatch: string;
    matched: boolean;
    extractedValue?: string;
    remainingAfterMatch?: string;
}

export interface TaskDiagnostic {
    platform: {
        userAgent: string;
        isIOS: boolean;
        safariVersion: string | null;
        timestamp: string;
        platform?: string;
        maxTouchPoints?: number;
    };
    originalLine: string;
    taskBody: string;
    lineCharacterAnalysis: CharacterInfo[];
    taskBodyCharacterAnalysis: CharacterInfo[];
    parsingSteps: ParseStep[];
    finalRemainingText: string;
    successfullyParsed: boolean;
    extractedFields: Record<string, string>;
    emojiSpacingTests: Record<string, boolean>;
    parseErrors: string[];
    minimalRegexTests?: { testName: string; input: string; pattern: string; withDollar: boolean; matched: boolean }[];
}

export interface CharacterInfo {
    index: number;
    char: string;
    codePoint: number;
    codePointHex: string;
    utf16: string;
    unicode: string;
    isEmoji?: boolean;
    description?: string;
}

function analyzeCharacters(text: string): CharacterInfo[] {
    const analysis: CharacterInfo[] = [];
    let index = 0;

    // Use Array.from to properly handle surrogate pairs and emoji
    const chars = Array.from(text);

    for (const char of chars) {
        const codePoint = char.codePointAt(0) || 0;
        const info: CharacterInfo = {
            index: index++,
            char: char,
            codePoint: codePoint,
            codePointHex: codePoint.toString(16).toUpperCase().padStart(4, '0'),
            utf16: char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'),
            unicode: `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`,
        };

        // Identify special characters
        if (codePoint === 0xfe0f) {
            info.description = 'Variation Selector-16 (emoji)';
        } else if (codePoint === 0xfe0e) {
            info.description = 'Variation Selector-15 (text)';
        } else if (codePoint >= 0x200b && codePoint <= 0x200f) {
            info.description = 'Zero-width character';
        } else if (codePoint === 0x20) {
            info.description = 'Space';
        } else if (codePoint === 0x09) {
            info.description = 'Tab';
        } else if (codePoint >= 0x1f300 && codePoint <= 0x1f9ff) {
            info.isEmoji = true;
            info.description = 'Emoji';
        }

        analysis.push(info);
    }

    return analysis;
}

function runMinimalRegexTests(): {
    testName: string;
    input: string;
    pattern: string;
    withDollar: boolean;
    matched: boolean;
}[] {
    const results: { testName: string; input: string; pattern: string; withDollar: boolean; matched: boolean }[] = [];

    // Test cases: [name, input, pattern (without $)]
    const testCases = [
        // Basic emoji tests
        ['Simple emoji at end', '🔺', '🔺'],
        ['Emoji with space', '🔺 ', '🔺 '],
        ['Two emojis', '🔺⏳', '🔺⏳'],
        ['Two emojis with space', '🔺 ⏳', '🔺 ⏳'],
        ['Two emojis with two spaces', '🔺  ⏳', '🔺  ⏳'],

        // Scheduled date patterns
        ['Hourglass with date', '⏳ 2025-08-09', '⏳ \\d{4}-\\d{2}-\\d{2}'],
        ['Hourglass no space date', '⏳2025-08-09', '⏳\\d{4}-\\d{2}-\\d{2}'],
        ['Triangle space hourglass date', '🔺 ⏳ 2025-08-09', '⏳ \\d{4}-\\d{2}-\\d{2}'],
        ['Triangle no space hourglass date', '🔺⏳ 2025-08-09', '⏳ \\d{4}-\\d{2}-\\d{2}'],

        // Priority patterns
        ['Just triangle', '🔺', '[🔺⏫🔼🔽⏬]'],
        ['Triangle in brackets', '🔺', '([🔺⏫🔼🔽⏬])'],
        ['Triangle with variant selector', '🔺', '[🔺⏫🔼🔽⏬]\\uFE0F?'],

        // From actual failing cases
        ['Medium priority', '🔼', '[🔺⏫🔼🔽⏬]\\uFE0F?'],
        ['Low priority', '🔽', '[🔺⏫🔼🔽⏬]\\uFE0F?'],
        ['After triangle space', ' ⏳ 2025-08-09', '[⏳⌛]\\uFE0F? *(\\d{4}-\\d{2}-\\d{2})'],

        // Control tests (non-emoji)
        ['Regular text', 'test', 'test'],
        ['Text with number', 'test123', 'test\\d+'],
        ['Date alone', '2025-08-09', '\\d{4}-\\d{2}-\\d{2}'],
    ];

    for (const [testName, input, patternBase] of testCases) {
        // Test without $
        try {
            const regexNoDollar = new RegExp(patternBase, 'u');
            const matchNoDollar = regexNoDollar.test(input);
            results.push({
                testName: testName as string,
                input: input as string,
                pattern: patternBase as string,
                withDollar: false,
                matched: matchNoDollar,
            });
        } catch (e) {
            results.push({
                testName: testName as string,
                input: input as string,
                pattern: patternBase as string,
                withDollar: false,
                matched: false,
            });
        }

        // Test with $
        try {
            const regexWithDollar = new RegExp(patternBase + '$', 'u');
            const matchWithDollar = regexWithDollar.test(input);
            results.push({
                testName: testName as string,
                input: input as string,
                pattern: patternBase + '$',
                withDollar: true,
                matched: matchWithDollar,
            });
        } catch (e) {
            results.push({
                testName: testName as string,
                input: input as string,
                pattern: patternBase + '$',
                withDollar: true,
                matched: false,
            });
        }
    }

    return results;
}

function diagnoseTaskParsing(line: string): TaskDiagnostic {
    const diagnostic: TaskDiagnostic = {
        platform: {
            userAgent: navigator.userAgent,
            isIOS:
                /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
            safariVersion: getSafariVersion(),
            timestamp: new Date().toISOString(),
            platform: navigator.platform,
            maxTouchPoints: navigator.maxTouchPoints,
        },
        originalLine: line,
        taskBody: '',
        lineCharacterAnalysis: analyzeCharacters(line),
        taskBodyCharacterAnalysis: [],
        parsingSteps: [],
        finalRemainingText: '',
        successfullyParsed: false,
        extractedFields: {},
        emojiSpacingTests: {},
        parseErrors: [],
        minimalRegexTests: runMinimalRegexTests(),
    };

    // Extract task body using the actual Tasks regex
    const taskMatch = line.match(TaskRegularExpressions.taskRegex);
    if (!taskMatch) {
        diagnostic.parseErrors.push('Line does not match task regex');
        return diagnostic;
    }

    // Groups: [1]=indentation, [2]=listMarker, [3]=status, [4]=description+fields
    diagnostic.taskBody = taskMatch[4] || '';
    diagnostic.taskBodyCharacterAnalysis = analyzeCharacters(diagnostic.taskBody);

    // Create a serializer and call the ACTUAL deserialize with diagnostic flag
    const serializer = new DefaultTaskSerializer(DEFAULT_SYMBOLS);

    const result = serializer.deserialize(diagnostic.taskBody, true);

    if (result.diagnostics) {
        // Convert the ParseDiagnostic format to ParseStep format
        diagnostic.parsingSteps = result.diagnostics.map((d, index) => ({
            stepNumber: index,
            fieldName: d.fieldName,
            regex: d.regex,
            inputBeforeMatch: d.input,
            matched: d.matched,
            extractedValue: d.extracted,
            remainingAfterMatch: d.remaining,
        }));

        // Extract the fields that were successfully parsed
        diagnostic.extractedFields = {};
        result.diagnostics.forEach((d) => {
            if (d.matched && d.extracted) {
                diagnostic.extractedFields[d.fieldName] = d.extracted;
            }
        });

        // The final description is what's left after all parsing
        diagnostic.finalRemainingText = result.description || '';
        diagnostic.successfullyParsed = Object.keys(diagnostic.extractedFields).length > 0;
    }

    // Run emoji spacing tests specific to iOS issues
    diagnostic.emojiSpacingTests = runEmojiTests(diagnostic.taskBody);

    return diagnostic;
}

function runEmojiTests(text: string): Record<string, boolean> {
    const tests: Record<string, boolean> = {};

    // Test the specific iOS 18.6 problematic patterns
    const patterns = [
        { name: 'has_triangle_space_hourglass', check: () => text.includes('🔺 ⏳') },
        { name: 'has_triangle_nospace_hourglass', check: () => text.includes('🔺⏳') },
        { name: 'has_triangle_2space_hourglass', check: () => text.includes('🔺  ⏳') },
        { name: 'has_medium_space_hourglass', check: () => text.includes('🔼 ⏳') },
        { name: 'has_low_space_hourglass', check: () => text.includes('🔽 ⏳') },
    ];

    patterns.forEach((pattern) => {
        tests[pattern.name] = pattern.check();
    });

    // Test regex behavior with these patterns
    if (text.includes('🔺 ⏳')) {
        const testStr = '🔺 ⏳';
        tests['triangle_dollar_match'] = /🔺$/.test('🔺');
        tests['hourglass_dollar_match'] = /⏳$/.test('⏳');
        tests['triangle_space_dollar_match'] = /🔺 $/.test('🔺 ');
        tests['sequence_dollar_match'] = /🔺 ⏳$/.test(testStr);
    }

    // Test the actual Tasks regexes on snippets
    const { TaskFormatRegularExpressions } = DEFAULT_SYMBOLS;
    if (text.includes('⏳')) {
        const hourglassIndex = text.indexOf('⏳');
        const snippet = text.substring(Math.max(0, hourglassIndex - 5));
        tests['scheduled_regex_on_snippet'] = TaskFormatRegularExpressions.scheduledDateRegex.test(snippet);
    }

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
    report += `- **iOS/iPad**: ${d.platform.isIOS ? 'Yes' : 'No'}\n`;
    report += `- **Platform**: ${d.platform.platform}\n`;
    report += `- **Touch Points**: ${d.platform.maxTouchPoints}\n`;
    report += `- **Safari**: ${d.platform.safariVersion || 'N/A'}\n`;
    report += `- **Time**: ${d.platform.timestamp}\n`;
    report += `- **User Agent**: \`${d.platform.userAgent.substring(0, 50)}...\`\n\n`;

    // Process each task
    diagnostics.forEach((diagnostic, index) => {
        report += `### Task ${index + 1}\n`;
        report += '```text\n' + diagnostic.originalLine + '\n```\n\n';

        // Parse errors
        if (diagnostic.parseErrors.length > 0) {
            report += '**Errors**: ' + diagnostic.parseErrors.join(', ') + '\n\n';
        }

        // Summary
        report += `**Parsed**: ${diagnostic.successfullyParsed ? '✅ Yes' : '❌ No'} | `;
        report += `**Fields Found**: ${Object.keys(diagnostic.extractedFields).length}\n\n`;

        // Character analysis - show all characters
        if (diagnostic.taskBodyCharacterAnalysis.length > 0) {
            report += '#### Character Analysis (Task Body)\n\n';
            report += '| Index | Char | Unicode | Hex | Description |\n';
            report += '|-------|------|---------|-----|-------------|\n';

            diagnostic.taskBodyCharacterAnalysis.forEach((char) => {
                const displayChar =
                    char.codePoint === 0x20
                        ? '(space)'
                        : char.codePoint === 0x09
                        ? '(tab)'
                        : char.codePoint < 32
                        ? '(control)'
                        : char.char;
                report += `| ${char.index} | ${displayChar} | ${char.unicode} | ${char.codePointHex} | ${
                    char.description || ''
                } |\n`;
            });
            report += '\n';

            // Also show a compact hex string for easy comparison
            const hexString = diagnostic.taskBodyCharacterAnalysis.map((c) => c.codePointHex).join(' ');
            report += `**Hex string**: \`${hexString}\`\n\n`;
        }

        // Field extraction table
        if (diagnostic.parsingSteps.length > 0) {
            report += `#### Task ${index + 1}: Parsing Steps\n\n`;
            report += '| Step | Field | Matched | Value | Regex | Input Before | Remaining After |\n';
            report += '|------|-------|---------|-------|-------|--------------|-----------------|\n';

            diagnostic.parsingSteps.forEach((step) => {
                const inputBefore = '`' + step.inputBeforeMatch + '`';
                const remaining = step.remainingAfterMatch ? '`' + step.remainingAfterMatch + '`' : '_(empty)_';
                const value = step.extractedValue ? '`' + step.extractedValue + '`' : '—';
                const matched = step.matched ? '✅' : '❌';
                // Escape pipe characters in regex for markdown table
                const regex = '`' + step.regex.replace(/\|/g, '\\|') + '`';

                report += `| ${step.stepNumber} | ${step.fieldName} | ${matched} | ${value} | ${regex} | ${inputBefore} | ${remaining} |\n`;
            });
            report += '\n';
        }

        // Final state
        if (diagnostic.finalRemainingText) {
            report += `**Final Description**: \`${diagnostic.finalRemainingText}\`\n\n`;
        }

        // Emoji tests if relevant
        const emojiTests = Object.entries(diagnostic.emojiSpacingTests);
        if (emojiTests.some(([_, result]) => result)) {
            report += '#### Emoji Pattern Tests\n';
            emojiTests
                .filter(([_, result]) => result)
                .forEach(([test, result]) => {
                    report += `- ${test}: ${result ? '✅' : '❌'}\n`;
                });
            report += '\n';
        }
    });

    report += '---\n';
    report += 'Generated by Tasks Parser Diagnostic\n';

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
