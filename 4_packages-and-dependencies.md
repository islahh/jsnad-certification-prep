# Packages and Dependencies

## Default fields of a package.json

- To initialize `npm init -y`
- **name**: Name of the package.
- **version**: Current version number of the package.
- **description**: Package description, this is used for meta analysis in package registries. When someone searchs for your package this description will appear alongside the package name and version to give potential users an idea of its functionality.
- **main**: Entry-point file to load when the package is loaded.
- **scripts**: Shell scripts that can be executed by their namespaces.
- **keywords**: Array of keywords, improves discoverability of a published package (similar to SEO for websites).
- **author**: Package author
- **license**: Package license.

## Dependencies and NPM

- Installing a dependency: `npm i express`
  - It changes the `package.json` adding the dependencies field:
  ```json
  "dependencies": {
    "express": "^4.21.2" // Semver range version number for that dependency
  }
  ```
  - Running `npm i express` without specifying a version will install the latest version.
  - To specify a major version `npm i express@4`.
- To describe the installed production dependency tree of a package use: `npm ls --depth`.
  - The flag `--depth` is used to display not only the top-level dependencies but also their dependencies, and so on.

## Development dependencies

- Dependencies that are not needed to run the service, and are used to support the development process.
- `npm i eslint --save-dev`
  ```json
    "devDependencies": {
      "eslint": "^9.20.1"
    }
  ```
- `npm ls --depth` only shows top level development dependencies since the dev dependencies of installed packages are not installed.
- To don't install dev dependencies on production: `npm i --omit=dev` (delete node_modules first)
  - Try `npm ls` you will not find eslint. "UNMET DEPENDENCY eslint@^9.20.1"
  - `npm i && npm ls` now you will find eslint.

## Understanding [Semver](https://semver.org/) -> MAJOR.MINOR.PATCH

- `SemVer Format`: Three numbers separated by dots, each number represents a different type of change on the package. `^9.20.1`
  - `Major`: Left most number. Indicating changes that may break an API or its behavior.
    - Upgrading to a major can break the system.
  - `Minor`: Middle number. Means that the package was extended in some way, a new method, but it's fully backwards compatible.
    - Upgrading to a minor should not break the system.
  - `Patch`: Right most number. It means that there has been a bug fix.
- `SemVer range`: Facilitates a flexible versioning strategy.
- `The "x" character`: Can be used in any of the positions MAJOR.MINOR.PATCH.
  - For example: `1.2.x` will match all `PATCH numbers`. `1.x.x` will match all `MINOR and PATCH numbers`.
- To prefix a major version use the caret before the version: `^9.20.1` this is the same as `9.x.x`.
  - By default, `npm install` prefixes the version number of a package to avoid bugs caused by version changes.

## Package Scripts

- Aliases for shell commands used in the project.
```json
"scripts": {
    "run": "node index.js",
    "lint": "npx eslint ."
 }
```
- You can pass a double dash `--` to pass flags via `npm run` to the command. For example, to use the `--fix` flag with eslint in this case.
  - `npm run lint -- --fix`
- Npm have dedicated namespaces for `test` and `start` scripts so you don't need the `run`.
  - `npm start`, `npm run start` (both work in this case, but it can't be made, for example, for our lint script.)
