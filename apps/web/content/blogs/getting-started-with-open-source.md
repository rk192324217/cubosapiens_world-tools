---
title: "Getting Started with Open Source Contributions"
description: "A practical step-by-step guide to making your first pull request on GitHub, from forking a repo to getting your code merged."
author: "Jane Dev"
authorGithub: "janedev"
date: "2025-05-21"
tags: ["guides", "oss"]
---

## Introduction

Open source can feel intimidating at first, but the process becomes straightforward once you know the steps.
This guide walks you through everything from finding a project to getting your first PR merged.

## Finding a Project

Look for repositories with a `good first issue` label — these are tasks maintainers have specifically
scoped for newcomers. On GitHub you can search globally:

```
label:"good first issue" language:TypeScript
```

Check the project's `CONTRIBUTING.md` before diving in. It tells you the coding conventions,
how to run the project locally, and any specific rules for PRs.

## Setting Up Locally

Once you've chosen an issue, fork the repo and clone your fork:

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
npm install
npm run dev
```

Always create a new branch for your work — never commit directly to `main`:

```bash
git checkout -b fix/my-descriptive-branch-name
```

## Making the Change

Keep your change **small and focused**. A PR that fixes one thing is much easier to review than one
that touches ten files. Write clean, readable code that follows the existing style in the codebase.

If the repo has linting or formatting tools (`eslint`, `prettier`), run them before committing:

```bash
npm run lint
```

## Opening the Pull Request

Push your branch and open a PR against the original repo's `main` branch:

```bash
git push origin fix/my-descriptive-branch-name
```

In your PR description, include:

- **What** changed
- **Why** it's needed (link the issue: `Closes #15`)
- **How to test it** manually

## Responding to Review

Maintainers may ask for changes — this is normal and healthy. Update your branch and push again;
the PR updates automatically. Avoid force-pushing unless specifically asked, as it makes the review
history harder to follow.

## Conclusion

Your first contribution doesn't have to be code. Fixing a typo in documentation, adding a missing
example, or improving an error message all count. The goal is to start small, learn the workflow,
and build from there.
