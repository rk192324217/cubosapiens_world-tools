/* ============================================================
   GITHUB API LAYER
   Fetch, pagination, caching, AbortController
   Namespace: window.GitHubAPI
   ============================================================ */

(function () {
  'use strict';

  // ---- Constants ----
  var BASE_URL = 'https://api.github.com';
  var MAX_PAGES = 10;
  var CACHE_TTL = 10 * 60 * 1000; // 10 minutes
  var CACHE_KEY_PROFILE = 'github-profile-';
  var CACHE_KEY_REPOS = 'github-repos-';

  // ---- AbortController State ----
  var currentController = null;

  // ---- Custom Error Classes ----
  function UserNotFoundError(username) {
    this.name = 'UserNotFoundError';
    this.message = 'User "' + username + '" was not found on GitHub.';
    this.username = username;
  }
  UserNotFoundError.prototype = Object.create(Error.prototype);
  UserNotFoundError.prototype.constructor = UserNotFoundError;

  function RateLimitError(resetTime) {
    this.name = 'RateLimitError';
    this.message = 'GitHub API rate limit exceeded.';
    this.resetTime = resetTime; // Unix timestamp (seconds)
  }
  RateLimitError.prototype = Object.create(Error.prototype);
  RateLimitError.prototype.constructor = RateLimitError;

  function NetworkError(message) {
    this.name = 'NetworkError';
    this.message = message || 'A network error occurred. Please check your connection.';
  }
  NetworkError.prototype = Object.create(Error.prototype);
  NetworkError.prototype.constructor = NetworkError;

  // ---- Cache Helpers ----
  function cacheGet(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.timestamp || !parsed.data) return null;
      if (Date.now() - parsed.timestamp > CACHE_TTL) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.data;
    } catch (e) {
      try { localStorage.removeItem(key); } catch (ignored) {}
      return null;
    }
  }

  function cacheSet(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
    } catch (e) {
      // Storage full or unavailable — silently ignore
    }
  }

  // ---- Link Header Parsing ----
  function parseLinkHeader(header) {
    var result = { next: null };
    if (!header) return result;

    var parts = header.split(',');
    for (var i = 0; i < parts.length; i++) {
      var section = parts[i].trim();
      var match = section.match(/<([^>]+)>;\s*rel="([^"]+)"/);
      if (match && match[2] === 'next') {
        result.next = match[1];
      }
    }
    return result;
  }

  // ---- Response Error Handling ----
  function handleResponseError(response, username) {
    if (response.status === 404) {
      throw new UserNotFoundError(username);
    }

    if (response.status === 403 || response.status === 429) {
      var remaining = response.headers.get('X-RateLimit-Remaining');
      if (remaining === '0' || remaining === 0) {
        var resetHeader = response.headers.get('X-RateLimit-Reset');
        var resetTime = resetHeader ? parseInt(resetHeader, 10) : Math.floor(Date.now() / 1000) + 60;
        throw new RateLimitError(resetTime);
      }
    }

    if (!response.ok) {
      throw new NetworkError('GitHub API returned status ' + response.status);
    }
  }

  // ---- AbortController Management ----
  function createController() {
    if (currentController) {
      currentController.abort();
    }
    currentController = new AbortController();
    return currentController.signal;
  }

  function getSignal() {
    return currentController ? currentController.signal : null;
  }

  // ---- Fetch Profile ----
  function fetchProfile(username, signal) {
    var cacheKey = CACHE_KEY_PROFILE + username.toLowerCase();
    var cached = cacheGet(cacheKey);
    if (cached) {
      return Promise.resolve(cached);
    }

    return fetch(BASE_URL + '/users/' + encodeURIComponent(username), {
      signal: signal,
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    })
    .then(function (response) {
      handleResponseError(response, username);
      return response.json();
    })
    .then(function (data) {
      cacheSet(cacheKey, data);
      return data;
    })
    .catch(function (error) {
      if (error.name === 'AbortError') {
        // Silently ignore abort errors — never surface to UI
        return Promise.reject(error);
      }
      if (error instanceof UserNotFoundError ||
          error instanceof RateLimitError ||
          error instanceof NetworkError) {
        return Promise.reject(error);
      }
      // Wrap unknown errors as NetworkError
      return Promise.reject(new NetworkError(error.message || 'Failed to fetch profile.'));
    });
  }

  // ---- Fetch All Repos (paginated) ----
  function fetchAllRepos(username, signal) {
    var cacheKey = CACHE_KEY_REPOS + username.toLowerCase();
    var cached = cacheGet(cacheKey);
    if (cached) {
      return Promise.resolve(cached);
    }

    var allRepos = [];
    var capped = false;

    function fetchPage(page) {
      var url = BASE_URL + '/users/' + encodeURIComponent(username) +
                '/repos?per_page=100&page=' + page;

      return fetch(url, {
        signal: signal,
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      })
      .then(function (response) {
        handleResponseError(response, username);
        var linkHeader = response.headers.get('Link');
        var links = parseLinkHeader(linkHeader);
        return response.json().then(function (repos) {
          return { repos: repos, hasNext: links.next !== null };
        });
      })
      .then(function (result) {
        allRepos = allRepos.concat(result.repos);

        // Check if we should continue fetching
        if (result.hasNext && page < MAX_PAGES) {
          return fetchPage(page + 1);
        }

        // If there were more pages but we hit the cap
        if (result.hasNext && page >= MAX_PAGES) {
          capped = true;
        }

        return null; // done
      });
    }

    return fetchPage(1)
    .then(function () {
      var result = { repos: allRepos, capped: capped };
      cacheSet(cacheKey, result);
      return result;
    })
    .catch(function (error) {
      if (error.name === 'AbortError') {
        return Promise.reject(error);
      }
      if (error instanceof UserNotFoundError ||
          error instanceof RateLimitError ||
          error instanceof NetworkError) {
        return Promise.reject(error);
      }
      return Promise.reject(new NetworkError(error.message || 'Failed to fetch repositories.'));
    });
  }

  // ---- Public API ----
  window.GitHubAPI = {
    fetchProfile: fetchProfile,
    fetchAllRepos: fetchAllRepos,
    createController: createController,
    getSignal: getSignal,
    UserNotFoundError: UserNotFoundError,
    RateLimitError: RateLimitError,
    NetworkError: NetworkError
  };

})();
