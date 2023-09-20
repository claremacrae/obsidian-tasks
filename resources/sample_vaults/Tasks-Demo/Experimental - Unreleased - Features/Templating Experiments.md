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

## Limitations

- Error handling
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
description does not include {{query.file.filename}}
description does not include {{query.file.path}}

# Note cannot generally put arbitrary string in to regular expression,
# due to special meaning of some characters
# description regex does not match /^{{query.file.path}}$/
# explain
```

## Missing Features

- Searching by today's date or time
- Get date string from file names
