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
| Step 1: Priority match | `Highest 🔺 ⏳ 2025-08-09` | `🔺\uFE0F?` | ✅ | `🔺\uFE0F?$` | ❌ |
| ⚠️ **DIFFERS** | | | | | |
| Step 2: After removing priority | `Highest  ⏳ 2025-08-09` | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ |
| Step 2b: After trim | `Highest ⏳ 2025-08-09` | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ |
| Medium priority | `🔼` | `[🔺⏫🔼🔽⏬]\uFE0F?` | ✅ | `[🔺⏫🔼🔽⏬]\uFE0F?$` | ✅ |
| Low priority | `🔽` | `[🔺⏫🔼🔽⏬]\uFE0F?` | ✅ | `[🔺⏫🔼🔽⏬]\uFE0F?$` | ✅ |
| After triangle space | ` ⏳ 2025-08-09` | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ | `[⏳⌛]\uFE0F? *(\d{4}-\d{2}-\d{2...` | ✅ |
| Regular text | `test` | `test` | ✅ | `test$` | ✅ |
| Text with number | `test123` | `test\d+` | ✅ | `test\d+$` | ✅ |
| Date alone | `2025-08-09` | `\d{4}-\d{2}-\d{2}` | ✅ | `\d{4}-\d{2}-\d{2}$` | ✅ |

**Failed tests:**
- With $ anchor: 2 failures

### Task 1
```text
- [ ] task that does not show up 🔁 every day 🛫 2025-08-09
```

**Parsed**: ✅ Yes | **Fields Found**: 2

#### Task 1: Character Analysis (Task Body)

| Index | Char | Unicode | Hex | Description |
|-------|------|---------|-----|-------------|
| 0 | t | U+0074 | 0074 |  |
| 1 | a | U+0061 | 0061 |  |
| 2 | s | U+0073 | 0073 |  |
| 3 | k | U+006B | 006B |  |
| 4 | (space) | U+0020 | 0020 | Space |
| 5 | t | U+0074 | 0074 |  |
| 6 | h | U+0068 | 0068 |  |
| 7 | a | U+0061 | 0061 |  |
| 8 | t | U+0074 | 0074 |  |
| 9 | (space) | U+0020 | 0020 | Space |
| 10 | d | U+0064 | 0064 |  |
| 11 | o | U+006F | 006F |  |
| 12 | e | U+0065 | 0065 |  |
| 13 | s | U+0073 | 0073 |  |
| 14 | (space) | U+0020 | 0020 | Space |
| 15 | n | U+006E | 006E |  |
| 16 | o | U+006F | 006F |  |
| 17 | t | U+0074 | 0074 |  |
| 18 | (space) | U+0020 | 0020 | Space |
| 19 | s | U+0073 | 0073 |  |
| 20 | h | U+0068 | 0068 |  |
| 21 | o | U+006F | 006F |  |
| 22 | w | U+0077 | 0077 |  |
| 23 | (space) | U+0020 | 0020 | Space |
| 24 | u | U+0075 | 0075 |  |
| 25 | p | U+0070 | 0070 |  |
| 26 | (space) | U+0020 | 0020 | Space |
| 27 | 🔁 | U+1F501 | 1F501 | Emoji |
| 28 | (space) | U+0020 | 0020 | Space |
| 29 | e | U+0065 | 0065 |  |
| 30 | v | U+0076 | 0076 |  |
| 31 | e | U+0065 | 0065 |  |
| 32 | r | U+0072 | 0072 |  |
| 33 | y | U+0079 | 0079 |  |
| 34 | (space) | U+0020 | 0020 | Space |
| 35 | d | U+0064 | 0064 |  |
| 36 | a | U+0061 | 0061 |  |
| 37 | y | U+0079 | 0079 |  |
| 38 | (space) | U+0020 | 0020 | Space |
| 39 | 🛫 | U+1F6EB | 1F6EB | Emoji |
| 40 | (space) | U+0020 | 0020 | Space |
| 41 | 2 | U+0032 | 0032 |  |
| 42 | 0 | U+0030 | 0030 |  |
| 43 | 2 | U+0032 | 0032 |  |
| 44 | 5 | U+0035 | 0035 |  |
| 45 | - | U+002D | 002D |  |
| 46 | 0 | U+0030 | 0030 |  |
| 47 | 8 | U+0038 | 0038 |  |
| 48 | - | U+002D | 002D |  |
| 49 | 0 | U+0030 | 0030 |  |
| 50 | 9 | U+0039 | 0039 |  |

