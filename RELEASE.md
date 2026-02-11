# How to Release cli-owm

This is not difficult.

**Step 1.** Decide on a version number.
It follows Semantic Versioning, which I shan't explain.

**Step 2.** Create a branch and update the version in two places.
<sigh>.

```
git checkout -b bump-vX.Y.Z
```

Edit both of these files, replacing the old version with the new one:

- `package.json` — the `"version"` field
- `src/version.ts` — the `VERSION` constant

**Step 3.** Commit, push, and open a pull request.

```
git add package.json src/version.ts
git commit -m "Bump version to X.Y.Z"
git push -u origin bump-vX.Y.Z
gh pr create --title "Bump version to X.Y.Z" --body "Release prep."
```

**Step 4.** Wait for CI to pass and merge the PR.

**Step 5.** Pull master and create a tag.
The tag MUST match the version in `package.json`, prefixed with `v`.

```
git checkout master
git pull
git tag vX.Y.Z
git push origin vX.Y.Z
```

**Step 6.** There is no Step 6. The `publish.yml` workflow does the
rest:

- Runs the tests (a precaution I insisted upon)
- Publishes to npm with provenance via trusted publishing
- Builds standalone binaries for Linux, macOS, and Windows
- Creates a GitHub Release with the binaries attached

**Step 7.** Verify the release appeared on
[npmjs.com/package/cli-owm](https://www.npmjs.com/package/cli-owm)
and on the GitHub Releases page.
