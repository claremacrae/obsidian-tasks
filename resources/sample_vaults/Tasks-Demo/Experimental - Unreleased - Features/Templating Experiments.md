# Templating Experiments

## Tasks

- [ ] #task Do something 1
- [ ] #task Do something 2
- [ ] #task Do something 3
- [ ] #task Do something 4

## Goals

- [ ] #task Figure out where to insert the template expansion code
- [ ] #task Explain to show the line with template, then the expanded line
- [ ] #task Must be able to test this stuff - can we use a TFile in tests?

## Testing

- [ ] #task When user renames a file with a query block, confirm that the search is updated

## Searches

```tasks
path includes Templating Experiments
path includes {{query.file.filename}}
limit 10
group by path
group by heading
description does not include {{query.file.filenameWithoutExtension}}
description does not include {{query.file.path}}

# Note cannot generally put arbitrary string in to regular expression,
# due to special meaning of some characters
description regex does not match /^{{query.file.pathxx}}$/
explain
```