**Hex string**: `0074 0061 0073 006B 0020 0074 0068 0061 0074 0020 0064 006F 0065 0073 0020 006E 006F 0074 0020 0073 0068 006F 0077 0020 0075 0070 0020 1F501 0020 0065 0076 0065 0072 0079 0020 0064 0061 0079 0020 1F6EB 0020 0032 0030 0032 0035 002D 0030 0038 002D 0030 0039`

#### Task 1: Parsing Steps

| Step | Field | Matched | Value | Regex | Input Before | Remaining After |
|------|-------|---------|-------|-------|--------------|-----------------|
| 0 | priority | ❌ | — | `([🔺⏫🔼🔽⏬])️?$` | `task that does not show up 🔁 every day 🛫 2025-08-09` | _(empty)_ |
| 1 | doneDate | ❌ | — | `✅️? *(\d{4}-\d{2}-\d{2})$` | `task that does not show up 🔁 every day 🛫 2025-08-09` | _(empty)_ |
| 2 | cancelledDate | ❌ | — | `❌️? *(\d{4}-\d{2}-\d{2})$` | `task that does not show up 🔁 every day 🛫 2025-08-09` | _(empty)_ |
| 3 | dueDate | ❌ | — | `[📅📆🗓]️? *(\d{4}-\d{2}-\d{2})$` | `task that does not show up 🔁 every day 🛫 2025-08-09` | _(empty)_ |
| 4 | scheduledDate | ❌ | — | `[⏳⌛]️? *(\d{4}-\d{2}-\d{2})$` | `task that does not show up 🔁 every day 🛫 2025-08-09` | _(empty)_ |
| 5 | startDate | ✅ | `🛫 2025-08-09` | `🛫️? *(\d{4}-\d{2}-\d{2})$` | `task that does not show up 🔁 every day 🛫 2025-08-09` | `task that does not show up 🔁 every day` |
| 6 | createdDate | ❌ | — | `➕️? *(\d{4}-\d{2}-\d{2})$` | `task that does not show up 🔁 every day` | _(empty)_ |
| 7 | recurrence | ✅ | `🔁 every day` | `🔁️? *([a-zA-Z0-9, !]+)$` | `task that does not show up 🔁 every day` | `task that does not show up` |
| 8 | onCompletion | ❌ | — | `🏁️? *([a-zA-Z]+)$` | `task that does not show up` | _(empty)_ |
| 9 | tags | ❌ | — | `(^\|\s)#[^ !@#$%^&*(),.?":{}\|<>]+$` | `task that does not show up` | _(empty)_ |
| 10 | id | ❌ | — | `🆔️? *([a-zA-Z0-9-_]+)$` | `task that does not show up` | _(empty)_ |
| 11 | dependsOn | ❌ | — | `⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$` | `task that does not show up` | _(empty)_ |
| 12 | priority | ❌ | — | `([🔺⏫🔼🔽⏬])️?$` | `task that does not show up` | _(empty)_ |
| 13 | doneDate | ❌ | — | `✅️? *(\d{4}-\d{2}-\d{2})$` | `task that does not show up` | _(empty)_ |
| 14 | cancelledDate | ❌ | — | `❌️? *(\d{4}-\d{2}-\d{2})$` | `task that does not show up` | _(empty)_ |
| 15 | dueDate | ❌ | — | `[📅📆🗓]️? *(\d{4}-\d{2}-\d{2})$` | `task that does not show up` | _(empty)_ |
| 16 | scheduledDate | ❌ | — | `[⏳⌛]️? *(\d{4}-\d{2}-\d{2})$` | `task that does not show up` | _(empty)_ |
| 17 | startDate | ❌ | — | `🛫️? *(\d{4}-\d{2}-\d{2})$` | `task that does not show up` | _(empty)_ |
| 18 | createdDate | ❌ | — | `➕️? *(\d{4}-\d{2}-\d{2})$` | `task that does not show up` | _(empty)_ |
| 19 | recurrence | ❌ | — | `🔁️? *([a-zA-Z0-9, !]+)$` | `task that does not show up` | _(empty)_ |
| 20 | onCompletion | ❌ | — | `🏁️? *([a-zA-Z]+)$` | `task that does not show up` | _(empty)_ |
| 21 | tags | ❌ | — | `(^\|\s)#[^ !@#$%^&*(),.?":{}\|<>]+$` | `task that does not show up` | _(empty)_ |
| 22 | id | ❌ | — | `🆔️? *([a-zA-Z0-9-_]+)$` | `task that does not show up` | _(empty)_ |
| 23 | dependsOn | ❌ | — | `⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$` | `task that does not show up` | _(empty)_ |

