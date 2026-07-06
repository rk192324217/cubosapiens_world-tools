/* ============================================================
   DOM RENDERING LAYER
   Renders all dashboard sections from computed data
   Namespace: window.Render
   ============================================================ */

(function () {
  'use strict';

  // ---- Helpers ----
  function el(tag, attrs, children) {
    var element = document.createElement(tag);
    if (attrs) {
      for (var key in attrs) {
        if (attrs.hasOwnProperty(key)) {
          if (key === 'className') {
            element.className = attrs[key];
          } else if (key === 'innerHTML') {
            element.innerHTML = attrs[key];
          } else if (key === 'textContent') {
            element.textContent = attrs[key];
          } else if (key.indexOf('data-') === 0 || key === 'role' || key.indexOf('aria-') === 0) {
            element.setAttribute(key, attrs[key]);
          } else {
            element[key] = attrs[key];
          }
        }
      }
    }
    if (children) {
      if (typeof children === 'string') {
        element.textContent = children;
      } else if (Array.isArray(children)) {
        for (var i = 0; i < children.length; i++) {
          if (children[i]) element.appendChild(children[i]);
        }
      } else {
        element.appendChild(children);
      }
    }
    return element;
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function safeText(val) {
    if (val === null || val === undefined || val === '') return 'N/A';
    if (typeof val === 'number' && (isNaN(val) || !isFinite(val))) return '0';
    return String(val);
  }

  // ---- Language Color Map (common GitHub language colors) ----
  var LANG_COLORS = {
    'JavaScript': '#F1E05A', 'TypeScript': '#3178C6', 'Python': '#3572A5',
    'Java': '#B07219', 'Go': '#00ADD8', 'Rust': '#DEA584',
    'C': '#555555', 'C++': '#F34B7D', 'C#': '#178600',
    'Ruby': '#701516', 'PHP': '#4F5D95', 'Swift': '#F05138',
    'Kotlin': '#A97BFF', 'Dart': '#00B4AB', 'Shell': '#89E051',
    'HTML': '#E34C26', 'CSS': '#563D7C', 'Vue': '#41B883',
    'Svelte': '#FF3E00', 'Scala': '#C22D40', 'R': '#198CE7',
    'Julia': '#A270BA', 'MATLAB': '#E16737', 'Perl': '#0298C3',
    'Elixir': '#6E4A7E', 'Haskell': '#5E5086', 'Lua': '#000080',
    'Objective-C': '#438EFF', 'Assembly': '#6E4C13', 'Dockerfile': '#384D54',
    'PowerShell': '#012456', 'Jupyter Notebook': '#DA5B0B',
    'Unknown': '#6B7280', 'Other': '#6B7280'
  };

  function getLangColor(lang) {
    return LANG_COLORS[lang] || '#6B7280';
  }

  // ---- Section A: Profile Overview ----
  function renderProfile(profile) {
    if (!profile) return;

    // Avatar
    var avatarEl = document.getElementById('profile-avatar');
    avatarEl.src = profile.avatar_url || '';
    avatarEl.alt = (profile.name || profile.login) + ' avatar';

    // Name
    document.getElementById('profile-name').textContent = profile.name || profile.login || 'N/A';

    // Username
    var usernameEl = document.getElementById('profile-username');
    usernameEl.innerHTML = '';
    var usernameLink = el('a', {
      href: profile.html_url || ('https://github.com/' + profile.login),
      target: '_blank',
      rel: 'noopener noreferrer'
    }, '@' + (profile.login || ''));
    usernameEl.appendChild(usernameLink);

    // Bio
    var bioEl = document.getElementById('profile-bio');
    bioEl.textContent = profile.bio || '';
    bioEl.style.display = profile.bio ? 'block' : 'none';

    // Meta items (company, location, blog, twitter)
    var metaContainer = document.getElementById('profile-meta');
    metaContainer.innerHTML = '';

    if (profile.company) {
      metaContainer.appendChild(createMetaItem('building-2', profile.company));
    }
    if (profile.location) {
      metaContainer.appendChild(createMetaItem('map-pin', profile.location));
    }
    if (profile.blog) {
      var blogUrl = profile.blog;
      if (blogUrl && blogUrl.indexOf('http') !== 0) {
        blogUrl = 'https://' + blogUrl;
      }
      metaContainer.appendChild(createMetaItemLink('link', profile.blog, blogUrl));
    }
    if (profile.twitter_username) {
      metaContainer.appendChild(createMetaItemLink(
        'twitter',
        '@' + profile.twitter_username,
        'https://twitter.com/' + profile.twitter_username
      ));
    }

    // Stats
    document.getElementById('stat-followers-value').textContent =
      Compute.formatNumber(profile.followers || 0);
    document.getElementById('stat-following-value').textContent =
      Compute.formatNumber(profile.following || 0);
    document.getElementById('stat-repos-value').textContent =
      Compute.formatNumber(profile.public_repos || 0);
    document.getElementById('stat-gists-value').textContent =
      Compute.formatNumber(profile.public_gists || 0);

    // Account created
    document.getElementById('profile-created').textContent =
      Compute.formatDate(profile.created_at);

    // Account age badge
    if (profile.created_at) {
      var ageMs = Date.now() - new Date(profile.created_at).getTime();
      document.getElementById('profile-account-age').textContent =
        Compute.formatDuration(ageMs);
    } else {
      document.getElementById('profile-account-age').textContent = 'N/A';
    }
  }

  function createMetaItem(iconName, text) {
    var item = el('div', { className: 'profile-meta-item' });
    item.innerHTML = '<i data-lucide="' + escapeHtml(iconName) + '"></i>';
    item.appendChild(el('span', {}, text));
    return item;
  }

  function createMetaItemLink(iconName, text, href) {
    var item = el('div', { className: 'profile-meta-item' });
    item.innerHTML = '<i data-lucide="' + escapeHtml(iconName) + '"></i>';
    var link = el('a', { href: href, target: '_blank', rel: 'noopener noreferrer' }, text);
    item.appendChild(link);
    return item;
  }

  // ---- Section B: Repository Analytics ----
  function renderRepoAnalytics(stats, capped) {
    var grid = document.getElementById('analytics-grid');
    grid.innerHTML = '';

    // Regular stat cards
    var cards = [
      { icon: 'git-branch', label: 'Original Repos', value: Compute.formatNumber(stats.count) },
      { icon: 'star', label: 'Total Stars', value: Compute.formatNumber(stats.totalStars) },
      { icon: 'git-fork', label: 'Total Forks', value: Compute.formatNumber(stats.totalForks) },
      { icon: 'bar-chart-3', label: 'Avg Stars/Repo', value: safeText(stats.avgStars) }
    ];

    for (var i = 0; i < cards.length; i++) {
      grid.appendChild(createAnalyticsCard(cards[i]));
    }

    // Most starred repo
    if (stats.mostStarred && stats.count > 0) {
      grid.appendChild(createHighlightCard(
        'star', 'Most Starred', stats.mostStarred
      ));
    }

    // Most forked repo
    if (stats.mostForked && stats.count > 0) {
      grid.appendChild(createHighlightCard(
        'git-fork', 'Most Forked', stats.mostForked
      ));
    }

    // Info notice for capped repos
    var noticeArea = document.getElementById('info-notice-area');
    if (capped) {
      noticeArea.innerHTML =
        '<i data-lucide="info" class="notice-icon"></i>' +
        '<span>Showing first 1000 repositories for analysis.</span>';
      noticeArea.style.display = 'flex';
    } else {
      noticeArea.style.display = 'none';
    }
  }

  function createAnalyticsCard(data) {
    var card = el('div', { className: 'analytics-card' });
    card.innerHTML =
      '<i data-lucide="' + escapeHtml(data.icon) + '" class="card-icon"></i>' +
      '<span class="card-label">' + escapeHtml(data.label) + '</span>' +
      '<span class="card-value">' + escapeHtml(data.value) + '</span>';
    return card;
  }

  function createHighlightCard(icon, label, repo) {
    var card = el('div', { className: 'analytics-card highlight-card' });
    var starCount = repo.stargazers_count || 0;
    var forkCount = repo.forks_count || 0;
    var metricValue = icon === 'star' ? starCount : forkCount;

    card.innerHTML =
      '<i data-lucide="' + escapeHtml(icon) + '" class="card-icon"></i>' +
      '<span class="card-label">' + escapeHtml(label) + '</span>' +
      '<div class="card-repo-name">' +
        '<a href="' + escapeHtml(repo.html_url) + '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(repo.name) + '</a>' +
      '</div>' +
      '<span class="card-value">' + Compute.formatNumber(metricValue) + '</span>';
    return card;
  }

  // ---- Section C: Language Distribution ----
  function renderLanguageDistribution(langData) {
    var list = document.getElementById('language-list');
    list.innerHTML = '';

    if (!langData || langData.length === 0) {
      var emptyItem = el('li', { className: 'language-item' });
      emptyItem.textContent = 'No language data available';
      emptyItem.style.color = 'var(--text-muted)';
      emptyItem.style.padding = 'var(--space-4)';
      list.appendChild(emptyItem);
      return;
    }

    for (var i = 0; i < langData.length; i++) {
      var item = langData[i];
      var color = Charts.getColor(i);
      var li = el('li', { className: 'language-item' });
      li.innerHTML =
        '<span class="language-dot" style="background-color:' + color + ';"></span>' +
        '<span class="language-name">' + escapeHtml(item.language) + '</span>' +
        '<div class="language-bar-wrapper">' +
          '<div class="language-bar" style="width:' + item.percentage + '%;background-color:' + color + ';"></div>' +
        '</div>' +
        '<span class="language-percentage">' + item.percentage + '%</span>';
      list.appendChild(li);
    }
  }

  // ---- Section D: Open Source Score ----
  function renderOpenSourceScore(scoreData) {
    if (!scoreData) return;

    var score = scoreData.score;
    var grade = scoreData.grade;
    var subscores = scoreData.subscores;

    // Score ring animation
    var ringFill = document.getElementById('score-ring-fill');
    var circumference = 2 * Math.PI * 85; // ~534.07
    var offset = circumference - (score / 100) * circumference;

    // Set initial state (fully hidden)
    ringFill.style.strokeDasharray = circumference;
    ringFill.style.strokeDashoffset = circumference;

    // Color based on grade
    var gradeColors = {
      'A+': '#22C55E', 'A': '#3B82F6', 'B': '#8B5CF6',
      'C': '#F59E0B', 'D': '#EC4899', 'F': '#EF4444'
    };
    var ringColor = gradeColors[grade] || '#22C55E';
    ringFill.style.stroke = ringColor;

    // Trigger animation after a brief delay
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        ringFill.style.strokeDashoffset = offset;
      });
    });

    // Score text
    document.getElementById('score-ring-value').textContent = Math.round(score);
    document.getElementById('score-ring-label').textContent = 'out of 100';

    // Grade badge
    var gradeBadge = document.getElementById('score-grade-badge');
    gradeBadge.textContent = grade;
    gradeBadge.className = 'grade-badge';

    var gradeClass = {
      'A+': 'grade-a-plus', 'A': 'grade-a', 'B': 'grade-b',
      'C': 'grade-c', 'D': 'grade-d', 'F': 'grade-f'
    };
    gradeBadge.classList.add(gradeClass[grade] || 'grade-f');

    // Sub-score breakdown
    var breakdown = document.getElementById('score-breakdown');
    breakdown.innerHTML = '';

    var subscoreItems = [
      { label: 'Repository Score', value: subscores.repoScore, weight: '15%', color: '#22C55E' },
      { label: 'Star Score', value: subscores.starScore, weight: '25%', color: '#3B82F6' },
      { label: 'Fork Score', value: subscores.forkScore, weight: '20%', color: '#8B5CF6' },
      { label: 'Follower Score', value: subscores.followerScore, weight: '20%', color: '#F59E0B' },
      { label: 'Consistency Score', value: subscores.consistencyScore, weight: '10%', color: '#06B6D4' },
      { label: 'Diversity Score', value: subscores.diversityScore, weight: '10%', color: '#EC4899' }
    ];

    for (var i = 0; i < subscoreItems.length; i++) {
      var sub = subscoreItems[i];
      var item = el('div', { className: 'score-subscore' });
      item.innerHTML =
        '<div class="subscore-header">' +
          '<span class="subscore-label">' + sub.label + ' (' + sub.weight + ')</span>' +
          '<span class="subscore-value">' + Math.round(sub.value) + '/100</span>' +
        '</div>' +
        '<div class="subscore-bar-wrapper">' +
          '<div class="subscore-bar" style="width:' + sub.value + '%;background-color:' + sub.color + ';"></div>' +
        '</div>';
      breakdown.appendChild(item);
    }
  }

  // ---- Section E: Developer Insights ----
  function renderDeveloperInsights(insights) {
    var grid = document.getElementById('insights-grid');
    grid.innerHTML = '';

    if (!insights) return;

    var insightItems = [
      { icon: 'code-2', label: 'Primary Language', value: insights.primaryLanguage },
      { icon: 'globe', label: 'Polyglot Level', value: insights.polyglotLevel },
      { icon: 'hard-drive', label: 'Repository Scale', value: insights.repositoryScale },
      { icon: 'heart', label: 'Community Engagement', value: insights.communityEngagement },
      { icon: 'file-text', label: 'Documentation Signal', value: insights.documentationSignal },
      { icon: 'shield', label: 'License Adoption', value: insights.licenseAdoption },
      { icon: 'tag', label: 'Topic Coverage', value: insights.topicCoverage },
      { icon: 'git-fork', label: 'Fork Ratio', value: insights.forkRatio },
      { icon: 'refresh-cw', label: 'Freshness', value: insights.freshness },
      { icon: 'archive', label: 'Archive Rate', value: insights.archiveRate }
    ];

    for (var i = 0; i < insightItems.length; i++) {
      var item = insightItems[i];
      var card = el('div', { className: 'insight-card' });
      card.innerHTML =
        '<div class="insight-icon"><i data-lucide="' + escapeHtml(item.icon) + '"></i></div>' +
        '<div class="insight-content">' +
          '<div class="insight-label">' + escapeHtml(item.label) + '</div>' +
          '<div class="insight-value">' + escapeHtml(safeText(item.value)) + '</div>' +
        '</div>';
      grid.appendChild(card);
    }
  }

  // ---- Section F: Repository Creation Trend ----
  function renderRepoTrend(trendData) {
    var indicator = document.getElementById('trend-indicator');

    if (!trendData || !trendData.data || trendData.data.length === 0) {
      indicator.textContent = '';
      indicator.className = 'trend-badge';
      return;
    }

    var trend = trendData.trend;
    var symbols = { 'Increasing': '↑', 'Decreasing': '↓', 'Stable': '→' };
    var classes = { 'Increasing': 'trend-increasing', 'Decreasing': 'trend-decreasing', 'Stable': 'trend-stable' };

    indicator.textContent = (symbols[trend] || '→') + ' ' + trend;
    indicator.className = 'trend-badge ' + (classes[trend] || 'trend-stable');
  }

  // ---- Section G: Estimated Technology Focus ----
  function renderTechFocus(techData) {
    var container = document.getElementById('tech-categories');
    container.innerHTML = '';

    if (!techData || techData.length === 0) return;

    var categoryIcons = {
      'Frontend': 'monitor',
      'Backend': 'server',
      'Systems': 'cpu',
      'Data Science': 'bar-chart-3',
      'Mobile': 'smartphone',
      'DevOps': 'terminal'
    };

    for (var i = 0; i < techData.length; i++) {
      var item = techData[i];
      var color = Charts.getColor(i);
      var icon = categoryIcons[item.category] || 'circle';
      var row = el('div', { className: 'tech-category-item' });
      row.innerHTML =
        '<div class="tech-category-icon"><i data-lucide="' + escapeHtml(icon) + '"></i></div>' +
        '<span class="tech-category-name">' + escapeHtml(item.category) + '</span>' +
        '<div class="tech-category-bar-wrapper">' +
          '<div class="tech-category-bar" style="width:' + item.score + '%;background-color:' + color + ';"></div>' +
        '</div>' +
        '<span class="tech-category-score">' + item.score + '</span>';
      container.appendChild(row);
    }
  }

  // ---- Section H: Top Repositories ----
  var topReposState = {
    repos: [],
    visibleCount: 0,
    BATCH_SIZE: 6
  };

  function renderTopRepos(repos) {
    var grid = document.getElementById('top-repos-grid');
    var emptyState = document.getElementById('top-repos-empty');
    var actionsContainer = document.getElementById('top-repos-actions');

    grid.innerHTML = '';

    if (!repos || repos.length === 0) {
      grid.style.display = 'none';
      emptyState.style.display = 'flex';
      actionsContainer.style.display = 'none';
      return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    // Store sorted repos for "show more"
    topReposState.repos = repos.slice().sort(function (a, b) {
      return (b.stargazers_count || 0) - (a.stargazers_count || 0);
    });
    topReposState.visibleCount = Math.min(topReposState.BATCH_SIZE, topReposState.repos.length);

    // Render first batch
    for (var i = 0; i < topReposState.visibleCount; i++) {
      grid.appendChild(createRepoCard(topReposState.repos[i]));
    }

    // Show/hide "show more" button
    if (topReposState.repos.length > topReposState.visibleCount) {
      actionsContainer.style.display = 'flex';
    } else {
      actionsContainer.style.display = 'none';
    }
  }

  function showMoreRepos() {
    var grid = document.getElementById('top-repos-grid');
    var actionsContainer = document.getElementById('top-repos-actions');

    var start = topReposState.visibleCount;
    var end = Math.min(start + topReposState.BATCH_SIZE, topReposState.repos.length);

    for (var i = start; i < end; i++) {
      var card = createRepoCard(topReposState.repos[i]);
      card.style.animationDelay = ((i - start) * 60) + 'ms';
      card.classList.add('fade-in-card');
      grid.appendChild(card);
    }

    topReposState.visibleCount = end;

    if (topReposState.visibleCount >= topReposState.repos.length) {
      actionsContainer.style.display = 'none';
    }

    // Re-initialize Lucide icons for new cards
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  function createRepoCard(repo) {
    var card = el('div', { className: 'repo-card' });
    var langColor = getLangColor(repo.language || 'Unknown');
    var langName = repo.language || 'Unknown';
    var description = repo.description || 'No description provided.';
    var updatedDate = Compute.formatDate(repo.updated_at);

    card.innerHTML =
      '<div class="repo-card-header">' +
        '<i data-lucide="book-open"></i>' +
        '<div class="repo-card-name">' +
          '<a href="' + escapeHtml(repo.html_url) + '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(repo.name) + '</a>' +
        '</div>' +
      '</div>' +
      '<p class="repo-card-desc">' + escapeHtml(description) + '</p>' +
      '<div class="repo-card-meta">' +
        '<div class="repo-meta-item repo-language-badge">' +
          '<span class="repo-language-dot" style="background-color:' + langColor + ';"></span>' +
          '<span>' + escapeHtml(langName) + '</span>' +
        '</div>' +
        '<div class="repo-meta-item">' +
          '<i data-lucide="star"></i>' +
          '<span>' + Compute.formatNumber(repo.stargazers_count || 0) + '</span>' +
        '</div>' +
        '<div class="repo-meta-item">' +
          '<i data-lucide="git-fork"></i>' +
          '<span>' + Compute.formatNumber(repo.forks_count || 0) + '</span>' +
        '</div>' +
        '<div class="repo-meta-item">' +
          '<i data-lucide="clock"></i>' +
          '<span>' + escapeHtml(updatedDate) + '</span>' +
        '</div>' +
      '</div>';
    return card;
  }

  // ---- Section I: Account Age Analytics ----
  function renderAccountAge(ageData) {
    var grid = document.getElementById('age-analytics-grid');
    grid.innerHTML = '';

    if (!ageData) return;

    var items = [
      { icon: 'calendar', label: 'Account Age', value: ageData.accountAge },
      { icon: 'git-commit', label: 'First Repo Date', value: ageData.firstRepoDate },
      { icon: 'timer', label: 'Time To First Repo', value: ageData.timeToFirstRepo },
      { icon: 'calendar-check', label: 'Latest Repo Date', value: ageData.latestRepoDate },
      { icon: 'activity', label: 'Active Span', value: ageData.activeSpan },
      { icon: 'refresh-cw', label: 'Updated (12 Months)', value: ageData.recentRepos + ' repos' }
    ];

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var card = el('div', { className: 'age-card' });
      card.innerHTML =
        '<div class="age-card-icon"><i data-lucide="' + escapeHtml(item.icon) + '"></i></div>' +
        '<div class="age-card-content">' +
          '<div class="age-card-label">' + escapeHtml(item.label) + '</div>' +
          '<div class="age-card-value">' + escapeHtml(safeText(item.value)) + '</div>' +
        '</div>';
      grid.appendChild(card);
    }
  }

  // ---- Loading State ----
  function showLoading() {
    document.getElementById('loading-skeleton').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('error-area').style.display = 'none';
    document.getElementById('rate-limit-area').style.display = 'none';
    document.getElementById('info-notice-area').style.display = 'none';
  }

  function hideLoading() {
    document.getElementById('loading-skeleton').style.display = 'none';
  }

  // ---- Error State ----
  function renderError(error) {
    hideLoading();
    document.getElementById('dashboard').style.display = 'none';

    if (error instanceof GitHubAPI.RateLimitError) {
      renderRateLimit(error);
      return;
    }

    var errorArea = document.getElementById('error-area');
    var title, message, iconName, showRetry;

    if (error instanceof GitHubAPI.UserNotFoundError) {
      iconName = 'user-x';
      title = 'User Not Found';
      message = error.message + ' Please check the username and try again.';
      showRetry = false;
    } else if (error instanceof GitHubAPI.NetworkError) {
      iconName = 'wifi-off';
      title = 'Network Error';
      message = error.message;
      showRetry = true;
    } else {
      iconName = 'alert-circle';
      title = 'Something Went Wrong';
      message = error.message || 'An unexpected error occurred.';
      showRetry = true;
    }

    errorArea.innerHTML =
      '<i data-lucide="' + iconName + '" class="error-icon"></i>' +
      '<h3 class="error-title">' + escapeHtml(title) + '</h3>' +
      '<p class="error-message">' + escapeHtml(message) + '</p>' +
      (showRetry ? '<button class="error-retry-btn" id="error-retry-btn">Try Again</button>' : '');

    errorArea.style.display = 'block';

    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // ---- Rate Limit State ----
  var rateLimitInterval = null;

  function renderRateLimit(error) {
    var rateLimitArea = document.getElementById('rate-limit-area');
    document.getElementById('error-area').style.display = 'none';

    var resetTime = error.resetTime;

    rateLimitArea.innerHTML =
      '<i data-lucide="shield-alert" class="rate-limit-icon"></i>' +
      '<h3 class="rate-limit-title">Rate Limit Exceeded</h3>' +
      '<p class="rate-limit-message">GitHub API rate limit reached. Please wait for the reset.</p>' +
      '<div class="rate-limit-countdown" id="rate-limit-countdown"></div>';

    rateLimitArea.style.display = 'block';

    // Clear any existing interval
    if (rateLimitInterval) {
      clearInterval(rateLimitInterval);
      rateLimitInterval = null;
    }

    function updateCountdown() {
      var now = Math.floor(Date.now() / 1000);
      var remaining = resetTime - now;

      var countdownEl = document.getElementById('rate-limit-countdown');
      if (!countdownEl) {
        clearInterval(rateLimitInterval);
        rateLimitInterval = null;
        return;
      }

      if (remaining <= 0) {
        countdownEl.textContent = 'Rate limit has reset. You can try again.';
        clearInterval(rateLimitInterval);
        rateLimitInterval = null;
        return;
      }

      var minutes = Math.floor(remaining / 60);
      var seconds = remaining % 60;
      countdownEl.textContent =
        String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }

    updateCountdown();
    rateLimitInterval = setInterval(updateCountdown, 1000);

    // Re-initialize icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // ---- Show Dashboard ----
  function showDashboard() {
    hideLoading();
    document.getElementById('error-area').style.display = 'none';
    document.getElementById('rate-limit-area').style.display = 'none';
    document.getElementById('dashboard').style.display = 'flex';
  }

  // ---- Clear Dashboard ----
  function clearDashboard() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('loading-skeleton').style.display = 'none';
    document.getElementById('error-area').style.display = 'none';
    document.getElementById('rate-limit-area').style.display = 'none';
    document.getElementById('info-notice-area').style.display = 'none';
  }

  // ---- Reinitialize Lucide Icons ----
  function refreshIcons() {
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  // ---- Public API ----
  window.Render = {
    renderProfile: renderProfile,
    renderRepoAnalytics: renderRepoAnalytics,
    renderLanguageDistribution: renderLanguageDistribution,
    renderOpenSourceScore: renderOpenSourceScore,
    renderDeveloperInsights: renderDeveloperInsights,
    renderRepoTrend: renderRepoTrend,
    renderTechFocus: renderTechFocus,
    renderTopRepos: renderTopRepos,
    showMoreRepos: showMoreRepos,
    renderAccountAge: renderAccountAge,
    showLoading: showLoading,
    hideLoading: hideLoading,
    renderError: renderError,
    showDashboard: showDashboard,
    clearDashboard: clearDashboard,
    refreshIcons: refreshIcons
  };

})();
