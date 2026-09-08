---
title: "QR Codes Explained: How They Encode Data and Where They Break"
description: "The actual mechanics behind those black-and-white squares — how they store data, why they still work when scratched, and the most common reasons scans fail."
author: "RK"
authorGithub: "rk192324217"
date: "2026-08-13"
tags: ["technical", "general"]
---

## Introduction

QR codes feel like magic — point a camera at a grid of squares and a link opens. But the format is fully public, well-documented, and the mechanics are more interesting than most people expect, especially the part where a QR code can still scan correctly even after a third of it is damaged.

![QR code example](https://commons.wikimedia.org/wiki/Special:FilePath/QR_code.svg)

## The Structure Isn't Random

A QR code isn't a random-looking grid — every region has a specific job:

- **Finder patterns** — the three large squares in the corners let a scanner instantly detect orientation and rotation, even if the photo is taken at an angle.
- **Timing patterns** — the alternating black-and-white strips between the finder patterns tell the scanner exactly where each individual cell starts and ends.
- **Data and error-correction cells** — the actual payload, encoded across the remaining grid.
- **Quiet zone** — the blank white border around the whole code. Scanners rely on this margin to detect where the code starts; a QR code cropped too tightly often fails to scan for this reason alone.

## Why QR Codes Survive Damage

This is the most underrated part of the format. QR codes use Reed-Solomon error correction, the same family of algorithm used in CDs and satellite communication. Depending on the error-correction level chosen at creation time (Low, Medium, Quartile, or High), a QR code can lose anywhere from about 7% to 30% of its data and still be read correctly.

This is why you can put a logo in the middle of a QR code, or why a slightly torn sticker still scans — the missing data gets mathematically reconstructed from redundancy encoded elsewhere in the grid. Higher error correction means more redundancy, but also a denser, more complex-looking code for the same payload.

## What's Actually Inside

The scanned "data" is almost always plain text, formatted for a specific purpose:

- A URL is just the literal URL string.
- Wi-Fi QR codes follow a specific format: `WIFI:T:WPA;S:NetworkName;P:Password;;`
- Contact cards use the vCard format, a structured text block a phone recognizes and offers to save.

There's no actual "connection" to anything when you scan — the code contains the full instruction, and your phone's software decides what to do with that text based on its format.

## Why Scans Sometimes Fail

Most failed scans come down to a small set of causes:

- **Insufficient contrast** — light gray on white, or any color combination without enough brightness difference, confuses the scanner's edge detection.
- **Missing quiet zone** — cropping the white border too tightly, especially common when QR codes are placed near the edge of a poster or business card.
- **Too much data for the physical size** — cramming a long URL into a small printed code increases cell density to the point where a phone camera, especially at a distance, can't resolve individual cells.
- **Screen glare or curved surfaces** — reflections break up the contrast a scanner depends on.

## A Practical Tip

If you're generating QR codes for print, use a URL shortener first. Shorter data means fewer cells, which means larger, more forgiving squares at the same physical print size — meaningfully improving scan reliability from a distance or on lower-end phone cameras.

## Closing Thought

The appeal of QR codes isn't that they're clever — it's that the format is open, the error correction is generous, and virtually every phone already has a compatible scanner built in. That combination of resilience and ubiquity is why a 1994 Japanese manufacturing barcode format ended up on restaurant menus worldwide three decades later.
