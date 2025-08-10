import { TaskRegularExpressions } from '../../Task/TaskRegularExpressions';
import { DefaultTaskSerializer } from '../index';
import { DEFAULT_SYMBOLS } from '../DefaultTaskSerializer';
import { runMinimalRegexTests } from './MinimalRegexTests';
import { runEmojiTests } from './EmojiTests';
import { type CharacterInfo, analyzeCharacters } from './AnalyzeCharacters';

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

export function diagnoseTaskParsing(line: string): TaskDiagnostic {
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

function getSafariVersion(): string | null {
    const match = navigator.userAgent.match(/Version\/(\d+\.\d+)/);
    return match ? match[1] : null;
}
