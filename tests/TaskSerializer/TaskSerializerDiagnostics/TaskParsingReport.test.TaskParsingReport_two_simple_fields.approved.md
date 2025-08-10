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
| Medium priority | `🔼` | `[🔺⏫🔼🔽⏬]\uFE0F?` | ✅ | `[🔺⏫🔼🔽⏬]\uFE0F?$` | ✅ |
| Low priority | `🔽` | `[🔺⏫🔼🔽⏬]\uFE0F?` | ✅ | `[🔺⏫🔼🔽⏬]\uFE0F?$` | ✅ |
| After triangle space | ` ⏳ 2025-08-09` | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ |
| Regular text | `test` | `test` | ✅ | `test$` | ✅ |
| Text with number | `test123` | `test\d+` | ✅ | `test\d+$` | ✅ |
| Date alone | `2025-08-09` | `\d{4}-\d{2}-\d{2}` | ✅ | `\d{4}-\d{2}-\d{2}$` | ✅ |

### Task 1
```text
- [ ] my description ⏫ ⏳ 2025-08-10
```

**Parsed**: ✅ Yes | **Fields Found**: 2

#### Character Analysis (Task Body)

| Index | Char | Unicode | Hex | Description |
|-------|------|---------|-----|-------------|
| 0 | m | U+006D | 006D |  |
| 1 | y | U+0079 | 0079 |  |
| 2 | (space) | U+0020 | 0020 | Space |
| 3 | d | U+0064 | 0064 |  |
| 4 | e | U+0065 | 0065 |  |
| 5 | s | U+0073 | 0073 |  |
| 6 | c | U+0063 | 0063 |  |
| 7 | r | U+0072 | 0072 |  |
| 8 | i | U+0069 | 0069 |  |
| 9 | p | U+0070 | 0070 |  |
| 10 | t | U+0074 | 0074 |  |
| 11 | i | U+0069 | 0069 |  |
| 12 | o | U+006F | 006F |  |
| 13 | n | U+006E | 006E |  |
| 14 | (space) | U+0020 | 0020 | Space |
| 15 | ⏫ | U+23EB | 23EB |  |
| 16 | (space) | U+0020 | 0020 | Space |
| 17 | ⏳ | U+23F3 | 23F3 |  |
| 18 | (space) | U+0020 | 0020 | Space |
| 19 | 2 | U+0032 | 0032 |  |
| 20 | 0 | U+0030 | 0030 |  |
| 21 | 2 | U+0032 | 0032 |  |
| 22 | 5 | U+0035 | 0035 |  |
| 23 | - | U+002D | 002D |  |
| 24 | 0 | U+0030 | 0030 |  |
| 25 | 8 | U+0038 | 0038 |  |
| 26 | - | U+002D | 002D |  |
| 27 | 1 | U+0031 | 0031 |  |
| 28 | 0 | U+0030 | 0030 |  |

**Hex string**: `006D 0079 0020 0064 0065 0073 0063 0072 0069 0070 0074 0069 006F 006E 0020 23EB 0020 23F3 0020 0032 0030 0032 0035 002D 0030 0038 002D 0031 0030`

#### Task 1: Parsing Steps

