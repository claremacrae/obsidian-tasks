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
