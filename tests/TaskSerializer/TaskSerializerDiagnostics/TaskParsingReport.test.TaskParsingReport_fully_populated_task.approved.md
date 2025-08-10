## 🔍 Task Parser Diagnostic Report

### Platform
- **iOS/iPad**: No
- **Platform**: 
- **Touch Points**: undefined
- **Safari**: N/A
- **Time**: 2025-08-10T18:37:24.555Z
- **User Agent**: `Mozilla/5.0 (darwin) AppleWebKit/537.36 (KHTML, li...`

### Minimal Regex Tests

Testing regex patterns with and without $ anchor:

| Test | Input | Pattern (no $) | Match | Pattern (with $) | Match |
|------|-------|----------------|-------|------------------|-------|
| Simple emoji at end | `🔺` | `🔺` | ✅ | `🔺$` | ✅ |
| Emoji with space | `🔺 ` | `🔺 ` | ✅ | `🔺 $` | ✅ |
| Two emojis | `🔺⏳` | `🔺⏳` | ✅ | `🔺⏳$` | ✅ |
| Two emojis with space | `🔺 ⏳` | `🔺 ⏳` | ✅ | `🔺 ⏳$` | ✅ |
| Two emojis with two spaces | `🔺  ⏳` | `🔺  ⏳` | ✅ | `🔺  ⏳$` | ✅ |
| Hourglass with date | `⏳ 2025-08-09` | `⏳ \d{4}-\d{2}-\d{2}` | ✅ | `⏳ \d{4}-\d{2}-\d{2}$` | ✅ |
| Hourglass no space date | `⏳2025-08-09` | `⏳\d{4}-\d{2}-\d{2}` | ✅ | `⏳\d{4}-\d{2}-\d{2}$` | ✅ |
| Triangle space hourglass date | `🔺 ⏳ 2025-08-09` | `⏳ \d{4}-\d{2}-\d{2}` | ✅ | `⏳ \d{4}-\d{2}-\d{2}$` | ✅ |
| Triangle no space hourglass date | `🔺⏳ 2025-08-09` | `⏳ \d{4}-\d{2}-\d{2}` | ✅ | `⏳ \d{4}-\d{2}-\d{2}$` | ✅ |
| Just triangle | `🔺` | `[🔺⏫🔼🔽⏬]` | ✅ | `[🔺⏫🔼🔽⏬]$` | ✅ |
| Triangle in brackets | `🔺` | `([🔺⏫🔼🔽⏬])` | ✅ | `([🔺⏫🔼🔽⏬])$` | ✅ |
| Triangle with variant selector | `🔺` | `[🔺⏫🔼🔽⏬]\uFE0F?` | ✅ | `[🔺⏫🔼🔽⏬]\uFE0F?$` | ✅ |
| After replace: triangle then hourglass | `🔺 ⏳ 2025-08-09` | `⏳ \d{4}-\d{2}-\d{2}` | ✅ | `⏳ \d{4}-\d{2}-\d{2}$` | ✅ |
| After trim: triangle then hourglass | `🔺 ⏳ 2025-08-09` | `⏳ \d{4}-\d{2}-\d{2}` | ✅ | `⏳ \d{4}-\d{2}-\d{2}$` | ✅ |
| After substring: just hourglass part | `⏳ 2025-08-09` | `⏳ \d{4}-\d{2}-\d{2}` | ✅ | `⏳ \d{4}-\d{2}-\d{2}$` | ✅ |
| Step 1: Schedule match at end | `Highest 🔺 ⏳ 2025-08-09` | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ |
| Step 2: After removing schedule | `Highest 🔺` | `[🔺⏫🔼🔽⏬]\uFE0F?` | ✅ | `[🔺⏫🔼🔽⏬]\uFE0F?$` | ✅ |
| Step 2b: After trim | `Highest 🔺` | `[🔺⏫🔼🔽⏬]\uFE0F?` | ✅ | `[🔺⏫🔼🔽⏬]\uFE0F?$` | ✅ |
| Medium priority | `🔼` | `[🔺⏫🔼🔽⏬]\uFE0F?` | ✅ | `[🔺⏫🔼🔽⏬]\uFE0F?$` | ✅ |
| Low priority | `🔽` | `[🔺⏫🔼🔽⏬]\uFE0F?` | ✅ | `[🔺⏫🔼🔽⏬]\uFE0F?$` | ✅ |
| After triangle space | ` ⏳ 2025-08-09` | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ |
| Regular text | `test` | `test` | ✅ | `test$` | ✅ |
| Text with number | `test123` | `test\d+` | ✅ | `test\d+$` | ✅ |
| Date alone | `2025-08-09` | `\d{4}-\d{2}-\d{2}` | ✅ | `\d{4}-\d{2}-\d{2}$` | ✅ |
| NFC: Step 1: Schedule match at end | `Highest 🔺 ⏳ 2025-08-09` | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ |
| NFD: Step 1: Schedule match at end | `Highest 🔺 ⏳ 2025-08-09` | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ |
| NFKC: Step 1: Schedule match at end | `Highest 🔺 ⏳ 2025-08-09` | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ |
| NFKD: Step 1: Schedule match at end | `Highest 🔺 ⏳ 2025-08-09` | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ |
| NFC: Triangle space hourglass | `🔺 ⏳` | `⏳` | ✅ | `⏳$` | ✅ |
| NFD: Triangle space hourglass | `🔺 ⏳` | `⏳` | ✅ | `⏳$` | ✅ |
| Pattern normalized: Schedule match | `Highest 🔺 ⏳ 2025-08-09` | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ |

