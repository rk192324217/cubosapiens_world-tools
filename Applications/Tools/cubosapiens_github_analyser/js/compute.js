/* ============================================================
   COMPUTATION ENGINE
   Pure functions — no DOM, no fetch, no side effects
   Namespace: window.Compute
   ============================================================ */

(function () {
  'use strict';

  // ---- Utility: Safe Division ----
  function safeDivide(a, b, decimals) {
    if (decimals === undefined) decimals = 1;
    if (!b || b === 0) return 0;
    return Number((a / b).toFixed(decimals));
  }

  // ---- Utility: Format Number ----
  function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    if (num >= 1000000) return safeDivide(num, 1000000, 1) + 'M';
    if (num >= 1000) return safeDivide(num, 1000, 1) + 'K';
    return String(num);
  }

  // ---- Utility: Format Bytes (KB to readable) ----
  function formatSize(kb) {
    if (!kb || kb === 0) return '0 KB';
    if (kb < 1024) return kb + ' KB';
    if (kb < 1024 * 1024) return safeDivide(kb, 1024, 1) + ' MB';
    return safeDivide(kb, 1024 * 1024, 2) + ' GB';
  }

  // ---- Utility: Format Date ----
  function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }

  // ---- Utility: Format Duration ----
  function formatDuration(ms) {
    if (!ms || ms <= 0) return 'N/A';
    var totalDays = Math.floor(ms / (1000 * 60 * 60 * 24));
    var years = Math.floor(totalDays / 365);
    var remainingDays = totalDays % 365;
    var months = Math.floor(remainingDays / 30);
    var days = remainingDays % 30;

    var parts = [];
    if (years > 0) parts.push(years + (years === 1 ? ' year' : ' years'));
    if (months > 0) parts.push(months + (months === 1 ? ' month' : ' months'));
    if (parts.length === 0 && days > 0) parts.push(days + (days === 1 ? ' day' : ' days'));
    if (parts.length === 0) parts.push('Less than a day');

    return parts.join(', ');
  }

  // ---- Get Original (non-fork) Repos ----
  function getOriginalRepos(repos) {
    if (!repos || !Array.isArray(repos)) return [];
    return repos.filter(function (repo) {
      return repo.fork === false;
    });
  }

  // ---- Repository Stats ----
  function getRepoStats(originalRepos) {
    if (!originalRepos || originalRepos.length === 0) {
      return {
        totalStars: 0,
        totalForks: 0,
        avgStars: 0,
        mostStarred: null,
        mostForked: null,
        count: 0
      };
    }

    var totalStars = 0;
    var totalForks = 0;
    var mostStarred = originalRepos[0];
    var mostForked = originalRepos[0];

    for (var i = 0; i < originalRepos.length; i++) {
      var repo = originalRepos[i];
      var stars = repo.stargazers_count || 0;
      var forks = repo.forks_count || 0;

      totalStars += stars;
      totalForks += forks;

      if (stars > (mostStarred.stargazers_count || 0)) {
        mostStarred = repo;
      }
      if (forks > (mostForked.forks_count || 0)) {
        mostForked = repo;
      }
    }

    return {
      totalStars: totalStars,
      totalForks: totalForks,
      avgStars: safeDivide(totalStars, originalRepos.length, 1),
      mostStarred: mostStarred,
      mostForked: mostForked,
      count: originalRepos.length
    };
  }

  // ---- Language Distribution ----
  function getLanguageDistribution(originalRepos) {
    if (!originalRepos || originalRepos.length === 0) {
      return [];
    }

    var langCounts = {};
    var total = 0;

    for (var i = 0; i < originalRepos.length; i++) {
      var lang = originalRepos[i].language;
      if (lang === null || lang === undefined) {
        lang = 'Unknown';
      }
      if (!langCounts[lang]) langCounts[lang] = 0;
      langCounts[lang]++;
      total++;
    }

    // Sort descending by count
    var sorted = Object.keys(langCounts).map(function (language) {
      return { language: language, count: langCounts[language] };
    }).sort(function (a, b) {
      return b.count - a.count;
    });

    // Top 7 + Other bucket
    var result = [];
    var otherCount = 0;

    for (var j = 0; j < sorted.length; j++) {
      if (j < 7) {
        result.push(sorted[j]);
      } else {
        otherCount += sorted[j].count;
      }
    }

    if (otherCount > 0) {
      result.push({ language: 'Other', count: otherCount });
    }

    // Calculate percentages that sum to exactly 100%
    var runningTotal = 0;
    for (var k = 0; k < result.length; k++) {
      if (k === result.length - 1) {
        // Last item gets the remainder to guarantee 100%
        result[k].percentage = Math.round((100 - runningTotal) * 10) / 10;
      } else {
        result[k].percentage = Math.round(safeDivide(result[k].count * 100, total, 1) * 10) / 10;
        runningTotal += result[k].percentage;
      }
    }

    return result;
  }

  // ---- Open Source Score ----
  function getOpenSourceScore(profile, originalRepos) {
    var nonForkCount = originalRepos ? originalRepos.length : 0;
    var stats = getRepoStats(originalRepos);
    var followers = (profile && profile.followers) ? profile.followers : 0;

    // Count unique years with repos created
    var yearSet = {};
    if (originalRepos) {
      for (var i = 0; i < originalRepos.length; i++) {
        if (originalRepos[i].created_at) {
          var year = new Date(originalRepos[i].created_at).getFullYear();
          if (!isNaN(year)) yearSet[year] = true;
        }
      }
    }
    var yearsWithRepos = Object.keys(yearSet).length;

    // Count unique languages (null becomes "Unknown" and participates)
    var langSet = {};
    if (originalRepos) {
      for (var j = 0; j < originalRepos.length; j++) {
        var lang = originalRepos[j].language;
        if (lang === null || lang === undefined) {
          lang = 'Unknown';
        }
        langSet[lang] = true;
      }
    }
    var uniqueLanguages = Object.keys(langSet).length;

    // Sub-scores
    var repoScore = Math.min(100, nonForkCount * 3.33);
    var starScore = Math.min(100, stats.totalStars * 0.2);
    var forkScore = Math.min(100, stats.totalForks * 0.5);
    var followerScore = Math.min(100, followers * 0.5);
    var consistencyScore = Math.min(100, yearsWithRepos * 16.67);
    var diversityScore = Math.min(100, uniqueLanguages * 14.28);

    // Round sub-scores to 1 decimal
    repoScore = Math.round(repoScore * 10) / 10;
    starScore = Math.round(starScore * 10) / 10;
    forkScore = Math.round(forkScore * 10) / 10;
    followerScore = Math.round(followerScore * 10) / 10;
    consistencyScore = Math.round(consistencyScore * 10) / 10;
    diversityScore = Math.round(diversityScore * 10) / 10;

    // Final score
    var score = (repoScore * 0.15) +
                (starScore * 0.25) +
                (forkScore * 0.20) +
                (followerScore * 0.20) +
                (consistencyScore * 0.10) +
                (diversityScore * 0.10);

    score = Math.round(score * 10) / 10;

    // Grade
    var grade;
    if (score >= 90) grade = 'A+';
    else if (score >= 80) grade = 'A';
    else if (score >= 65) grade = 'B';
    else if (score >= 50) grade = 'C';
    else if (score >= 35) grade = 'D';
    else grade = 'F';

    return {
      score: score,
      grade: grade,
      subscores: {
        repoScore: repoScore,
        starScore: starScore,
        forkScore: forkScore,
        followerScore: followerScore,
        consistencyScore: consistencyScore,
        diversityScore: diversityScore
      }
    };
  }

  // ---- Developer Insights ----
  function getDeveloperInsights(profile, originalRepos, allRepos) {
    var safeOriginal = originalRepos || [];
    var safeAll = allRepos || [];

    // Primary Language
    var langCounts = {};
    for (var i = 0; i < safeOriginal.length; i++) {
      var lang = safeOriginal[i].language;
      if (lang === null || lang === undefined) lang = 'Unknown';
      if (!langCounts[lang]) langCounts[lang] = 0;
      langCounts[lang]++;
    }
    var primaryLanguage = 'None';
    var maxCount = 0;
    for (var langKey in langCounts) {
      if (langCounts.hasOwnProperty(langKey) && langCounts[langKey] > maxCount) {
        maxCount = langCounts[langKey];
        primaryLanguage = langKey;
      }
    }

    // Polyglot Level
    var uniqueLangs = Object.keys(langCounts).length;
    var polyglotLevel;
    if (uniqueLangs === 0) polyglotLevel = 'None';
    else if (uniqueLangs === 1) polyglotLevel = 'Monoglot';
    else if (uniqueLangs <= 3) polyglotLevel = 'Bilingual';
    else if (uniqueLangs <= 6) polyglotLevel = 'Polyglot';
    else polyglotLevel = 'Hyperglot';

    // Repository Scale
    var totalSizeKB = 0;
    for (var s = 0; s < safeOriginal.length; s++) {
      totalSizeKB += safeOriginal[s].size || 0;
    }
    var repositoryScale = formatSize(totalSizeKB);

    // Community Engagement
    var stats = getRepoStats(safeOriginal);
    var communityEngagement = stats.totalStars + stats.totalForks;

    // Documentation Signal
    var withDescription = 0;
    for (var d = 0; d < safeOriginal.length; d++) {
      if (safeOriginal[d].description && safeOriginal[d].description.trim() !== '') {
        withDescription++;
      }
    }
    var documentationSignal = safeOriginal.length > 0
      ? Math.round(safeDivide(withDescription * 100, safeOriginal.length, 0))
      : 0;

    // License Adoption
    var withLicense = 0;
    for (var l = 0; l < safeOriginal.length; l++) {
      if (safeOriginal[l].license !== null && safeOriginal[l].license !== undefined) {
        withLicense++;
      }
    }
    var licenseAdoption = safeOriginal.length > 0
      ? Math.round(safeDivide(withLicense * 100, safeOriginal.length, 0))
      : 0;

    // Topic Coverage
    var withTopics = 0;
    for (var t = 0; t < safeOriginal.length; t++) {
      if (safeOriginal[t].topics && safeOriginal[t].topics.length > 0) {
        withTopics++;
      }
    }
    var topicCoverage = safeOriginal.length > 0
      ? Math.round(safeDivide(withTopics * 100, safeOriginal.length, 0))
      : 0;

    // Fork Ratio (uses ALL repos, not just originals)
    var forkCount = 0;
    for (var f = 0; f < safeAll.length; f++) {
      if (safeAll[f].fork === true) {
        forkCount++;
      }
    }
    var forkRatio = safeAll.length > 0
      ? Math.round(safeDivide(forkCount * 100, safeAll.length, 0))
      : 0;

    // Freshness (repos updated in last 12 months)
    var now = Date.now();
    var oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
    var recentlyUpdated = 0;
    for (var r = 0; r < safeOriginal.length; r++) {
      if (safeOriginal[r].updated_at) {
        var updatedAt = new Date(safeOriginal[r].updated_at).getTime();
        if (updatedAt >= oneYearAgo) {
          recentlyUpdated++;
        }
      }
    }

    // Archive Rate
    var archivedCount = 0;
    for (var a = 0; a < safeOriginal.length; a++) {
      if (safeOriginal[a].archived === true) {
        archivedCount++;
      }
    }
    var archiveRate = safeOriginal.length > 0
      ? Math.round(safeDivide(archivedCount * 100, safeOriginal.length, 0))
      : 0;

    return {
      primaryLanguage: primaryLanguage,
      polyglotLevel: polyglotLevel + ' (' + uniqueLangs + ' language' + (uniqueLangs !== 1 ? 's' : '') + ')',
      repositoryScale: repositoryScale,
      communityEngagement: formatNumber(communityEngagement),
      documentationSignal: documentationSignal + '%',
      licenseAdoption: licenseAdoption + '%',
      topicCoverage: topicCoverage + '%',
      forkRatio: forkRatio + '%',
      freshness: recentlyUpdated + ' repo' + (recentlyUpdated !== 1 ? 's' : ''),
      archiveRate: archiveRate + '%'
    };
  }

  // ---- Repository Creation Trend ----
  function getRepoCreationTrend(originalRepos) {
    if (!originalRepos || originalRepos.length === 0) {
      return { data: [], trend: 'Stable' };
    }

    var yearCounts = {};
    for (var i = 0; i < originalRepos.length; i++) {
      if (originalRepos[i].created_at) {
        var year = new Date(originalRepos[i].created_at).getFullYear();
        if (!isNaN(year)) {
          if (!yearCounts[year]) yearCounts[year] = 0;
          yearCounts[year]++;
        }
      }
    }

    var years = Object.keys(yearCounts).map(Number).sort(function (a, b) { return a - b; });

    var data = years.map(function (year) {
      return { year: year, count: yearCounts[year] };
    });

    // Calculate trend from last 2 years
    var trend = 'Stable';
    if (data.length >= 2) {
      var last = data[data.length - 1].count;
      var secondLast = data[data.length - 2].count;
      if (last > secondLast) trend = 'Increasing';
      else if (last < secondLast) trend = 'Decreasing';
    }

    return { data: data, trend: trend };
  }

  // ---- Estimated Technology Focus ----
  function getTechnologyFocus(originalRepos) {
    var categoryMap = {
      'Frontend':     ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'Svelte', 'Dart'],
      'Backend':      ['Python', 'Java', 'Ruby', 'PHP', 'Go', 'Rust', 'C#', 'Kotlin', 'Scala', 'Elixir', 'Perl'],
      'Systems':      ['C', 'C++', 'Rust', 'Assembly', 'Zig', 'Nim'],
      'Data Science': ['Python', 'R', 'Julia', 'Jupyter Notebook', 'MATLAB'],
      'Mobile':       ['Swift', 'Kotlin', 'Dart', 'Java', 'Objective-C'],
      'DevOps':       ['Shell', 'Dockerfile', 'HCL', 'Nix', 'PowerShell']
    };

    var categories = ['Frontend', 'Backend', 'Systems', 'Data Science', 'Mobile', 'DevOps'];
    var scores = {};
    for (var c = 0; c < categories.length; c++) {
      scores[categories[c]] = 0;
    }

    if (!originalRepos || originalRepos.length === 0) {
      return categories.map(function (cat) {
        return { category: cat, score: 0 };
      });
    }

    for (var i = 0; i < originalRepos.length; i++) {
      var lang = originalRepos[i].language;
      if (!lang) continue;
      for (var cat in categoryMap) {
        if (categoryMap.hasOwnProperty(cat)) {
          if (categoryMap[cat].indexOf(lang) !== -1) {
            scores[cat]++;
          }
        }
      }
    }

    // Find max for normalization
    var maxScore = 0;
    for (var s in scores) {
      if (scores.hasOwnProperty(s) && scores[s] > maxScore) {
        maxScore = scores[s];
      }
    }

    // Normalize to 0-100
    return categories.map(function (cat) {
      return {
        category: cat,
        score: maxScore > 0 ? Math.round(safeDivide(scores[cat] * 100, maxScore, 0)) : 0
      };
    });
  }

  // ---- Account Age Analytics ----
  function getAccountAgeAnalytics(profile, originalRepos) {
    var safeRepos = originalRepos || [];
    var now = Date.now();

    // Account Age
    var accountCreated = profile && profile.created_at ? new Date(profile.created_at).getTime() : null;
    var accountAge = accountCreated ? formatDuration(now - accountCreated) : 'N/A';

    // First Repo Date
    var firstRepoDate = null;
    var latestRepoDate = null;

    if (safeRepos.length > 0) {
      var sorted = safeRepos.slice().sort(function (a, b) {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
      firstRepoDate = sorted[0].created_at;
      latestRepoDate = sorted[sorted.length - 1].created_at;
    }

    // Time To First Repo
    var timeToFirstRepo = 'N/A';
    if (accountCreated && firstRepoDate) {
      var firstRepoTime = new Date(firstRepoDate).getTime();
      var diff = firstRepoTime - accountCreated;
      timeToFirstRepo = diff > 0 ? formatDuration(diff) : 'Same day';
    }

    // Active Span (first repo to latest repo)
    var activeSpan = 'N/A';
    if (firstRepoDate && latestRepoDate) {
      var first = new Date(firstRepoDate).getTime();
      var latest = new Date(latestRepoDate).getTime();
      var span = latest - first;
      activeSpan = span > 0 ? formatDuration(span) : 'Same day';
    }

    // Repositories updated in last 12 months
    var oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
    var recentCount = 0;
    for (var i = 0; i < safeRepos.length; i++) {
      if (safeRepos[i].updated_at) {
        var updatedAt = new Date(safeRepos[i].updated_at).getTime();
        if (updatedAt >= oneYearAgo) {
          recentCount++;
        }
      }
    }

    return {
      accountAge: accountAge,
      firstRepoDate: formatDate(firstRepoDate),
      timeToFirstRepo: timeToFirstRepo,
      latestRepoDate: formatDate(latestRepoDate),
      activeSpan: activeSpan,
      recentRepos: recentCount
    };
  }

  // ---- Public API ----
  window.Compute = {
    safeDivide: safeDivide,
    formatNumber: formatNumber,
    formatSize: formatSize,
    formatDate: formatDate,
    formatDuration: formatDuration,
    getOriginalRepos: getOriginalRepos,
    getRepoStats: getRepoStats,
    getLanguageDistribution: getLanguageDistribution,
    getOpenSourceScore: getOpenSourceScore,
    getDeveloperInsights: getDeveloperInsights,
    getRepoCreationTrend: getRepoCreationTrend,
    getTechnologyFocus: getTechnologyFocus,
    getAccountAgeAnalytics: getAccountAgeAnalytics
  };

})();
