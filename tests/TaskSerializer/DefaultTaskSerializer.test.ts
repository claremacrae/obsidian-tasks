/**
 * @jest-environment jsdom
 */
import moment from 'moment';
import type { Settings } from '../../src/Config/Settings';
import { DefaultTaskSerializer } from '../../src/TaskSerializer';
import { RecurrenceBuilder } from '../TestingTools/RecurrenceBuilder';
import {
    DEFAULT_SYMBOLS,
    type DefaultTaskSerializerSymbols,
    allTaskPluginEmojis,
} from '../../src/TaskSerializer/DefaultTaskSerializer';
import { TaskBuilder } from '../TestingTools/TaskBuilder';
import { OnCompletion } from '../../src/Task/OnCompletion';
import { Priority } from '../../src/Task/Priority';
import { escapeInvisibleCharacters } from '../../src/lib/StringHelpers';

jest.mock('obsidian');
window.moment = moment;

type DefaultTaskSerializeSymbolMap = readonly {
    taskFormat: Settings['taskFormat'];
    symbols: DefaultTaskSerializerSymbols;
}[];
// A map that facilitates parameterizing the tests over symbols
const symbolMap: DefaultTaskSerializeSymbolMap = [{ taskFormat: 'tasksPluginEmoji', symbols: DEFAULT_SYMBOLS }];

/**
 * Since Variant Selectors are invisible, any tests whose behaviour is dependent on the
 * presence or absence of one MUST 'expect' on the result of this function,
 * to confirm that the test is doing what it claims to be doing.
 * @param text
 */
function hasVariantSelector16(text: string) {
    const vs16Regex = /\uFE0F/u;
    return text.match(vs16Regex) !== null;
}

describe('validate emojis', () => {
    // If these tests fail, paste the problem emoji in to https://apps.timwhitlock.info/unicode/inspect
    it.each(allTaskPluginEmojis())('emoji does not contain Variant Selector 16: "%s"', (emoji: string) => {
        expect(hasVariantSelector16(emoji)).toBe(false);
    });
});

describe('validate emoji regular expressions', () => {
    /**
     * Generate a string representation of all regular expressions
     * in TaskFormatRegularExpressions by concatenating their source and flags.
     */
    function generateRegexApprovalTest(): string {
        const regexMap = DEFAULT_SYMBOLS.TaskFormatRegularExpressions;
        const regexDetails = Object.entries(regexMap).map(([key, regex]) => {
            // Get the source and flags for each regex
            if (regex instanceof RegExp) {
                return `${key}: /${regex.source}/${regex.flags}`;
            } else {
                throw new Error(`Unexpected value for ${key}: Not a regular expression.`);
            }
        });
        // Concatenate all entries into a single string, with any Variation Selectors made visible
        return escapeInvisibleCharacters('\n' + regexDetails.join('\n') + '\n');
    }

    it('regular expressions should have expected source', () => {
        expect(generateRegexApprovalTest()).toMatchInlineSnapshot(`
            "
            priorityRegex: /(🔺|⏫|🔼|🔽|⏬)\\ufe0f?$/
            startDateRegex: /🛫\\ufe0f? *(\\d{4}-\\d{2}-\\d{2})$/
            createdDateRegex: /➕\\ufe0f? *(\\d{4}-\\d{2}-\\d{2})$/
            scheduledDateRegex: /(?:⏳|⌛)\\ufe0f? *(\\d{4}-\\d{2}-\\d{2})$/
            dueDateRegex: /(?:📅|📆|🗓)\\ufe0f? *(\\d{4}-\\d{2}-\\d{2})$/
            doneDateRegex: /✅\\ufe0f? *(\\d{4}-\\d{2}-\\d{2})$/
            cancelledDateRegex: /❌\\ufe0f? *(\\d{4}-\\d{2}-\\d{2})$/
            recurrenceRegex: /🔁\\ufe0f? *([a-zA-Z0-9, !]+)$/
            onCompletionRegex: /🏁\\ufe0f? *([a-zA-Z]+)$/
            dependsOnRegex: /⛔\\ufe0f? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$/
            idRegex: /🆔\\ufe0f? *([a-zA-Z0-9-_]+)$/
            "
        `);
    });
});

// NEW_TASK_FIELD_EDIT_REQUIRED

