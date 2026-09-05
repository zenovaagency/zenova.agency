---
title: 'Core Web Vitals: what actually moves the needle'
description: 'LCP, INP and CLS explained in plain language, and the four fixes that cover most slow Astro sites — no framework rewrite required.'
pubDate: 2026-08-14
author: 'Zenova'
image: '/blog/core-web-vitals.png'
imageAlt: 'Line drawing of a bar chart with a rising trend line ending in a filled dot'
---

Every Google page-experience signal is measurable, and three of them — the Core Web Vitals — are the ones that show up in Search Console and in client questions. Here is what each one actually measures, and what fixes them.

## The three metrics, in plain language

**Largest Contentful Paint (LCP)** measures how long the biggest thing in the first screen takes to appear. Usually that is a hero image or a large headline. "Good" is under 2.5 seconds.

**Interaction to Next Paint (INP)** measures how quickly the page responds when someone clicks or taps. If a menu takes 400ms to open, that is an INP problem. "Good" is under 200 milliseconds.

**Cumulative Layout Shift (CLS)** measures how much the page jumps around while loading. A banner shoving your article down mid-scroll is a CLS problem. "Good" is 0.1 or less.

## The four fixes that cover most cases

### 1. Size your images properly

Oversized hero images are the single most common cause of a bad LCP. Serve images at the size they render, in a modern format, and set `width` and `height` (or an aspect-ratio) so the browser reserves space before the file arrives — that same reservation fixes the layout shift side of CLS.

Astro's built-in image component handles resizing and modern formats automatically, which is one of the reasons we build on [Astro for content-heavy sites](/services/web).

### 2. Ship less JavaScript

Every kilobyte of JavaScript has to be downloaded, parsed and executed before the page can respond. Most marketing sites need very little of it. Astro ships zero JavaScript by default and adds it only where a component genuinely needs it — a form, a booking widget — so the baseline stays fast.

### 3. Stop layout shift at the source

Reserve space for everything that loads late: images, ads, embeds, web fonts. The `font-display` CSS property and a preloaded font file keep text from repainting after it is already readable.

### 4. Measure real visitors, not your laptop

Lab tools are useful, but the numbers that count come from real users on real phones. PageSpeed Insights reports both; Search Console aggregates field data for the whole site.

> A site that scores well in the lab on a fast connection can still fail real visitors on a mid-range phone. Always check the field data.

## Where this fits in the bigger picture

Page experience is a ranking *input*, not a ranking *strategy*. It works alongside the fundamentals — useful content, clear headings, descriptive links — not instead of them. If you are starting from scratch, our [web development service](/services/web) covers performance budgets as part of every build.
