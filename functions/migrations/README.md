# FireWay Migrations for Firestore

A schema migration tool for Firestore.

## Install

```bash
yarn global add fireway

# or

npx fireway
```

## Credentials

In order to fireway be able to connect to firestore you need to set up the environment variable `GOOGLE_APPLICATION_CREDENTIALS` with service account file path.

Example:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/firestore-service-account.json"
```

## CLI

```bash
Usage
  $ fireway <command> [options]

Available Commands
  migrate    Migrates schema to the latest version

For more info, run any command with the `--help` flag
  $ fireway migrate --help

Options
  --require        Requires a module before executing
  -v, --version    Displays current version
  -h, --help       Displays this message

Examples
  $ fireway migrate
  $ fireway --require="ts-node/register" migrate
```

### `fireway migrate`

```bash
Description
  Migrates schema to the latest version

Usage
  $ fireway migrate [options]

Options
  --path         Path to migration files  (default ./migrations)
  --projectId    Target firebase project
  --dryrun       Simulates changes
  --forceWait    Forces waiting for migrations that do not strictly manage async calls
  --require      Requires a module before executing
  -h, --help     Displays this message

Examples
  $ fireway migrate
  $ fireway migrate --path=./my-migrations
  $ fireway migrate --projectId=my-staging-id
  $ fireway migrate --dryrun
  $ fireway migrate --forceWait
  $ fireway --require="ts-node/register" migrate
```

## Migration File format

- Migration `SemVer` number should alway be higher than the previous one.
- Migration file name format: `v[semver]__[yymmdd]_[description].ts`

## Create a migration

```ts
// ./migrations/v0.0.1__230228_AddTribeKeyEvent-example.ts

import { MigrateOptions } from "fireway";

export async function migrate({ firestore }: MigrateOptions) {
  await firestore.collection("events").doc("one").set({ key: "value" });
}
```

4. Run `fireway migrate` with the `require` option

   ```sh
   $ fireway migrate --require="ts-node/register"

   OR

   $ fireway migrate --require="ts-node/register" --projectId=party-hunt
   ```

## Migration logic

1. Gather all the migration files and sort them according to semver
2. Find the last migration in the `fireway` collection
3. If the last migration failed, stop. (remove the failed migration result or restore the db to continue)
4. Run the migration scripts since the last migration

## Migration results

Migration results are stored in the `fireway` collection in `firestore`