describe.each(symbolMap)("DefaultTaskSerializer with '$taskFormat' symbols", ({ symbols }) => {
    const taskSerializer = new DefaultTaskSerializer(symbols);
    const serialize = taskSerializer.serialize.bind(taskSerializer);
    const deserialize = taskSerializer.deserialize.bind(taskSerializer);
    const {
        startDateSymbol,
        createdDateSymbol,
        recurrenceSymbol,
        onCompletionSymbol,
        scheduledDateSymbol,
        dueDateSymbol,
        doneDateSymbol,
        idSymbol,
        dependsOnSymbol,
    } = symbols;

    describe('deserialize', () => {
        it('should parse an empty string', () => {
            const taskDetails = deserialize('');
            expect(taskDetails).toMatchTaskDetails({});
        });

        describe('should parse dates', () => {
            it.each([
                { what: 'startDate', symbol: startDateSymbol },
                { what: 'createdDate', symbol: createdDateSymbol },
                { what: 'scheduledDate', symbol: scheduledDateSymbol },
                { what: 'dueDate', symbol: dueDateSymbol },
                { what: 'doneDate', symbol: doneDateSymbol },
            ] as const)('should parse a $what', ({ what, symbol }) => {
                const taskDetails = deserialize(`${symbol} 2021-06-20`);
                expect(taskDetails).toMatchTaskDetails({ [what]: moment('2021-06-20', 'YYYY-MM-DD') });
            });

            it('should parse a scheduledDate - with non-standard emoji', () => {
                const taskDetails = deserialize('⌛ 2021-06-20');
                expect(taskDetails).toMatchTaskDetails({ ['scheduledDate']: moment('2021-06-20', 'YYYY-MM-DD') });
            });

            it('should parse a scheduledDate - with Variation Selector', () => {
                // This test showed the existence of https://github.com/obsidian-tasks-group/obsidian-tasks/issues/3179
                const input = '⏳️ 2024-11-18';
                expect(hasVariantSelector16(input)).toBe(true);

                const taskDetails = deserialize(input);
                expect(taskDetails).toMatchTaskDetails({ ['scheduledDate']: moment('2024-11-18', 'YYYY-MM-DD') });
            });

            it('should parse a dueDate - with non-standard emoji 1', () => {
                const taskDetails = deserialize('📆 2021-06-20');
                expect(taskDetails).toMatchTaskDetails({ ['dueDate']: moment('2021-06-20', 'YYYY-MM-DD') });
            });

            it('should parse a dueDate - with non-standard emoji 2', () => {
                const taskDetails = deserialize('🗓 2021-06-20');
                expect(taskDetails).toMatchTaskDetails({ ['dueDate']: moment('2021-06-20', 'YYYY-MM-DD') });
            });
        });

        describe('should parse priorities', () => {
            it('should parse a priority', () => {
                const priorities = ['Highest', 'High', 'None', 'Medium', 'Low', 'Lowest'] as const;
                for (const p of priorities) {
                    const prioritySymbol = symbols.prioritySymbols[p];
                    const priority = Priority[p];

                    const taskDetails = deserialize(`${prioritySymbol}`);

                    expect(taskDetails).toMatchTaskDetails({ priority });
                }
            });

            it('should parse a high priority without Variant Selector 16', () => {
                const line = '⏫';
                expect(hasVariantSelector16(line)).toBe(false);

                const taskDetails = deserialize(line);
                expect(taskDetails).toMatchTaskDetails({ priority: Priority.High });
            });

            it('should parse a high priority with Variant Selector 16', () => {
                // This test showed the existence of https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2273
                const line = '⏫️'; // There is a hidden Variant Selector 16 character at the end of this string
                expect(hasVariantSelector16(line)).toBe(true);

                const taskDetails = deserialize(line);
                expect(taskDetails).toMatchTaskDetails({ priority: Priority.High });
            });
        });

        it('should parse a recurrence', () => {
            const taskDetails = deserialize(`${recurrenceSymbol} every day`);
            expect(taskDetails).toMatchTaskDetails({
                recurrence: new RecurrenceBuilder().rule('every day').build(),
            });
        });

        describe('should parse onCompletion', () => {
            it('should parse delete action', () => {
                const onCompletion = `${onCompletionSymbol} Delete`;
                const taskDetails = deserialize(onCompletion);
                expect(taskDetails).toMatchTaskDetails({ onCompletion: OnCompletion.Delete });
            });

            it('should allow multiple spaces', () => {
                const onCompletion = `${onCompletionSymbol}  Keep`;
                const taskDetails = deserialize(onCompletion);
                expect(taskDetails).toMatchTaskDetails({ onCompletion: OnCompletion.Keep });
            });
        });

        describe('should parse depends on', () => {
            it('should parse depends on one task', () => {
                const id = `${dependsOnSymbol} F12345`;
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ dependsOn: ['F12345'] });
            });

            it('should parse depends on one task - without Variant Selector 16', () => {
                // This test showed the existence of https://github.com/obsidian-tasks-group/obsidian-tasks/issues/2693
                const id = '⛔ F12345';
                expect(hasVariantSelector16(id)).toBe(false);

                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ dependsOn: ['F12345'] });
            });

            it('should parse depends on one task - with Variant Selector 16', () => {
                const id = '⛔️ F12345'; // There is a hidden Variant Selector 16 character at the end of this string
                expect(hasVariantSelector16(id)).toBe(true);

                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ dependsOn: ['F12345'] });
            });

            it('should parse depends on two tasks', () => {
                const id = `${dependsOnSymbol} 123456,abC123`;
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ dependsOn: ['123456', 'abC123'] });
            });

            it('should parse depends on multiple tasks with varying spaces tasks', () => {
                const id = `${dependsOnSymbol} ab , CD ,  EF  ,    GK`;
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ dependsOn: ['ab', 'CD', 'EF', 'GK'] });
            });
        });

        describe('should parse id', () => {
            it('should parse id with lower-case and numbers', () => {
                const id = `${idSymbol} pqrd0f`;
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ id: 'pqrd0f' });
            });

            it('should parse id with capitals', () => {
                const id = `${idSymbol} Abcd0f`;
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ id: 'Abcd0f' });
            });

            it('should parse id with hyphen', () => {
                const id = `${idSymbol} Abcd0f-`;
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ id: 'Abcd0f-' });
            });

            it('should parse id with underscore', () => {
                const id = `${idSymbol} Ab_cd0f`;
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ id: 'Ab_cd0f' });
            });

            it('should not parse id with asterisk, so id is left in description', () => {
                const id = `${idSymbol} A*bcd0f`;
                const taskDetails = deserialize(id);
                expect(taskDetails).toMatchTaskDetails({ description: id, id: '' });
            });
        });

        it('should parse tags', () => {
            const description = ' #hello #world #task';
            const taskDetails = deserialize(description);
            expect(taskDetails).toMatchTaskDetails({ tags: ['#hello', '#world', '#task'], description });
        });
    });

    describe('serialize', () => {
        it('should serialize an "Empty" Task as the empty string', () => {
            const serialized = serialize(new TaskBuilder().description('').build());
            expect(serialized).toEqual('');
        });

        it.each([
            { what: 'startDate', symbol: startDateSymbol },
            { what: 'createdDate', symbol: createdDateSymbol },
            { what: 'scheduledDate', symbol: scheduledDateSymbol },
            { what: 'dueDate', symbol: dueDateSymbol },
            { what: 'doneDate', symbol: doneDateSymbol },
        ] as const)('should serialize a $what', ({ what, symbol }) => {
            const serialized = serialize(new TaskBuilder()[what]('2021-06-20').description('').build());
            expect(serialized).toEqual(` ${symbol} 2021-06-20`);
        });

        it('should serialize a Highest, High, Medium, Low and Lowest priority', () => {
            const priorities = ['Highest', 'High', 'Medium', 'Low', 'Lowest'] as const;
            for (const p of priorities) {
                const task = new TaskBuilder().priority(Priority[p]).description('').build();
                const serialized = serialize(task);
                expect(serialized).toEqual(` ${symbols.prioritySymbols[p]}`);
            }
        });

        it('should serialize a None priority', () => {
            const task = new TaskBuilder().priority(Priority.None).description('').build();
            const serialized = serialize(task);
            expect(serialized).toEqual('');
        });

        it('should serialize a recurrence', () => {
            const task = new TaskBuilder()
                .recurrence(new RecurrenceBuilder().rule('every day').build())
                .description('')
                .build();
            const serialized = serialize(task);
            expect(serialized).toEqual(` ${recurrenceSymbol} every day`);
        });

        it('should serialize onCompletion', () => {
            const task = new TaskBuilder().onCompletion(OnCompletion.Delete).description('').build();
            const serialized = serialize(task);
            expect(serialized).toEqual(` ${onCompletionSymbol} delete`);
        });

        it('should serialize depends on', () => {
            const task = new TaskBuilder().description('').dependsOn(['123456', 'abc123']).build();
            const serialized = serialize(task);
            expect(serialized).toEqual(` ${dependsOnSymbol} 123456,abc123`);
        });

        it('should serialize id', () => {
            const task = new TaskBuilder().description('').id('abcdef').build();
            const serialized = serialize(task);
            expect(serialized).toEqual(` ${idSymbol} abcdef`);
        });

        it('should serialize tags', () => {
            const task = new TaskBuilder().description('').tags(['#hello', '#world', '#task']).build();
            const serialized = serialize(task);
            expect(serialized).toEqual(' #hello #world #task');
        });
    });
});

