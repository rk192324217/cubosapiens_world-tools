# GitHub Profile Analyzer

A modern developer analytics dashboard that transforms public GitHub profiles into meaningful visual insights using the GitHub REST API.

Built entirely with **HTML, CSS, and Vanilla JavaScript**, the application analyzes repositories, languages, activity trends, community engagement, and open-source contributions without requiring authentication, a backend server, or external frameworks.

---

## ✨ Features

### 👤 Profile Overview

View important profile information at a glance:

- Avatar and bio
- Name and username
- Followers and following
- Public repositories and gists
- Company, location, and website
- Account creation date and age

### 📦 Repository Analytics

Analyze repository statistics including:

- Original repository count
- Total stars received
- Total forks received
- Average stars per repository
- Most starred repository
- Most forked repository

### 🌐 Language Distribution

Visualize programming language usage through an interactive doughnut chart.

Features include:

- Top language ranking
- Percentage breakdown
- Unknown language handling
- Responsive chart rendering

### 🏆 Open Source Score

A custom scoring system that evaluates a developer's GitHub presence using:

- Repository count
- Total stars
- Total forks
- Followers
- Contribution consistency
- Language diversity

Displayed through:

- Animated score ring
- Letter grade classification
- Detailed sub-score breakdown

> **Disclaimer:** The Open Source Score is a custom metric and is not affiliated with or endorsed by GitHub.

### 💡 Developer Insights

Automatically generated metrics including:

- Primary Language
- Polyglot Level
- Repository Scale
- Community Engagement
- Documentation Signal
- License Adoption Rate
- Topic Coverage
- Fork Ratio
- Freshness Score
- Archive Rate

### 📈 Repository Creation Trends

Track repository growth over time with an interactive bar chart showing yearly repository creation patterns and activity trends.

### 🧭 Estimated Technology Focus

A radar chart estimates specialization across:

- Frontend Development
- Backend Development
- Systems Programming
- Data Science
- Mobile Development
- DevOps

### ⭐ Top Repositories

Explore the user's most popular repositories including:

- Repository name
- Description
- Primary language
- Star count
- Fork count
- Last updated date
- Direct GitHub link

### 📅 Account Age Analytics

Detailed timeline insights:

- Account age
- First repository date
- Latest repository date
- Development span
- Time to first repository
- Recently updated repositories

### 🔗 Shareable URLs

Generate direct profile links using query parameters:

```text
?user=torvalds