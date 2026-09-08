---
title: "How Compilers Work: From Source Code to Machine Code in 6 Stages"
description: "A tour through what actually happens between writing code and running it — lexing, parsing, semantic analysis, IR generation, optimization, and code generation."
author: "RK"
authorGithub: "rk192324217"
date: "2026-08-20"
tags: ["technical"]
---

## Introduction

Every time you compile a program, a surprisingly consistent pipeline runs underneath, regardless of the source language or target platform. Understanding these stages demystifies compiler errors — knowing *which* stage rejected your code tells you exactly what kind of mistake you made.

![Compiler pipeline diagram](https://commons.wikimedia.org/wiki/Special:FilePath/Compiler.svg)

## Stage 1: Lexical Analysis (Tokenizing)

The compiler's first job is turning raw text into a stream of meaningful chunks called tokens. The line `x = a + 1;` becomes something like `IDENTIFIER(x)`, `ASSIGN`, `IDENTIFIER(a)`, `PLUS`, `NUMBER(1)`, `SEMICOLON`. At this stage the compiler has no idea if the code makes sense — it's purely recognizing patterns, similar to how a spellchecker identifies words without understanding grammar.

## Stage 2: Syntax Analysis (Parsing)

The token stream gets organized into a tree structure — an Abstract Syntax Tree (AST) — that represents the grammatical structure of the code. This is where a missing semicolon or unbalanced bracket gets caught: the parser has rules for what a valid statement looks like, and a token stream that doesn't fit any rule triggers a syntax error. Notably, the parser still doesn't know what any variable *means* — only that the structure is grammatically valid.

## Stage 3: Semantic Analysis

This is where meaning enters the picture. The compiler checks things a parser can't: does `a` actually exist in this scope? Are you adding a number to a string without a defined conversion? Does the function call match a defined function's parameter types? This stage is where most "type error" and "undefined variable" messages originate — the code was grammatically valid, but semantically broken.

## Stage 4: Intermediate Representation (IR)

Rather than jumping straight from the AST to machine code, most compilers translate to an intermediate representation first — a lower-level, more uniform format that's still independent of any specific CPU architecture. This is a deliberate design choice: it lets the same frontend (lexer, parser, semantic analyzer) support multiple target platforms by swapping out only the final code-generation stage, and it gives the optimizer a consistent format to work with regardless of source language quirks.

## Stage 5: Optimization

With the IR in hand, the compiler applies transformations that preserve behavior while improving performance — eliminating dead code that can never execute, replacing repeated calculations with a single cached result, unrolling small loops, and inlining short function calls to avoid call overhead. This stage is often the most complex part of a real-world compiler, and it's why compiled code frequently runs faster than a naive reading of the source would suggest — the compiler has restructured it considerably.

## Stage 6: Code Generation

Finally, the optimized IR gets translated into actual machine code (or bytecode, for platforms like the JVM) for the target architecture — mapping abstract operations onto the real instruction set, allocating actual CPU registers, and handling the specific calling conventions of the target platform.

## Why This Model Matters Beyond Trivia

Understanding these stages makes debugging faster in practice. A compile error citing "unexpected token" is a parser complaint about structure — check your brackets and semicolons. An error about "type mismatch" or "undeclared identifier" is a semantic analysis complaint — the structure was fine, but the meaning wasn't. Knowing which stage rejected your code narrows down what kind of fix you're looking for before you've even read the specific message.

## Closing Thought

The six-stage pipeline is decades old as a concept, but it remains the mental model behind nearly every compiler in production — from C compilers to the transpilers that convert modern JavaScript into browser-compatible code. Once you can name the stage, compiler errors stop feeling like a black box and start reading like they're pointing you somewhere specific.