### Task 1
```text
  - [ ] Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05
```

**Parsed**: ✅ Yes | **Fields Found**: 12

#### Task 1: Character Analysis (Task Body)

| Index | Char | Unicode | Hex | Description |
|-------|------|---------|-----|-------------|
| 0 | D | U+0044 | 0044 |  |
| 1 | o | U+006F | 006F |  |
| 2 | (space) | U+0020 | 0020 | Space |
| 3 | e | U+0065 | 0065 |  |
| 4 | x | U+0078 | 0078 |  |
| 5 | e | U+0065 | 0065 |  |
| 6 | r | U+0072 | 0072 |  |
| 7 | c | U+0063 | 0063 |  |
| 8 | i | U+0069 | 0069 |  |
| 9 | s | U+0073 | 0073 |  |
| 10 | e | U+0065 | 0065 |  |
| 11 | s | U+0073 | 0073 |  |
| 12 | (space) | U+0020 | 0020 | Space |
| 13 | # | U+0023 | 0023 |  |
| 14 | t | U+0074 | 0074 |  |
| 15 | o | U+006F | 006F |  |
| 16 | d | U+0064 | 0064 |  |
| 17 | o | U+006F | 006F |  |
| 18 | (space) | U+0020 | 0020 | Space |
| 19 | # | U+0023 | 0023 |  |
| 20 | h | U+0068 | 0068 |  |
| 21 | e | U+0065 | 0065 |  |
| 22 | a | U+0061 | 0061 |  |
| 23 | l | U+006C | 006C |  |
| 24 | t | U+0074 | 0074 |  |
| 25 | h | U+0068 | 0068 |  |
| 26 | (space) | U+0020 | 0020 | Space |
| 27 | 🆔 | U+1F194 | 1F194 |  |
| 28 | (space) | U+0020 | 0020 | Space |
| 29 | a | U+0061 | 0061 |  |
| 30 | b | U+0062 | 0062 |  |
| 31 | c | U+0063 | 0063 |  |
| 32 | d | U+0064 | 0064 |  |
| 33 | e | U+0065 | 0065 |  |
| 34 | f | U+0066 | 0066 |  |
| 35 | (space) | U+0020 | 0020 | Space |
| 36 | ⛔ | U+26D4 | 26D4 |  |
| 37 | (space) | U+0020 | 0020 | Space |
| 38 | 1 | U+0031 | 0031 |  |
| 39 | 2 | U+0032 | 0032 |  |
| 40 | 3 | U+0033 | 0033 |  |
| 41 | 4 | U+0034 | 0034 |  |
| 42 | 5 | U+0035 | 0035 |  |
| 43 | 6 | U+0036 | 0036 |  |
| 44 | , | U+002C | 002C |  |
| 45 | a | U+0061 | 0061 |  |
| 46 | b | U+0062 | 0062 |  |
| 47 | c | U+0063 | 0063 |  |
| 48 | 1 | U+0031 | 0031 |  |
| 49 | 2 | U+0032 | 0032 |  |
| 50 | 3 | U+0033 | 0033 |  |
| 51 | (space) | U+0020 | 0020 | Space |
| 52 | 🔼 | U+1F53C | 1F53C | Emoji |
| 53 | (space) | U+0020 | 0020 | Space |
| 54 | 🔁 | U+1F501 | 1F501 | Emoji |
| 55 | (space) | U+0020 | 0020 | Space |
| 56 | e | U+0065 | 0065 |  |
| 57 | v | U+0076 | 0076 |  |
| 58 | e | U+0065 | 0065 |  |
| 59 | r | U+0072 | 0072 |  |
| 60 | y | U+0079 | 0079 |  |
| 61 | (space) | U+0020 | 0020 | Space |
| 62 | d | U+0064 | 0064 |  |
| 63 | a | U+0061 | 0061 |  |
| 64 | y | U+0079 | 0079 |  |
| 65 | (space) | U+0020 | 0020 | Space |
| 66 | w | U+0077 | 0077 |  |
| 67 | h | U+0068 | 0068 |  |
| 68 | e | U+0065 | 0065 |  |
| 69 | n | U+006E | 006E |  |
| 70 | (space) | U+0020 | 0020 | Space |
| 71 | d | U+0064 | 0064 |  |
| 72 | o | U+006F | 006F |  |
| 73 | n | U+006E | 006E |  |
| 74 | e | U+0065 | 0065 |  |
| 75 | (space) | U+0020 | 0020 | Space |
| 76 | 🏁 | U+1F3C1 | 1F3C1 | Emoji |
| 77 | (space) | U+0020 | 0020 | Space |
| 78 | d | U+0064 | 0064 |  |
| 79 | e | U+0065 | 0065 |  |
| 80 | l | U+006C | 006C |  |
| 81 | e | U+0065 | 0065 |  |
| 82 | t | U+0074 | 0074 |  |
| 83 | e | U+0065 | 0065 |  |
| 84 | (space) | U+0020 | 0020 | Space |
| 85 | ➕ | U+2795 | 2795 |  |
| 86 | (space) | U+0020 | 0020 | Space |
| 87 | 2 | U+0032 | 0032 |  |
| 88 | 0 | U+0030 | 0030 |  |
| 89 | 2 | U+0032 | 0032 |  |
| 90 | 3 | U+0033 | 0033 |  |
| 91 | - | U+002D | 002D |  |
| 92 | 0 | U+0030 | 0030 |  |
| 93 | 7 | U+0037 | 0037 |  |
| 94 | - | U+002D | 002D |  |
| 95 | 0 | U+0030 | 0030 |  |
| 96 | 1 | U+0031 | 0031 |  |
| 97 | (space) | U+0020 | 0020 | Space |
| 98 | 🛫 | U+1F6EB | 1F6EB | Emoji |
| 99 | (space) | U+0020 | 0020 | Space |
| 100 | 2 | U+0032 | 0032 |  |
| 101 | 0 | U+0030 | 0030 |  |
| 102 | 2 | U+0032 | 0032 |  |
| 103 | 3 | U+0033 | 0033 |  |
| 104 | - | U+002D | 002D |  |
| 105 | 0 | U+0030 | 0030 |  |
| 106 | 7 | U+0037 | 0037 |  |
| 107 | - | U+002D | 002D |  |
| 108 | 0 | U+0030 | 0030 |  |
| 109 | 2 | U+0032 | 0032 |  |
| 110 | (space) | U+0020 | 0020 | Space |
| 111 | ⏳ | U+23F3 | 23F3 |  |
| 112 | (space) | U+0020 | 0020 | Space |
| 113 | 2 | U+0032 | 0032 |  |
| 114 | 0 | U+0030 | 0030 |  |
| 115 | 2 | U+0032 | 0032 |  |
| 116 | 3 | U+0033 | 0033 |  |
| 117 | - | U+002D | 002D |  |
| 118 | 0 | U+0030 | 0030 |  |
| 119 | 7 | U+0037 | 0037 |  |
| 120 | - | U+002D | 002D |  |
| 121 | 0 | U+0030 | 0030 |  |
| 122 | 3 | U+0033 | 0033 |  |
| 123 | (space) | U+0020 | 0020 | Space |
| 124 | 📅 | U+1F4C5 | 1F4C5 | Emoji |
| 125 | (space) | U+0020 | 0020 | Space |
| 126 | 2 | U+0032 | 0032 |  |
| 127 | 0 | U+0030 | 0030 |  |
| 128 | 2 | U+0032 | 0032 |  |
| 129 | 3 | U+0033 | 0033 |  |
| 130 | - | U+002D | 002D |  |
| 131 | 0 | U+0030 | 0030 |  |
| 132 | 7 | U+0037 | 0037 |  |
| 133 | - | U+002D | 002D |  |
| 134 | 0 | U+0030 | 0030 |  |
| 135 | 4 | U+0034 | 0034 |  |
| 136 | (space) | U+0020 | 0020 | Space |
| 137 | ❌ | U+274C | 274C |  |
| 138 | (space) | U+0020 | 0020 | Space |
| 139 | 2 | U+0032 | 0032 |  |
| 140 | 0 | U+0030 | 0030 |  |
| 141 | 2 | U+0032 | 0032 |  |
| 142 | 3 | U+0033 | 0033 |  |
| 143 | - | U+002D | 002D |  |
| 144 | 0 | U+0030 | 0030 |  |
| 145 | 7 | U+0037 | 0037 |  |
| 146 | - | U+002D | 002D |  |
| 147 | 0 | U+0030 | 0030 |  |
| 148 | 6 | U+0036 | 0036 |  |
| 149 | (space) | U+0020 | 0020 | Space |
| 150 | ✅ | U+2705 | 2705 |  |
| 151 | (space) | U+0020 | 0020 | Space |
| 152 | 2 | U+0032 | 0032 |  |
| 153 | 0 | U+0030 | 0030 |  |
| 154 | 2 | U+0032 | 0032 |  |
| 155 | 3 | U+0033 | 0033 |  |
| 156 | - | U+002D | 002D |  |
| 157 | 0 | U+0030 | 0030 |  |
| 158 | 7 | U+0037 | 0037 |  |
| 159 | - | U+002D | 002D |  |
| 160 | 0 | U+0030 | 0030 |  |
| 161 | 5 | U+0035 | 0035 |  |

