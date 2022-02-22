# Contributing Guidelines

## Working on a feature

All new feature work should belong in a feature branch that is branched off of `develop`.

## Submitting a PR

Before you submit your Pull Request (PR), do the following:

1. Pull latest changes from `develop` into feature branch and resolve any merge conflicts.

1. Update `CHANGELOG.md` to include a short description of your change in the next unreleased version.

1. Run linting and fix any issues that arise from linting: 
    ``` 
    yarn format
    ```

1. In GitHub, open a pull request to merge into `develop`.
