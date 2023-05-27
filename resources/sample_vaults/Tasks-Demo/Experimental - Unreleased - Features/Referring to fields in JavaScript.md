# Referring to fields in JavaScript

See:

- [[Group By Function]]
- [[Templating Experiments]]

## Fields

| group by function:<br>properties of the task | templating:<br>properties of the query file |
| -------------------------------------------- | ------------------------------------------- |
| `created`                                    |                                             |
| `description`                                |                                             |
| `done`                                       |                                             |
| `due`                                        |                                             |
| `filename`                                   | `{{query.filename}}`                        |
|                                              | `{{query.filenameWithoutExtension}}`        |
| `folder`                                     | `{{query.folder}}`                          |
| `happens`                                    |                                             |
| `header`                                     |                                             |
| `indentation`                                |                                             |
| `markdown`                                   |                                             |
| `path`                                       | `{{query.path}}`                            |
| `priority`                                   |                                             |
| `recurrence`                                 |                                             |
| `root`                                       | `{{query.root}}`                            |
| `scheduled`                                  |                                             |
| `start`                                      |                                             |
| `status`                                     |                                             |
| `tags`                                       |                                             |
| `urgency`                                    |                                             |