**Final Description**: `task that does not show up`

### Task 2
```text
- [ ] task that does show up 🛫 2025-08-09 🔁 every day
```

**Parsed**: ✅ Yes | **Fields Found**: 2

#### Task 2: Character Analysis (Task Body)

| Index | Char | Unicode | Hex | Description |
|-------|------|---------|-----|-------------|
| 0 | t | U+0074 | 0074 |  |
| 1 | a | U+0061 | 0061 |  |
| 2 | s | U+0073 | 0073 |  |
| 3 | k | U+006B | 006B |  |
| 4 | (space) | U+0020 | 0020 | Space |
| 5 | t | U+0074 | 0074 |  |
| 6 | h | U+0068 | 0068 |  |
| 7 | a | U+0061 | 0061 |  |
| 8 | t | U+0074 | 0074 |  |
| 9 | (space) | U+0020 | 0020 | Space |
| 10 | d | U+0064 | 0064 |  |
| 11 | o | U+006F | 006F |  |
| 12 | e | U+0065 | 0065 |  |
| 13 | s | U+0073 | 0073 |  |
| 14 | (space) | U+0020 | 0020 | Space |
| 15 | s | U+0073 | 0073 |  |
| 16 | h | U+0068 | 0068 |  |
| 17 | o | U+006F | 006F |  |
| 18 | w | U+0077 | 0077 |  |
| 19 | (space) | U+0020 | 0020 | Space |
| 20 | u | U+0075 | 0075 |  |
| 21 | p | U+0070 | 0070 |  |
| 22 | (space) | U+0020 | 0020 | Space |
| 23 | 🛫 | U+1F6EB | 1F6EB | Emoji |
| 24 | (space) | U+0020 | 0020 | Space |
| 25 | 2 | U+0032 | 0032 |  |
| 26 | 0 | U+0030 | 0030 |  |
| 27 | 2 | U+0032 | 0032 |  |
| 28 | 5 | U+0035 | 0035 |  |
| 29 | - | U+002D | 002D |  |
| 30 | 0 | U+0030 | 0030 |  |
| 31 | 8 | U+0038 | 0038 |  |
| 32 | - | U+002D | 002D |  |
| 33 | 0 | U+0030 | 0030 |  |
| 34 | 9 | U+0039 | 0039 |  |
| 35 | (space) | U+0020 | 0020 | Space |
| 36 | 🔁 | U+1F501 | 1F501 | Emoji |
| 37 | (space) | U+0020 | 0020 | Space |
| 38 | e | U+0065 | 0065 |  |
| 39 | v | U+0076 | 0076 |  |
| 40 | e | U+0065 | 0065 |  |
| 41 | r | U+0072 | 0072 |  |
| 42 | y | U+0079 | 0079 |  |
| 43 | (space) | U+0020 | 0020 | Space |
| 44 | d | U+0064 | 0064 |  |
| 45 | a | U+0061 | 0061 |  |
| 46 | y | U+0079 | 0079 |  |

**Hex string**: `0074 0061 0073 006B 0020 0074 0068 0061 0074 0020 0064 006F 0065 0073 0020 0073 0068 006F 0077 0020 0075 0070 0020 1F6EB 0020 0032 0030 0032 0035 002D 0030 0038 002D 0030 0039 0020 1F501 0020 0065 0076 0065 0072 0079 0020 0064 0061 0079`

#### Task 2: Parsing Steps