**Hex string**: `0044 006F 0020 0065 0078 0065 0072 0063 0069 0073 0065 0073 0020 0023 0074 006F 0064 006F 0020 0023 0068 0065 0061 006C 0074 0068 0020 1F194 0020 0061 0062 0063 0064 0065 0066 0020 26D4 0020 0031 0032 0033 0034 0035 0036 002C 0061 0062 0063 0031 0032 0033 0020 1F53C 0020 1F501 0020 0065 0076 0065 0072 0079 0020 0064 0061 0079 0020 0077 0068 0065 006E 0020 0064 006F 006E 0065 0020 1F3C1 0020 0064 0065 006C 0065 0074 0065 0020 2795 0020 0032 0030 0032 0033 002D 0030 0037 002D 0030 0031 0020 1F6EB 0020 0032 0030 0032 0033 002D 0030 0037 002D 0030 0032 0020 23F3 0020 0032 0030 0032 0033 002D 0030 0037 002D 0030 0033 0020 1F4C5 0020 0032 0030 0032 0033 002D 0030 0037 002D 0030 0034 0020 274C 0020 0032 0030 0032 0033 002D 0030 0037 002D 0030 0036 0020 2705 0020 0032 0030 0032 0033 002D 0030 0037 002D 0030 0035`

#### Task 1: Parsing Steps

