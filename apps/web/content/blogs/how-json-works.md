---
title: "How JSON Works: A Practical Guide to Parsing and Validating Data"
description: "What JSON actually is under the hood, common formatting mistakes, and how parsers catch (or miss) errors in real applications."
author: "RK"
authorGithub: "rk192324217"
date: "2026-08-12"
tags: ["technical"]
---

## Introduction

JSON shows up everywhere — API responses, config files, log entries, database exports — but most people who use it daily have never actually read the spec. Understanding what makes JSON valid, and why parsers reject the files they reject, saves a lot of debugging time.

![JSON logo](https://commons.wikimedia.org/wiki/Special:FilePath/JSON_vector_logo.svg)

## What JSON Actually Is

JSON (JavaScript Object Notation) is a text-based format for representing structured data using just six building blocks: objects (`{}`), arrays (`[]`), strings, numbers, booleans, and `null`. That's the entire vocabulary. There's no way to represent dates, functions, comments, or undefined values natively — anything beyond those six types has to be encoded as one of them, usually a string.

This minimalism is the whole point. JSON was designed to be trivially parseable by any language, not to be a full data-modeling format like XML.

## The Rules That Trip People Up

Most "invalid JSON" errors come down to a small set of repeat offenders:

- **Trailing commas** — `["a", "b",]` is invalid. JSON doesn't allow a comma after the last item, unlike JavaScript object literals.
- **Single quotes** — JSON requires double quotes for strings and keys. `{'name': 'value'}` is not valid JSON even though it's valid JavaScript.
- **Unquoted keys** — `{name: "value"}` fails; keys must always be quoted strings.
- **Comments** — JSON has no comment syntax at all. If you need comments in a config file, you're often better off with JSONC, YAML, or TOML.
- **NaN and Infinity** — these are valid in JavaScript numbers but have no representation in JSON. Serializing them usually produces `null` or throws, depending on the library.

## How Parsers Actually Validate

A JSON parser walks the text character by character, and at each point it knows exactly which characters are legal next based on where it is in the grammar. This is why error messages often point to a very specific line and column — the parser isn't guessing, it hit a character that's illegal in that exact context (like a `,` where it expected `}`).

This also explains why "the JSON looks fine to me" bugs happen: invisible characters. A byte-order mark (BOM) at the start of a file, or a stray non-breaking space copied from a webpage, can break parsing while looking completely normal in a text editor.

## Formatting vs Validating vs Minifying

These three operations are often confused:

- **Validating** checks whether the JSON is syntactically correct — no opinion on structure or content.
- **Formatting (beautifying)** adds consistent indentation and line breaks for readability, without changing the data.
- **Minifying** strips all unnecessary whitespace to reduce file size, which matters for large API payloads sent over a network.

A formatter or minifier will typically refuse to run on invalid JSON, since both operations assume a successfully parsed structure to re-serialize.

## Schema Validation Goes a Level Deeper

Syntactic validity doesn't mean the data is *correct*. `{"age": "twenty-five"}` is perfectly valid JSON even if your application expects `age` to be a number. This is where JSON Schema comes in — a separate specification for describing what shape and types your JSON *should* have, checked as a second pass after basic parsing succeeds.

## Practical Tips

- When debugging a parse error, check the reported line/column first — most editors will jump straight to the offending character.
- If JSON from an external API "sometimes" fails to parse, suspect encoding issues (UTF-8 BOMs) before assuming the data itself is malformed.
- For large JSON files, streaming parsers avoid loading the entire structure into memory at once, which matters once you're past a few hundred MB.

## Closing Thought

JSON's strictness is a feature, not a limitation — a format that never has to guess what you meant is a format that's trivially portable across every language and system that touches it.