describe('diagnostics', () => {
    it('should return diagnostic - for simple task line', () => {
        const taskSerializer = new DefaultTaskSerializer(DEFAULT_SYMBOLS);
        const result = taskSerializer.deserialize('Stuff 🔁 every week ➕ 2025-08-10 ⏳ 2025-08-08', true);
        expect(result.diagnostics).toMatchInlineSnapshot(`
            [
              {
                "extracted": undefined,
                "fieldName": "priority",
                "input": "Stuff 🔁 every week ➕ 2025-08-10 ⏳ 2025-08-08",
                "matched": false,
                "regex": "(🔺|⏫|🔼|🔽|⏬)️?$",
                "remaining": undefined,
                "step": 0,
              },
              {
                "extracted": undefined,
                "fieldName": "doneDate",
                "input": "Stuff 🔁 every week ➕ 2025-08-10 ⏳ 2025-08-08",
                "matched": false,
                "regex": "✅️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 1,
              },
              {
                "extracted": undefined,
                "fieldName": "cancelledDate",
                "input": "Stuff 🔁 every week ➕ 2025-08-10 ⏳ 2025-08-08",
                "matched": false,
                "regex": "❌️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 2,
              },
              {
                "extracted": undefined,
                "fieldName": "dueDate",
                "input": "Stuff 🔁 every week ➕ 2025-08-10 ⏳ 2025-08-08",
                "matched": false,
                "regex": "(?:📅|📆|🗓)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 3,
              },
              {
                "extracted": "⏳ 2025-08-08",
                "fieldName": "scheduledDate",
                "input": "Stuff 🔁 every week ➕ 2025-08-10 ⏳ 2025-08-08",
                "matched": true,
                "regex": "(?:⏳|⌛)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": "Stuff 🔁 every week ➕ 2025-08-10",
                "step": 4,
              },
              {
                "extracted": undefined,
                "fieldName": "startDate",
                "input": "Stuff 🔁 every week ➕ 2025-08-10",
                "matched": false,
                "regex": "🛫️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 5,
              },
              {
                "extracted": "➕ 2025-08-10",
                "fieldName": "createdDate",
                "input": "Stuff 🔁 every week ➕ 2025-08-10",
                "matched": true,
                "regex": "➕️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": "Stuff 🔁 every week",
                "step": 6,
              },
              {
                "extracted": "🔁 every week",
                "fieldName": "recurrence",
                "input": "Stuff 🔁 every week",
                "matched": true,
                "regex": "🔁️? *([a-zA-Z0-9, !]+)$",
                "remaining": "Stuff",
                "step": 7,
              },
              {
                "extracted": undefined,
                "fieldName": "onCompletion",
                "input": "Stuff",
                "matched": false,
                "regex": "🏁️? *([a-zA-Z]+)$",
                "remaining": undefined,
                "step": 8,
              },
              {
                "extracted": undefined,
                "fieldName": "tags",
                "input": "Stuff",
                "matched": false,
                "regex": "(^|\\s)#[^ !@#$%^&*(),.?":{}|<>]+$",
                "remaining": undefined,
                "step": 9,
              },
              {
                "extracted": undefined,
                "fieldName": "id",
                "input": "Stuff",
                "matched": false,
                "regex": "🆔️? *([a-zA-Z0-9-_]+)$",
                "remaining": undefined,
                "step": 10,
              },
              {
                "extracted": undefined,
                "fieldName": "dependsOn",
                "input": "Stuff",
                "matched": false,
                "regex": "⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$",
                "remaining": undefined,
                "step": 11,
              },
              {
                "extracted": undefined,
                "fieldName": "priority",
                "input": "Stuff",
                "matched": false,
                "regex": "(🔺|⏫|🔼|🔽|⏬)️?$",
                "remaining": undefined,
                "step": 12,
              },
              {
                "extracted": undefined,
                "fieldName": "doneDate",
                "input": "Stuff",
                "matched": false,
                "regex": "✅️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 13,
              },
              {
                "extracted": undefined,
                "fieldName": "cancelledDate",
                "input": "Stuff",
                "matched": false,
                "regex": "❌️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 14,
              },
              {
                "extracted": undefined,
                "fieldName": "dueDate",
                "input": "Stuff",
                "matched": false,
                "regex": "(?:📅|📆|🗓)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 15,
              },
              {
                "extracted": undefined,
                "fieldName": "scheduledDate",
                "input": "Stuff",
                "matched": false,
                "regex": "(?:⏳|⌛)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 16,
              },
              {
                "extracted": undefined,
                "fieldName": "startDate",
                "input": "Stuff",
                "matched": false,
                "regex": "🛫️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 17,
              },
              {
                "extracted": undefined,
                "fieldName": "createdDate",
                "input": "Stuff",
                "matched": false,
                "regex": "➕️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 18,
              },
              {
                "extracted": undefined,
                "fieldName": "recurrence",
                "input": "Stuff",
                "matched": false,
                "regex": "🔁️? *([a-zA-Z0-9, !]+)$",
                "remaining": undefined,
                "step": 19,
              },
              {
                "extracted": undefined,
                "fieldName": "onCompletion",
                "input": "Stuff",
                "matched": false,
                "regex": "🏁️? *([a-zA-Z]+)$",
                "remaining": undefined,
                "step": 20,
              },
              {
                "extracted": undefined,
                "fieldName": "tags",
                "input": "Stuff",
                "matched": false,
                "regex": "(^|\\s)#[^ !@#$%^&*(),.?":{}|<>]+$",
                "remaining": undefined,
                "step": 21,
              },
              {
                "extracted": undefined,
                "fieldName": "id",
                "input": "Stuff",
                "matched": false,
                "regex": "🆔️? *([a-zA-Z0-9-_]+)$",
                "remaining": undefined,
                "step": 22,
              },
              {
                "extracted": undefined,
                "fieldName": "dependsOn",
                "input": "Stuff",
                "matched": false,
                "regex": "⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$",
                "remaining": undefined,
                "step": 23,
              },
            ]
        `);
    });

    it('should return diagnostic - for fully populated task lin', () => {
        const taskSerializer = new DefaultTaskSerializer(DEFAULT_SYMBOLS);
        const line = TaskBuilder.createFullyPopulatedTask().originalMarkdown;
        const lineWithoutAnchor = line.replace(' ^dcf64c', '');
        expect(lineWithoutAnchor).toMatchInlineSnapshot(
            '"  - [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05"',
        );

        const result = taskSerializer.deserialize(lineWithoutAnchor, true);
        expect(result.description).toMatchInlineSnapshot('"- [ ] Do exercises #todo #health"');

        expect(result.diagnostics).toMatchInlineSnapshot(`
            [
              {
                "extracted": undefined,
                "fieldName": "priority",
                "input": "  - [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05",
                "matched": false,
                "regex": "(🔺|⏫|🔼|🔽|⏬)️?$",
                "remaining": undefined,
                "step": 0,
              },
              {
                "extracted": "✅ 2023-07-05",
                "fieldName": "doneDate",
                "input": "  - [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05",
                "matched": true,
                "regex": "✅️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06",
                "step": 1,
              },
              {
                "extracted": "❌ 2023-07-06",
                "fieldName": "cancelledDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06",
                "matched": true,
                "regex": "❌️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04",
                "step": 2,
              },
              {
                "extracted": "📅 2023-07-04",
                "fieldName": "dueDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04",
                "matched": true,
                "regex": "(?:📅|📆|🗓)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03",
                "step": 3,
              },
              {
                "extracted": "⏳ 2023-07-03",
                "fieldName": "scheduledDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03",
                "matched": true,
                "regex": "(?:⏳|⌛)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02",
                "step": 4,
              },
              {
                "extracted": "🛫 2023-07-02",
                "fieldName": "startDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02",
                "matched": true,
                "regex": "🛫️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01",
                "step": 5,
              },
              {
                "extracted": "➕ 2023-07-01",
                "fieldName": "createdDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01",
                "matched": true,
                "regex": "➕️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete",
                "step": 6,
              },
              {
                "extracted": undefined,
                "fieldName": "recurrence",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete",
                "matched": false,
                "regex": "🔁️? *([a-zA-Z0-9, !]+)$",
                "remaining": undefined,
                "step": 7,
              },
              {
                "extracted": "🏁 delete",
                "fieldName": "onCompletion",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete",
                "matched": true,
                "regex": "🏁️? *([a-zA-Z]+)$",
                "remaining": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done",
                "step": 8,
              },
              {
                "extracted": undefined,
                "fieldName": "tags",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done",
                "matched": false,
                "regex": "(^|\\s)#[^ !@#$%^&*(),.?":{}|<>]+$",
                "remaining": undefined,
                "step": 9,
              },
              {
                "extracted": undefined,
                "fieldName": "id",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done",
                "matched": false,
                "regex": "🆔️? *([a-zA-Z0-9-_]+)$",
                "remaining": undefined,
                "step": 10,
              },
              {
                "extracted": undefined,
                "fieldName": "dependsOn",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done",
                "matched": false,
                "regex": "⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$",
                "remaining": undefined,
                "step": 11,
              },
              {
                "extracted": undefined,
                "fieldName": "priority",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done",
                "matched": false,
                "regex": "(🔺|⏫|🔼|🔽|⏬)️?$",
                "remaining": undefined,
                "step": 12,
              },
              {
                "extracted": undefined,
                "fieldName": "doneDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done",
                "matched": false,
                "regex": "✅️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 13,
              },
              {
                "extracted": undefined,
                "fieldName": "cancelledDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done",
                "matched": false,
                "regex": "❌️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 14,
              },
              {
                "extracted": undefined,
                "fieldName": "dueDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done",
                "matched": false,
                "regex": "(?:📅|📆|🗓)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 15,
              },
              {
                "extracted": undefined,
                "fieldName": "scheduledDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done",
                "matched": false,
                "regex": "(?:⏳|⌛)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 16,
              },
              {
                "extracted": undefined,
                "fieldName": "startDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done",
                "matched": false,
                "regex": "🛫️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 17,
              },
              {
                "extracted": undefined,
                "fieldName": "createdDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done",
                "matched": false,
                "regex": "➕️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 18,
              },
              {
                "extracted": "🔁 every day when done",
                "fieldName": "recurrence",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done",
                "matched": true,
                "regex": "🔁️? *([a-zA-Z0-9, !]+)$",
                "remaining": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼",
                "step": 19,
              },
              {
                "extracted": undefined,
                "fieldName": "onCompletion",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼",
                "matched": false,
                "regex": "🏁️? *([a-zA-Z]+)$",
                "remaining": undefined,
                "step": 20,
              },
              {
                "extracted": undefined,
                "fieldName": "tags",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼",
                "matched": false,
                "regex": "(^|\\s)#[^ !@#$%^&*(),.?":{}|<>]+$",
                "remaining": undefined,
                "step": 21,
              },
              {
                "extracted": undefined,
                "fieldName": "id",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼",
                "matched": false,
                "regex": "🆔️? *([a-zA-Z0-9-_]+)$",
                "remaining": undefined,
                "step": 22,
              },
              {
                "extracted": undefined,
                "fieldName": "dependsOn",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼",
                "matched": false,
                "regex": "⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$",
                "remaining": undefined,
                "step": 23,
              },
              {
                "extracted": "🔼",
                "fieldName": "priority",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼",
                "matched": true,
                "regex": "(🔺|⏫|🔼|🔽|⏬)️?$",
                "remaining": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123",
                "step": 24,
              },
              {
                "extracted": undefined,
                "fieldName": "doneDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123",
                "matched": false,
                "regex": "✅️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 25,
              },
              {
                "extracted": undefined,
                "fieldName": "cancelledDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123",
                "matched": false,
                "regex": "❌️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 26,
              },
              {
                "extracted": undefined,
                "fieldName": "dueDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123",
                "matched": false,
                "regex": "(?:📅|📆|🗓)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 27,
              },
              {
                "extracted": undefined,
                "fieldName": "scheduledDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123",
                "matched": false,
                "regex": "(?:⏳|⌛)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 28,
              },
              {
                "extracted": undefined,
                "fieldName": "startDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123",
                "matched": false,
                "regex": "🛫️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 29,
              },
              {
                "extracted": undefined,
                "fieldName": "createdDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123",
                "matched": false,
                "regex": "➕️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 30,
              },
              {
                "extracted": undefined,
                "fieldName": "recurrence",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123",
                "matched": false,
                "regex": "🔁️? *([a-zA-Z0-9, !]+)$",
                "remaining": undefined,
                "step": 31,
              },
              {
                "extracted": undefined,
                "fieldName": "onCompletion",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123",
                "matched": false,
                "regex": "🏁️? *([a-zA-Z]+)$",
                "remaining": undefined,
                "step": 32,
              },
              {
                "extracted": undefined,
                "fieldName": "tags",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123",
                "matched": false,
                "regex": "(^|\\s)#[^ !@#$%^&*(),.?":{}|<>]+$",
                "remaining": undefined,
                "step": 33,
              },
              {
                "extracted": undefined,
                "fieldName": "id",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123",
                "matched": false,
                "regex": "🆔️? *([a-zA-Z0-9-_]+)$",
                "remaining": undefined,
                "step": 34,
              },
              {
                "extracted": "⛔ 123456,abc123",
                "fieldName": "dependsOn",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123",
                "matched": true,
                "regex": "⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$",
                "remaining": "- [ ] Do exercises #todo #health 🆔 abcdef",
                "step": 35,
              },
              {
                "extracted": undefined,
                "fieldName": "priority",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef",
                "matched": false,
                "regex": "(🔺|⏫|🔼|🔽|⏬)️?$",
                "remaining": undefined,
                "step": 36,
              },
              {
                "extracted": undefined,
                "fieldName": "doneDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef",
                "matched": false,
                "regex": "✅️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 37,
              },
              {
                "extracted": undefined,
                "fieldName": "cancelledDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef",
                "matched": false,
                "regex": "❌️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 38,
              },
              {
                "extracted": undefined,
                "fieldName": "dueDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef",
                "matched": false,
                "regex": "(?:📅|📆|🗓)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 39,
              },
              {
                "extracted": undefined,
                "fieldName": "scheduledDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef",
                "matched": false,
                "regex": "(?:⏳|⌛)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 40,
              },
              {
                "extracted": undefined,
                "fieldName": "startDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef",
                "matched": false,
                "regex": "🛫️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 41,
              },
              {
                "extracted": undefined,
                "fieldName": "createdDate",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef",
                "matched": false,
                "regex": "➕️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 42,
              },
              {
                "extracted": undefined,
                "fieldName": "recurrence",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef",
                "matched": false,
                "regex": "🔁️? *([a-zA-Z0-9, !]+)$",
                "remaining": undefined,
                "step": 43,
              },
              {
                "extracted": undefined,
                "fieldName": "onCompletion",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef",
                "matched": false,
                "regex": "🏁️? *([a-zA-Z]+)$",
                "remaining": undefined,
                "step": 44,
              },
              {
                "extracted": undefined,
                "fieldName": "tags",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef",
                "matched": false,
                "regex": "(^|\\s)#[^ !@#$%^&*(),.?":{}|<>]+$",
                "remaining": undefined,
                "step": 45,
              },
              {
                "extracted": "🆔 abcdef",
                "fieldName": "id",
                "input": "- [ ] Do exercises #todo #health 🆔 abcdef",
                "matched": true,
                "regex": "🆔️? *([a-zA-Z0-9-_]+)$",
                "remaining": "- [ ] Do exercises #todo #health",
                "step": 46,
              },
              {
                "extracted": undefined,
                "fieldName": "dependsOn",
                "input": "- [ ] Do exercises #todo #health",
                "matched": false,
                "regex": "⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$",
                "remaining": undefined,
                "step": 47,
              },
              {
                "extracted": undefined,
                "fieldName": "priority",
                "input": "- [ ] Do exercises #todo #health",
                "matched": false,
                "regex": "(🔺|⏫|🔼|🔽|⏬)️?$",
                "remaining": undefined,
                "step": 48,
              },
              {
                "extracted": undefined,
                "fieldName": "doneDate",
                "input": "- [ ] Do exercises #todo #health",
                "matched": false,
                "regex": "✅️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 49,
              },
              {
                "extracted": undefined,
                "fieldName": "cancelledDate",
                "input": "- [ ] Do exercises #todo #health",
                "matched": false,
                "regex": "❌️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 50,
              },
              {
                "extracted": undefined,
                "fieldName": "dueDate",
                "input": "- [ ] Do exercises #todo #health",
                "matched": false,
                "regex": "(?:📅|📆|🗓)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 51,
              },
              {
                "extracted": undefined,
                "fieldName": "scheduledDate",
                "input": "- [ ] Do exercises #todo #health",
                "matched": false,
                "regex": "(?:⏳|⌛)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 52,
              },
              {
                "extracted": undefined,
                "fieldName": "startDate",
                "input": "- [ ] Do exercises #todo #health",
                "matched": false,
                "regex": "🛫️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 53,
              },
              {
                "extracted": undefined,
                "fieldName": "createdDate",
                "input": "- [ ] Do exercises #todo #health",
                "matched": false,
                "regex": "➕️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 54,
              },
              {
                "extracted": undefined,
                "fieldName": "recurrence",
                "input": "- [ ] Do exercises #todo #health",
                "matched": false,
                "regex": "🔁️? *([a-zA-Z0-9, !]+)$",
                "remaining": undefined,
                "step": 55,
              },
              {
                "extracted": undefined,
                "fieldName": "onCompletion",
                "input": "- [ ] Do exercises #todo #health",
                "matched": false,
                "regex": "🏁️? *([a-zA-Z]+)$",
                "remaining": undefined,
                "step": 56,
              },
              {
                "extracted": " #health",
                "fieldName": "tags",
                "input": "- [ ] Do exercises #todo #health",
                "matched": true,
                "regex": "(^|\\s)#[^ !@#$%^&*(),.?":{}|<>]+$",
                "remaining": "- [ ] Do exercises #todo",
                "step": 57,
              },
              {
                "extracted": undefined,
                "fieldName": "id",
                "input": "- [ ] Do exercises #todo",
                "matched": false,
                "regex": "🆔️? *([a-zA-Z0-9-_]+)$",
                "remaining": undefined,
                "step": 58,
              },
              {
                "extracted": undefined,
                "fieldName": "dependsOn",
                "input": "- [ ] Do exercises #todo",
                "matched": false,
                "regex": "⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$",
                "remaining": undefined,
                "step": 59,
              },
              {
                "extracted": undefined,
                "fieldName": "priority",
                "input": "- [ ] Do exercises #todo",
                "matched": false,
                "regex": "(🔺|⏫|🔼|🔽|⏬)️?$",
                "remaining": undefined,
                "step": 60,
              },
              {
                "extracted": undefined,
                "fieldName": "doneDate",
                "input": "- [ ] Do exercises #todo",
                "matched": false,
                "regex": "✅️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 61,
              },
              {
                "extracted": undefined,
                "fieldName": "cancelledDate",
                "input": "- [ ] Do exercises #todo",
                "matched": false,
                "regex": "❌️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 62,
              },
              {
                "extracted": undefined,
                "fieldName": "dueDate",
                "input": "- [ ] Do exercises #todo",
                "matched": false,
                "regex": "(?:📅|📆|🗓)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 63,
              },
              {
                "extracted": undefined,
                "fieldName": "scheduledDate",
                "input": "- [ ] Do exercises #todo",
                "matched": false,
                "regex": "(?:⏳|⌛)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 64,
              },
              {
                "extracted": undefined,
                "fieldName": "startDate",
                "input": "- [ ] Do exercises #todo",
                "matched": false,
                "regex": "🛫️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 65,
              },
              {
                "extracted": undefined,
                "fieldName": "createdDate",
                "input": "- [ ] Do exercises #todo",
                "matched": false,
                "regex": "➕️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 66,
              },
              {
                "extracted": undefined,
                "fieldName": "recurrence",
                "input": "- [ ] Do exercises #todo",
                "matched": false,
                "regex": "🔁️? *([a-zA-Z0-9, !]+)$",
                "remaining": undefined,
                "step": 67,
              },
              {
                "extracted": undefined,
                "fieldName": "onCompletion",
                "input": "- [ ] Do exercises #todo",
                "matched": false,
                "regex": "🏁️? *([a-zA-Z]+)$",
                "remaining": undefined,
                "step": 68,
              },
              {
                "extracted": " #todo",
                "fieldName": "tags",
                "input": "- [ ] Do exercises #todo",
                "matched": true,
                "regex": "(^|\\s)#[^ !@#$%^&*(),.?":{}|<>]+$",
                "remaining": "- [ ] Do exercises",
                "step": 69,
              },
              {
                "extracted": undefined,
                "fieldName": "id",
                "input": "- [ ] Do exercises",
                "matched": false,
                "regex": "🆔️? *([a-zA-Z0-9-_]+)$",
                "remaining": undefined,
                "step": 70,
              },
              {
                "extracted": undefined,
                "fieldName": "dependsOn",
                "input": "- [ ] Do exercises",
                "matched": false,
                "regex": "⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$",
                "remaining": undefined,
                "step": 71,
              },
              {
                "extracted": undefined,
                "fieldName": "priority",
                "input": "- [ ] Do exercises",
                "matched": false,
                "regex": "(🔺|⏫|🔼|🔽|⏬)️?$",
                "remaining": undefined,
                "step": 72,
              },
              {
                "extracted": undefined,
                "fieldName": "doneDate",
                "input": "- [ ] Do exercises",
                "matched": false,
                "regex": "✅️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 73,
              },
              {
                "extracted": undefined,
                "fieldName": "cancelledDate",
                "input": "- [ ] Do exercises",
                "matched": false,
                "regex": "❌️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 74,
              },
              {
                "extracted": undefined,
                "fieldName": "dueDate",
                "input": "- [ ] Do exercises",
                "matched": false,
                "regex": "(?:📅|📆|🗓)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 75,
              },
              {
                "extracted": undefined,
                "fieldName": "scheduledDate",
                "input": "- [ ] Do exercises",
                "matched": false,
                "regex": "(?:⏳|⌛)️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 76,
              },
              {
                "extracted": undefined,
                "fieldName": "startDate",
                "input": "- [ ] Do exercises",
                "matched": false,
                "regex": "🛫️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 77,
              },
              {
                "extracted": undefined,
                "fieldName": "createdDate",
                "input": "- [ ] Do exercises",
                "matched": false,
                "regex": "➕️? *(\\d{4}-\\d{2}-\\d{2})$",
                "remaining": undefined,
                "step": 78,
              },
              {
                "extracted": undefined,
                "fieldName": "recurrence",
                "input": "- [ ] Do exercises",
                "matched": false,
                "regex": "🔁️? *([a-zA-Z0-9, !]+)$",
                "remaining": undefined,
                "step": 79,
              },
              {
                "extracted": undefined,
                "fieldName": "onCompletion",
                "input": "- [ ] Do exercises",
                "matched": false,
                "regex": "🏁️? *([a-zA-Z]+)$",
                "remaining": undefined,
                "step": 80,
              },
              {
                "extracted": undefined,
                "fieldName": "tags",
                "input": "- [ ] Do exercises",
                "matched": false,
                "regex": "(^|\\s)#[^ !@#$%^&*(),.?":{}|<>]+$",
                "remaining": undefined,
                "step": 81,
              },
              {
                "extracted": undefined,
                "fieldName": "id",
                "input": "- [ ] Do exercises",
                "matched": false,
                "regex": "🆔️? *([a-zA-Z0-9-_]+)$",
                "remaining": undefined,
                "step": 82,
              },
              {
                "extracted": undefined,
                "fieldName": "dependsOn",
                "input": "- [ ] Do exercises",
                "matched": false,
                "regex": "⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$",
                "remaining": undefined,
                "step": 83,
              },
            ]
        `);
    });
});
