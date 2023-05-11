# Templating Experiments

## Tasks

- [ ] #task Do something 1
- [ ] #task Do something 2
- [ ] #task Do something 3
- [ ] #task Do something 4

## Goals

- [x] #task Figure out where to insert the template expansion code ✅ 2023-05-02
- [ ] #task Explain to show the line with template, then the expanded line
- [ ] #task Must be able to test this stuff - can we use a TFile in tests?

## Symbols Supported

<!-- snippet: QueryContext.test.QueryContext_should_construct_a_QueryContext_from_a_path.approved.json -->
```json
{
  "query": {
    "root": "a/",
    "path": "a/b/c.md",
    "folder": "a/b/",
    "filename": "c.md",
    "filenameWithoutExtension": "c"
  }
}
```
<!-- endSnippet -->

- `query.root`
- `query.path`
- `query.folder`
- `query.filename`
- `query.filenameWithoutExtension`

## Limitations

- The symbols are case-sensitive:
  - `query.fileName` is not recognised
  - `path includes {{query.fileName}}` gives:
    - `Missing Mustache data property: query.fileName`
- Error handling
  - The reference to `Mustache` in error messages may be confusing??
  - Use of unrecognised symbols inside `{{ }}` is spotted, and the name is written out
    - But if you write `{{queryx.file.filename}}`, it doesn't get past `queryx`
    - So the error would be:
      - `Missing Mustache data property: queryx`
  - If there is an error, the entire input string is written out, and it can be hard to spot the problem line
  - At the moment the whole query is checked as one string, so the error message contains the whole input, making any problem a little harder to space
  - It complains about any unrecognised template values in comments, even though comments are then ignored
- explanations
  - `explain` instructions only show the expanded text
  - It would be nice to also show the original variable name, and then the expanded text
- use in regular expressions is allowed
  - but due to characters with special meanings in reg ex, it is not recommended to use them
- when you rename a file containing a tasks query block with variable names in, the query block is not updated

## Testing

- [ ] #task When user renames a file with a query block, confirm that the search is updated

## Example Search

```tasks
path includes Templating Experiments
path includes {{queryx.file.filename}}
limit 10
group by path
group by heading
description does not include {{query.filenameWithoutExtension}}
description does not include {{query.path}}

# Note cannot generally put arbitrary string in to regular expression,
# due to special meaning of some characters
# description regex does not match /^{{query.path}}$/
# explain
```

## Missing Features

- Searching by today's date or time
- Get date string from file names
-
