import { DEFAULT_SYMBOLS } from '../DefaultTaskSerializer';

export function runEmojiTests(text: string): Record<string, boolean> {
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
