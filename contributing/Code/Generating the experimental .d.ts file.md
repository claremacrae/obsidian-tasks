---
publish: true
---

# Generating the experimental .d.ts file

==This is an experiment - everything is subject to change and deletion==

- `tasks-api.d.ts` contains the generated interface file.
  - It will need to be renamed to avoid confusion with the actual API.
- `src/api-entry.ts` determines which files are `export`ed
  - Beware that many private methods are wrongly included.
  - Add `@internal` to JSDoc to exclude things from the exported file.
  - Before release, a lot `@internal` will be added, so that only things I guarantee to support will be included in the .d.ts
- `yarn generate-api` updates `tasks-api.d.ts` and also copies it to the test vault
- The test vault has examples of use of this feature.
  - Please `diff` this branch with `main` to find them.