| Step | Field | Matched | Value | Regex | Input Before | Remaining After |
|------|-------|---------|-------|-------|--------------|-----------------|
| 0 | priority | ❌ | — | `([🔺⏫🔼🔽⏬])️?$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05` | _(empty)_ |
| 1 | doneDate | ✅ | `✅ 2023-07-05` | `✅️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06` |
| 2 | cancelledDate | ✅ | `❌ 2023-07-06` | `❌️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04` |
| 3 | dueDate | ✅ | `📅 2023-07-04` | `[📅📆🗓]️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03` |
| 4 | scheduledDate | ✅ | `⏳ 2023-07-03` | `[⏳⌛]️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02` |
| 5 | startDate | ✅ | `🛫 2023-07-02` | `🛫️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01 🛫 2023-07-02` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01` |
| 6 | createdDate | ✅ | `➕ 2023-07-01` | `➕️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete ➕ 2023-07-01` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete` |
| 7 | recurrence | ❌ | — | `🔁️? *([a-zA-Z0-9, !]+)$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete` | _(empty)_ |
| 8 | onCompletion | ✅ | `🏁 delete` | `🏁️? *([a-zA-Z]+)$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done 🏁 delete` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done` |
| 9 | tags | ❌ | — | `(^\|\s)#[^ !@#$%^&*(),.?":{}\|<>]+$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done` | _(empty)_ |
| 10 | id | ❌ | — | `🆔️? *([a-zA-Z0-9-_]+)$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done` | _(empty)_ |
| 11 | dependsOn | ❌ | — | `⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done` | _(empty)_ |
| 12 | priority | ❌ | — | `([🔺⏫🔼🔽⏬])️?$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done` | _(empty)_ |
| 13 | doneDate | ❌ | — | `✅️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done` | _(empty)_ |
| 14 | cancelledDate | ❌ | — | `❌️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done` | _(empty)_ |
| 15 | dueDate | ❌ | — | `[📅📆🗓]️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done` | _(empty)_ |
| 16 | scheduledDate | ❌ | — | `[⏳⌛]️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done` | _(empty)_ |
| 17 | startDate | ❌ | — | `🛫️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done` | _(empty)_ |
| 18 | createdDate | ❌ | — | `➕️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done` | _(empty)_ |
| 19 | recurrence | ✅ | `🔁 every day when done` | `🔁️? *([a-zA-Z0-9, !]+)$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼 🔁 every day when done` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼` |
| 20 | onCompletion | ❌ | — | `🏁️? *([a-zA-Z]+)$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼` | _(empty)_ |
| 21 | tags | ❌ | — | `(^\|\s)#[^ !@#$%^&*(),.?":{}\|<>]+$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼` | _(empty)_ |
| 22 | id | ❌ | — | `🆔️? *([a-zA-Z0-9-_]+)$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼` | _(empty)_ |
| 23 | dependsOn | ❌ | — | `⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼` | _(empty)_ |
| 24 | priority | ✅ | `🔼` | `([🔺⏫🔼🔽⏬])️?$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123 🔼` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123` |
| 25 | doneDate | ❌ | — | `✅️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123` | _(empty)_ |
| 26 | cancelledDate | ❌ | — | `❌️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123` | _(empty)_ |
| 27 | dueDate | ❌ | — | `[📅📆🗓]️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123` | _(empty)_ |
| 28 | scheduledDate | ❌ | — | `[⏳⌛]️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123` | _(empty)_ |
| 29 | startDate | ❌ | — | `🛫️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123` | _(empty)_ |
| 30 | createdDate | ❌ | — | `➕️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123` | _(empty)_ |
| 31 | recurrence | ❌ | — | `🔁️? *([a-zA-Z0-9, !]+)$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123` | _(empty)_ |
| 32 | onCompletion | ❌ | — | `🏁️? *([a-zA-Z]+)$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123` | _(empty)_ |
| 33 | tags | ❌ | — | `(^\|\s)#[^ !@#$%^&*(),.?":{}\|<>]+$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123` | _(empty)_ |
| 34 | id | ❌ | — | `🆔️? *([a-zA-Z0-9-_]+)$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123` | _(empty)_ |
| 35 | dependsOn | ✅ | `⛔ 123456,abc123` | `⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$` | `Do exercises #todo #health 🆔 abcdef ⛔ 123456,abc123` | `Do exercises #todo #health 🆔 abcdef` |
| 36 | priority | ❌ | — | `([🔺⏫🔼🔽⏬])️?$` | `Do exercises #todo #health 🆔 abcdef` | _(empty)_ |
| 37 | doneDate | ❌ | — | `✅️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef` | _(empty)_ |
| 38 | cancelledDate | ❌ | — | `❌️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef` | _(empty)_ |
| 39 | dueDate | ❌ | — | `[📅📆🗓]️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef` | _(empty)_ |
| 40 | scheduledDate | ❌ | — | `[⏳⌛]️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef` | _(empty)_ |
| 41 | startDate | ❌ | — | `🛫️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef` | _(empty)_ |
| 42 | createdDate | ❌ | — | `➕️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health 🆔 abcdef` | _(empty)_ |
| 43 | recurrence | ❌ | — | `🔁️? *([a-zA-Z0-9, !]+)$` | `Do exercises #todo #health 🆔 abcdef` | _(empty)_ |
| 44 | onCompletion | ❌ | — | `🏁️? *([a-zA-Z]+)$` | `Do exercises #todo #health 🆔 abcdef` | _(empty)_ |
| 45 | tags | ❌ | — | `(^\|\s)#[^ !@#$%^&*(),.?":{}\|<>]+$` | `Do exercises #todo #health 🆔 abcdef` | _(empty)_ |
| 46 | id | ✅ | `🆔 abcdef` | `🆔️? *([a-zA-Z0-9-_]+)$` | `Do exercises #todo #health 🆔 abcdef` | `Do exercises #todo #health` |
| 47 | dependsOn | ❌ | — | `⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$` | `Do exercises #todo #health` | _(empty)_ |
| 48 | priority | ❌ | — | `([🔺⏫🔼🔽⏬])️?$` | `Do exercises #todo #health` | _(empty)_ |
| 49 | doneDate | ❌ | — | `✅️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health` | _(empty)_ |
| 50 | cancelledDate | ❌ | — | `❌️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health` | _(empty)_ |
| 51 | dueDate | ❌ | — | `[📅📆🗓]️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health` | _(empty)_ |
| 52 | scheduledDate | ❌ | — | `[⏳⌛]️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health` | _(empty)_ |
| 53 | startDate | ❌ | — | `🛫️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health` | _(empty)_ |
| 54 | createdDate | ❌ | — | `➕️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo #health` | _(empty)_ |
| 55 | recurrence | ❌ | — | `🔁️? *([a-zA-Z0-9, !]+)$` | `Do exercises #todo #health` | _(empty)_ |
| 56 | onCompletion | ❌ | — | `🏁️? *([a-zA-Z]+)$` | `Do exercises #todo #health` | _(empty)_ |
| 57 | tags | ✅ | ` #health` | `(^\|\s)#[^ !@#$%^&*(),.?":{}\|<>]+$` | `Do exercises #todo #health` | `Do exercises #todo` |
| 58 | id | ❌ | — | `🆔️? *([a-zA-Z0-9-_]+)$` | `Do exercises #todo` | _(empty)_ |
| 59 | dependsOn | ❌ | — | `⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$` | `Do exercises #todo` | _(empty)_ |
| 60 | priority | ❌ | — | `([🔺⏫🔼🔽⏬])️?$` | `Do exercises #todo` | _(empty)_ |
| 61 | doneDate | ❌ | — | `✅️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo` | _(empty)_ |
| 62 | cancelledDate | ❌ | — | `❌️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo` | _(empty)_ |
| 63 | dueDate | ❌ | — | `[📅📆🗓]️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo` | _(empty)_ |
| 64 | scheduledDate | ❌ | — | `[⏳⌛]️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo` | _(empty)_ |
| 65 | startDate | ❌ | — | `🛫️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo` | _(empty)_ |
| 66 | createdDate | ❌ | — | `➕️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises #todo` | _(empty)_ |
| 67 | recurrence | ❌ | — | `🔁️? *([a-zA-Z0-9, !]+)$` | `Do exercises #todo` | _(empty)_ |
| 68 | onCompletion | ❌ | — | `🏁️? *([a-zA-Z]+)$` | `Do exercises #todo` | _(empty)_ |
| 69 | tags | ✅ | ` #todo` | `(^\|\s)#[^ !@#$%^&*(),.?":{}\|<>]+$` | `Do exercises #todo` | `Do exercises` |
| 70 | id | ❌ | — | `🆔️? *([a-zA-Z0-9-_]+)$` | `Do exercises` | _(empty)_ |
| 71 | dependsOn | ❌ | — | `⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$` | `Do exercises` | _(empty)_ |
| 72 | priority | ❌ | — | `([🔺⏫🔼🔽⏬])️?$` | `Do exercises` | _(empty)_ |
| 73 | doneDate | ❌ | — | `✅️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises` | _(empty)_ |
| 74 | cancelledDate | ❌ | — | `❌️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises` | _(empty)_ |
| 75 | dueDate | ❌ | — | `[📅📆🗓]️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises` | _(empty)_ |
| 76 | scheduledDate | ❌ | — | `[⏳⌛]️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises` | _(empty)_ |
| 77 | startDate | ❌ | — | `🛫️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises` | _(empty)_ |
| 78 | createdDate | ❌ | — | `➕️? *(\d{4}-\d{2}-\d{2})$` | `Do exercises` | _(empty)_ |
| 79 | recurrence | ❌ | — | `🔁️? *([a-zA-Z0-9, !]+)$` | `Do exercises` | _(empty)_ |
| 80 | onCompletion | ❌ | — | `🏁️? *([a-zA-Z]+)$` | `Do exercises` | _(empty)_ |
| 81 | tags | ❌ | — | `(^\|\s)#[^ !@#$%^&*(),.?":{}\|<>]+$` | `Do exercises` | _(empty)_ |
| 82 | id | ❌ | — | `🆔️? *([a-zA-Z0-9-_]+)$` | `Do exercises` | _(empty)_ |
| 83 | dependsOn | ❌ | — | `⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$` | `Do exercises` | _(empty)_ |

**Final Description**: `Do exercises #todo #health`

---
Generated by Tasks Parser Diagnostic