| Step | Field | Matched | Value | Regex | Input Before | Remaining After |
|------|-------|---------|-------|-------|--------------|-----------------|
| 0 | priority | ❌ | — | `([🔺⏫🔼🔽⏬])️?$` | `my description ⏫ ⏳ 2025-08-10` | _(empty)_ |
| 1 | doneDate | ❌ | — | `✅️? *(\d{4}-\d{2}-\d{2})$` | `my description ⏫ ⏳ 2025-08-10` | _(empty)_ |
| 2 | cancelledDate | ❌ | — | `❌️? *(\d{4}-\d{2}-\d{2})$` | `my description ⏫ ⏳ 2025-08-10` | _(empty)_ |
| 3 | dueDate | ❌ | — | `[📅📆🗓]️? *(\d{4}-\d{2}-\d{2})$` | `my description ⏫ ⏳ 2025-08-10` | _(empty)_ |
| 4 | scheduledDate | ✅ | `⏳ 2025-08-10` | `[⏳⌛]️? *(\d{4}-\d{2}-\d{2})$` | `my description ⏫ ⏳ 2025-08-10` | `my description ⏫` |
| 5 | startDate | ❌ | — | `🛫️? *(\d{4}-\d{2}-\d{2})$` | `my description ⏫` | _(empty)_ |
| 6 | createdDate | ❌ | — | `➕️? *(\d{4}-\d{2}-\d{2})$` | `my description ⏫` | _(empty)_ |
| 7 | recurrence | ❌ | — | `🔁️? *([a-zA-Z0-9, !]+)$` | `my description ⏫` | _(empty)_ |
| 8 | onCompletion | ❌ | — | `🏁️? *([a-zA-Z]+)$` | `my description ⏫` | _(empty)_ |
| 9 | tags | ❌ | — | `(^\|\s)#[^ !@#$%^&*(),.?":{}\|<>]+$` | `my description ⏫` | _(empty)_ |
| 10 | id | ❌ | — | `🆔️? *([a-zA-Z0-9-_]+)$` | `my description ⏫` | _(empty)_ |
| 11 | dependsOn | ❌ | — | `⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$` | `my description ⏫` | _(empty)_ |
| 12 | priority | ✅ | `⏫` | `([🔺⏫🔼🔽⏬])️?$` | `my description ⏫` | `my description` |
| 13 | doneDate | ❌ | — | `✅️? *(\d{4}-\d{2}-\d{2})$` | `my description` | _(empty)_ |
| 14 | cancelledDate | ❌ | — | `❌️? *(\d{4}-\d{2}-\d{2})$` | `my description` | _(empty)_ |
| 15 | dueDate | ❌ | — | `[📅📆🗓]️? *(\d{4}-\d{2}-\d{2})$` | `my description` | _(empty)_ |
| 16 | scheduledDate | ❌ | — | `[⏳⌛]️? *(\d{4}-\d{2}-\d{2})$` | `my description` | _(empty)_ |
| 17 | startDate | ❌ | — | `🛫️? *(\d{4}-\d{2}-\d{2})$` | `my description` | _(empty)_ |
| 18 | createdDate | ❌ | — | `➕️? *(\d{4}-\d{2}-\d{2})$` | `my description` | _(empty)_ |
| 19 | recurrence | ❌ | — | `🔁️? *([a-zA-Z0-9, !]+)$` | `my description` | _(empty)_ |
| 20 | onCompletion | ❌ | — | `🏁️? *([a-zA-Z]+)$` | `my description` | _(empty)_ |
| 21 | tags | ❌ | — | `(^\|\s)#[^ !@#$%^&*(),.?":{}\|<>]+$` | `my description` | _(empty)_ |
| 22 | id | ❌ | — | `🆔️? *([a-zA-Z0-9-_]+)$` | `my description` | _(empty)_ |
| 23 | dependsOn | ❌ | — | `⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$` | `my description` | _(empty)_ |
| 24 | priority | ❌ | — | `([🔺⏫🔼🔽⏬])️?$` | `my description` | _(empty)_ |
| 25 | doneDate | ❌ | — | `✅️? *(\d{4}-\d{2}-\d{2})$` | `my description` | _(empty)_ |
| 26 | cancelledDate | ❌ | — | `❌️? *(\d{4}-\d{2}-\d{2})$` | `my description` | _(empty)_ |
| 27 | dueDate | ❌ | — | `[📅📆🗓]️? *(\d{4}-\d{2}-\d{2})$` | `my description` | _(empty)_ |
| 28 | scheduledDate | ❌ | — | `[⏳⌛]️? *(\d{4}-\d{2}-\d{2})$` | `my description` | _(empty)_ |
| 29 | startDate | ❌ | — | `🛫️? *(\d{4}-\d{2}-\d{2})$` | `my description` | _(empty)_ |
| 30 | createdDate | ❌ | — | `➕️? *(\d{4}-\d{2}-\d{2})$` | `my description` | _(empty)_ |
| 31 | recurrence | ❌ | — | `🔁️? *([a-zA-Z0-9, !]+)$` | `my description` | _(empty)_ |
| 32 | onCompletion | ❌ | — | `🏁️? *([a-zA-Z]+)$` | `my description` | _(empty)_ |
| 33 | tags | ❌ | — | `(^\|\s)#[^ !@#$%^&*(),.?":{}\|<>]+$` | `my description` | _(empty)_ |
| 34 | id | ❌ | — | `🆔️? *([a-zA-Z0-9-_]+)$` | `my description` | _(empty)_ |
| 35 | dependsOn | ❌ | — | `⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$` | `my description` | _(empty)_ |

**Final Description**: `my description`

#### Emoji Pattern Tests
- scheduled_regex_on_snippet: ✅

---
Generated by Tasks Parser Diagnostic
