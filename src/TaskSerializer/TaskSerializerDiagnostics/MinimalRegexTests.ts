export function runMinimalRegexTests(): {
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

        // CRITICAL TEST: After string manipulation (simulating the parsing loop)
        [
            'After replace: triangle then hourglass',
            '🔺 ⏳ 2025-08-09'.replace(/nothing/, ''),
            '⏳ \\d{4}-\\d{2}-\\d{2}',
        ],
        ['After trim: triangle then hourglass', '🔺 ⏳ 2025-08-09'.trim(), '⏳ \\d{4}-\\d{2}-\\d{2}'],
        ['After substring: just hourglass part', '🔺 ⏳ 2025-08-09'.substring(3), '⏳ \\d{4}-\\d{2}-\\d{2}'],

        // Test the ACTUAL parsing scenario - remove priority first, then match scheduled
        ['Step 1: Priority match', 'Highest 🔺 ⏳ 2025-08-09', '🔺\\uFE0F?'],
        ['Step 2: After removing priority', 'Highest  ⏳ 2025-08-09', '[⏳⌛]\\uFE0F? *(\\d{4}-\\d{2}-\\d{2})'],
        ['Step 2b: After trim', 'Highest ⏳ 2025-08-09', '[⏳⌛]\\uFE0F? *(\\d{4}-\\d{2}-\\d{2})'],

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

    // Add a special test that simulates the actual parsing loop
    const simulateParsingLoop = () => {
        let line = 'Highest 🔺 ⏳ 2025-08-09';
        const steps: any[] = [];

        // Step 1: Try to match and remove priority
        const priorityRegex = /([🔺⏫🔼🔽⏬])\uFE0F?$/u;
        const priorityMatch = line.match(priorityRegex);
        steps.push({
            testName: 'Parsing simulation: priority match',
            input: line,
            pattern: priorityRegex.source,
            withDollar: true,
            matched: !!priorityMatch,
        });

        if (priorityMatch) {
            line = line.replace(priorityRegex, '').trim();
            steps.push({
                testName: 'Parsing simulation: after priority removed',
                input: line,
                pattern: 'N/A - showing line state',
                withDollar: false,
                matched: true,
            });
        }

        // Step 2: Try to match scheduled date
        const scheduledRegex = /[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2})$/u;
        const scheduledMatch = line.match(scheduledRegex);
        steps.push({
            testName: 'Parsing simulation: scheduled match',
            input: line,
            pattern: scheduledRegex.source,
            withDollar: true,
            matched: !!scheduledMatch,
        });

        return steps;
    };

    results.push(...simulateParsingLoop());

    return results;
}
