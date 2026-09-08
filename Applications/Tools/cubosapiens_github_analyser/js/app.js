/* ============================================================
   APPLICATION ORCHESTRATOR
   Wires search, URL params, state management
   Namespace: window.App
   ============================================================ */

(function () {
  'use strict';

  // ---- State ----
  var isAnalyzing = false;

  // ---- DOM References ----
  function getSearchInput() { return document.getElementById('search-input'); }
  function getSearchForm() { return document.getElementById('search-form'); }
  function getSearchButton() { return document.getElementById('search-button'); }
  function getSearchButtonText() { return document.querySelector('.search-button-text'); }
  function getSearchButtonSpinner() { return document.querySelector('.search-button-spinner'); }
  function getSearchError() { return document.getElementById('search-error'); }
  function getShowMoreBtn() { return document.getElementById('show-more-repos'); }
  function getRetryBtn() { return document.getElementById('error-retry-btn'); }

  // ---- Username Validation ----
  function validateUsername(username) {
    if (!username || username.trim() === '') {
      return { valid: false, message: 'Please enter a GitHub username.' };
    }

    var trimmed = username.trim();

    // GitHub username rules: alphanumeric + hyphens, max 39 chars
    // Cannot start or end with hyphen, no consecutive hyphens
    if (trimmed.length > 39) {
      return { valid: false, message: 'GitHub usernames are limited to 39 characters.' };
    }

    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(trimmed)) {
      if (trimmed.length === 1 && /^[a-zA-Z0-9]$/.test(trimmed)) {
        return { valid: true, username: trimmed };
      }
      return { valid: false, message: 'Invalid username format. Use letters, numbers, and hyphens.' };
    }

    if (/--/.test(trimmed)) {
      return { valid: false, message: 'GitHub usernames cannot contain consecutive hyphens.' };
    }

    return { valid: true, username: trimmed };
  }

  // ---- Search Button State ----
  function setButtonLoading(loading) {
    var btn = getSearchButton();
    var text = getSearchButtonText();
    var spinner = getSearchButtonSpinner();

    if (loading) {
      btn.disabled = true;
      if (text) text.style.display = 'none';
      if (spinner) spinner.style.display = 'inline-flex';
    } else {
      btn.disabled = false;
      if (text) text.style.display = 'inline';
      if (spinner) spinner.style.display = 'none';
    }
  }

  // ---- Show Inline Search Error ----
  function showSearchError(message) {
    var errorEl = getSearchError();
    if (errorEl) {
      errorEl.textContent = message || '';
    }
  }

  function clearSearchError() {
    showSearchError('');
  }

  // ---- URL Management ----
  function updateURL(username) {
    if (username) {
      history.replaceState(null, '', '?user=' + encodeURIComponent(username));
    } else {
      history.replaceState(null, '', window.location.pathname);
    }
  }

  function getUserFromURL() {
    var params = new URLSearchParams(window.location.search);
    return params.get('user') || '';
  }

  // ---- Core Analyze Function ----
  function analyzeUser(username) {
    if (isAnalyzing) return;

    var validation = validateUsername(username);
    if (!validation.valid) {
      showSearchError(validation.message);
      return;
    }

    var cleanUsername = validation.username;
    isAnalyzing = true;
    clearSearchError();
    setButtonLoading(true);
    Render.clearDashboard();
    Render.showLoading();

    // Initialize Lucide icons for skeleton
    Render.refreshIcons();

    // Update URL
    updateURL(cleanUsername);

    // Create new AbortController
    var signal = GitHubAPI.createController();

    // Fetch profile and repos in parallel
    Promise.all([
      GitHubAPI.fetchProfile(cleanUsername, signal),
      GitHubAPI.fetchAllRepos(cleanUsername, signal)
    ])
    .then(function (results) {
      var profile = results[0];
      var repoResult = results[1];
      var allRepos = repoResult.repos;
      var capped = repoResult.capped;

      // Compute all data
      var originalRepos = Compute.getOriginalRepos(allRepos);
      var stats = Compute.getRepoStats(originalRepos);
      var langData = Compute.getLanguageDistribution(originalRepos);
      var scoreData = Compute.getOpenSourceScore(profile, originalRepos);
      var insights = Compute.getDeveloperInsights(profile, originalRepos, allRepos);
      var trendData = Compute.getRepoCreationTrend(originalRepos);
      var techData = Compute.getTechnologyFocus(originalRepos);
      var ageData = Compute.getAccountAgeAnalytics(profile, originalRepos);

      // Determine repos for "Top Repos" section
      var topReposList;
      if (originalRepos.length > 0) {
        topReposList = originalRepos;
      } else if (allRepos.length > 0) {
        // Fallback to forks only if no originals exist
        topReposList = allRepos;
      } else {
        topReposList = [];
      }

      // Destroy existing charts before rendering new ones
      Charts.destroyAllCharts();

      // Render all sections
      Render.renderProfile(profile);
      Render.renderRepoAnalytics(stats, capped);
      Render.renderLanguageDistribution(langData);
      Render.renderOpenSourceScore(scoreData);
      Render.renderDeveloperInsights(insights);
      Render.renderRepoTrend(trendData);
      Render.renderTechFocus(techData);
      Render.renderTopRepos(topReposList);
      Render.renderAccountAge(ageData);

      // Show dashboard
      Render.showDashboard();

      // Refresh all Lucide icons in newly rendered content
      Render.refreshIcons();

      // Render charts (after DOM is updated)
      requestAnimationFrame(function () {
        Charts.renderDoughnutChart('language-chart', langData);
        Charts.renderBarChart('trend-chart', trendData);
        Charts.renderRadarChart('tech-chart', techData);
      });
    })
    .catch(function (error) {
      // Silently ignore AbortError
      if (error && error.name === 'AbortError') {
        return;
      }
      Render.renderError(error);
      Render.refreshIcons();
    })
    .finally(function () {
      isAnalyzing = false;
      setButtonLoading(false);
    });
  }

  // ---- Event Listeners ----
  function init() {
    // Search form submission
    var form = getSearchForm();
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = getSearchInput();
        if (input) {
          analyzeUser(input.value.trim());
        }
      });
    }

    // Clear error on input
    var input = getSearchInput();
    if (input) {
      input.addEventListener('input', function () {
        clearSearchError();
      });
    }

    // Show More Repos button
    var showMoreBtn = getShowMoreBtn();
    if (showMoreBtn) {
      showMoreBtn.addEventListener('click', function () {
        Render.showMoreRepos();
      });
    }

    // Retry button (delegated — it's dynamically created)
    document.addEventListener('click', function (e) {
      if (e.target && e.target.id === 'error-retry-btn') {
        var retryInput = getSearchInput();
        if (retryInput && retryInput.value.trim()) {
          analyzeUser(retryInput.value.trim());
        }
      }
    });

    // Keyboard: Enter in search input is handled by form submit
    // Additional: Escape to clear input
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          input.value = '';
          clearSearchError();
          input.blur();
        }
      });
    }

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // Check URL for ?user= parameter and auto-analyze
    var urlUser = getUserFromURL();
    if (urlUser) {
      var searchInput = getSearchInput();
      if (searchInput) {
        searchInput.value = urlUser;
      }
      analyzeUser(urlUser);
    }
  }

  // ---- Boot ----
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ---- Public API (for debugging/testing) ----
  window.App = {
    analyzeUser: analyzeUser,
    validateUsername: validateUsername
  };

})();
