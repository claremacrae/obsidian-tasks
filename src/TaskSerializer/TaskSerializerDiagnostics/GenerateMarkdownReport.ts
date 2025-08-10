import type { TaskDiagnostic } from './DiagnoseTaskParsing';

export function generateMarkdownReport(diagnostics: TaskDiagnostic[]): string {
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

    // Minimal Regex Tests (only in first diagnostic)
    if (d.minimalRegexTests && d.minimalRegexTests.length > 0) {
        report += '### Minimal Regex Tests\n\n';
        report += 'Testing regex patterns with and without $ anchor:\n\n';

        // Group tests by name to show with/without $ side by side
        const testGroups = new Map<string, any[]>();
        d.minimalRegexTests.forEach((test) => {
            if (!testGroups.has(test.testName)) {
                testGroups.set(test.testName, []);
            }
            testGroups.get(test.testName)!.push(test);
        });

        report += '| Test | Input | Pattern (no $) | Match | Pattern (with $) | Match |\n';
        report += '|------|-------|----------------|-------|------------------|-------|\n';

        testGroups.forEach((tests, testName) => {
            const noDollar = tests.find((t) => !t.withDollar);
            const withDollar = tests.find((t) => t.withDollar);

            if (noDollar && withDollar) {
                const noDollarPattern =
                    '`' + noDollar.pattern.substring(0, 30) + (noDollar.pattern.length > 30 ? '...' : '') + '`';
                const withDollarPattern =
                    '`' + withDollar.pattern.substring(0, 30) + (withDollar.pattern.length > 30 ? '...' : '') + '`';
                const input = '`' + noDollar.input + '`';

                report += `| ${testName} | ${input} | ${noDollarPattern} | ${
                    noDollar.matched ? '✅' : '❌'
                } | ${withDollarPattern} | ${withDollar.matched ? '✅' : '❌'} |\n`;

                // Highlight differences
                if (noDollar.matched !== withDollar.matched) {
                    report += '| ⚠️ **DIFFERS** | | | | | |\n';
                }
            }
        });

        report += '\n';

        // Summary of failures
        const dollarFailures = d.minimalRegexTests.filter((t) => t.withDollar && !t.matched);
        const noDollarFailures = d.minimalRegexTests.filter((t) => !t.withDollar && !t.matched);

        if (dollarFailures.length > 0 || noDollarFailures.length > 0) {
            report += '**Failed tests:**\n';
            if (dollarFailures.length > 0) {
                report += `- With $ anchor: ${dollarFailures.length} failures\n`;
            }
            if (noDollarFailures.length > 0) {
                report += `- Without $ anchor: ${noDollarFailures.length} failures\n`;
            }
            report += '\n';
        }
    }

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