| Step | Field | Matched | Value | Regex | Input Before | Remaining After |
|------|-------|---------|-------|-------|--------------|-----------------|
| 0 | priority | ❌ | — | `([🔺⏫🔼🔽⏬])️?$` | `task that does show up 🛫 2025-08-09 🔁 every day` | _(empty)_ |
| 1 | doneDate | ❌ | — | `✅️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up 🛫 2025-08-09 🔁 every day` | _(empty)_ |
| 2 | cancelledDate | ❌ | — | `❌️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up 🛫 2025-08-09 🔁 every day` | _(empty)_ |
| 3 | dueDate | ❌ | — | `[📅📆🗓]️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up 🛫 2025-08-09 🔁 every day` | _(empty)_ |
| 4 | scheduledDate | ❌ | — | `[⏳⌛]️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up 🛫 2025-08-09 🔁 every day` | _(empty)_ |
| 5 | startDate | ❌ | — | `🛫️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up 🛫 2025-08-09 🔁 every day` | _(empty)_ |
| 6 | createdDate | ❌ | — | `➕️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up 🛫 2025-08-09 🔁 every day` | _(empty)_ |
| 7 | recurrence | ✅ | `🔁 every day` | `🔁️? *([a-zA-Z0-9, !]+)$` | `task that does show up 🛫 2025-08-09 🔁 every day` | `task that does show up 🛫 2025-08-09` |
| 8 | onCompletion | ❌ | — | `🏁️? *([a-zA-Z]+)$` | `task that does show up 🛫 2025-08-09` | _(empty)_ |
| 9 | tags | ❌ | — | `(^\|\s)#[^ !@#$%^&*(),.?":{}\|<>]+$` | `task that does show up 🛫 2025-08-09` | _(empty)_ |
| 10 | id | ❌ | — | `🆔️? *([a-zA-Z0-9-_]+)$` | `task that does show up 🛫 2025-08-09` | _(empty)_ |
| 11 | dependsOn | ❌ | — | `⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$` | `task that does show up 🛫 2025-08-09` | _(empty)_ |
| 12 | priority | ❌ | — | `([🔺⏫🔼🔽⏬])️?$` | `task that does show up 🛫 2025-08-09` | _(empty)_ |
| 13 | doneDate | ❌ | — | `✅️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up 🛫 2025-08-09` | _(empty)_ |
| 14 | cancelledDate | ❌ | — | `❌️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up 🛫 2025-08-09` | _(empty)_ |
| 15 | dueDate | ❌ | — | `[📅📆🗓]️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up 🛫 2025-08-09` | _(empty)_ |
| 16 | scheduledDate | ❌ | — | `[⏳⌛]️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up 🛫 2025-08-09` | _(empty)_ |
| 17 | startDate | ✅ | `🛫 2025-08-09` | `🛫️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up 🛫 2025-08-09` | `task that does show up` |
| 18 | createdDate | ❌ | — | `➕️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up` | _(empty)_ |
| 19 | recurrence | ❌ | — | `🔁️? *([a-zA-Z0-9, !]+)$` | `task that does show up` | _(empty)_ |
| 20 | onCompletion | ❌ | — | `🏁️? *([a-zA-Z]+)$` | `task that does show up` | _(empty)_ |
| 21 | tags | ❌ | — | `(^\|\s)#[^ !@#$%^&*(),.?":{}\|<>]+$` | `task that does show up` | _(empty)_ |
| 22 | id | ❌ | — | `🆔️? *([a-zA-Z0-9-_]+)$` | `task that does show up` | _(empty)_ |
| 23 | dependsOn | ❌ | — | `⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$` | `task that does show up` | _(empty)_ |
| 24 | priority | ❌ | — | `([🔺⏫🔼🔽⏬])️?$` | `task that does show up` | _(empty)_ |
| 25 | doneDate | ❌ | — | `✅️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up` | _(empty)_ |
| 26 | cancelledDate | ❌ | — | `❌️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up` | _(empty)_ |
| 27 | dueDate | ❌ | — | `[📅📆🗓]️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up` | _(empty)_ |
| 28 | scheduledDate | ❌ | — | `[⏳⌛]️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up` | _(empty)_ |
| 29 | startDate | ❌ | — | `🛫️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up` | _(empty)_ |
| 30 | createdDate | ❌ | — | `➕️? *(\d{4}-\d{2}-\d{2})$` | `task that does show up` | _(empty)_ |
| 31 | recurrence | ❌ | — | `🔁️? *([a-zA-Z0-9, !]+)$` | `task that does show up` | _(empty)_ |
| 32 | onCompletion | ❌ | — | `🏁️? *([a-zA-Z]+)$` | `task that does show up` | _(empty)_ |
| 33 | tags | ❌ | — | `(^\|\s)#[^ !@#$%^&*(),.?":{}\|<>]+$` | `task that does show up` | _(empty)_ |
| 34 | id | ❌ | — | `🆔️? *([a-zA-Z0-9-_]+)$` | `task that does show up` | _(empty)_ |
| 35 | dependsOn | ❌ | — | `⛔️? *([a-zA-Z0-9-_]+( *, *[a-zA-Z0-9-_]+ *)*)$` | `task that does show up` | _(empty)_ |

**Final Description**: `task that does show up`

---
Generated by Tasks Parser Diagnostic
