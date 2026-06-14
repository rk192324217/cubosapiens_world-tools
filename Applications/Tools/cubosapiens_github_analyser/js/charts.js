/* ============================================================
   CHART.JS RENDERING LAYER
   Doughnut, Bar, Radar charts with custom palette
   Namespace: window.Charts
   ============================================================ */

(function () {
  'use strict';

  // ---- Chart Color Palette ----
  var COLORS = [
    '#22C55E', // green
    '#3B82F6', // blue
    '#8B5CF6', // purple
    '#F59E0B', // amber
    '#06B6D4', // cyan
    '#EC4899', // pink
    '#F43F5E'  // rose
  ];

  function getColor(index) {
    return COLORS[index % COLORS.length];
  }

  // ---- Chart Instances Tracking ----
  var instances = {
    doughnut: null,
    bar: null,
    radar: null
  };

  // ---- Destroy All Charts ----
  function destroyAllCharts() {
    for (var key in instances) {
      if (instances.hasOwnProperty(key) && instances[key]) {
        instances[key].destroy();
        instances[key] = null;
      }
    }
  }

  // ---- Configure Chart.js Defaults ----
  function configureDefaults() {
    if (typeof Chart === 'undefined') return;

    Chart.defaults.color = '#9898A6';
    Chart.defaults.font.family = "'Fira Sans', sans-serif";
    Chart.defaults.font.size = 12;
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = true;

    // Tooltip defaults
    Chart.defaults.plugins.tooltip.backgroundColor = '#22222F';
    Chart.defaults.plugins.tooltip.titleColor = '#E8E8ED';
    Chart.defaults.plugins.tooltip.bodyColor = '#9898A6';
    Chart.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.titleFont = { family: "'Fira Sans', sans-serif", weight: '600' };
    Chart.defaults.plugins.tooltip.bodyFont = { family: "'Fira Code', monospace" };

    // Legend defaults
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.pointStyle = 'circle';
    Chart.defaults.plugins.legend.labels.padding = 16;
  }

  // ---- Render Doughnut Chart (Language Distribution) ----
  function renderDoughnutChart(canvasId, langData) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var emptyState = document.getElementById(canvasId.replace('-chart', '-chart-empty'));

    // Handle empty dataset
    if (!langData || langData.length === 0) {
      canvas.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    canvas.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    var labels = langData.map(function (item) { return item.language; });
    var data = langData.map(function (item) { return item.count; });
    var backgroundColors = langData.map(function (item, index) {
      return getColor(index);
    });

    var ctx = canvas.getContext('2d');

    instances.doughnut = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderColor: '#151520',
          borderWidth: 2,
          hoverBorderColor: '#151520',
          hoverBorderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        cutout: '65%',
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false // Custom HTML legend rendered by Render module
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                var total = context.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                var value = context.parsed;
                var pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                return context.label + ': ' + value + ' repos (' + pct + '%)';
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: false,
          duration: 800,
          easing: 'easeOutQuart'
        }
      }
    });
  }

  // ---- Render Bar Chart (Repository Creation Trend) ----
  function renderBarChart(canvasId, trendData) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var emptyState = document.getElementById(canvasId.replace('-chart', '-chart-empty'));

    // Handle empty dataset
    if (!trendData || !trendData.data || trendData.data.length === 0) {
      canvas.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    canvas.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    var labels = trendData.data.map(function (item) { return String(item.year); });
    var data = trendData.data.map(function (item) { return item.count; });
    var backgroundColors = trendData.data.map(function (item, index) {
      return getColor(index);
    });

    var ctx = canvas.getContext('2d');

    instances.bar = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Repositories',
          data: data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(function (c) { return c; }),
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 50
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.parsed.y + ' repositories';
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: "'Fira Code', monospace",
                size: 11
              }
            },
            border: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              precision: 0,
              font: {
                family: "'Fira Code', monospace",
                size: 11
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              drawBorder: false
            },
            border: {
              display: false
            }
          }
        },
        animation: {
          duration: 800,
          easing: 'easeOutQuart'
        }
      }
    });
  }

  // ---- Render Radar Chart (Technology Focus) ----
  function renderRadarChart(canvasId, techData) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;

    var emptyState = document.getElementById(canvasId.replace('-chart', '-chart-empty'));

    // Handle empty dataset
    if (!techData || techData.length === 0) {
      canvas.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    // Check if all scores are 0
    var allZero = techData.every(function (item) { return item.score === 0; });
    if (allZero) {
      canvas.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    canvas.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';

    var labels = techData.map(function (item) { return item.category; });
    var data = techData.map(function (item) { return item.score; });

    var ctx = canvas.getContext('2d');

    instances.radar = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Technology Focus',
          data: data,
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          borderColor: '#22C55E',
          borderWidth: 2,
          pointBackgroundColor: '#22C55E',
          pointBorderColor: '#151520',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#22C55E',
          pointHoverBorderColor: '#fff',
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return context.label + ': ' + context.parsed.r + '/100';
              }
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20,
              display: true,
              backdropColor: 'transparent',
              font: {
                family: "'Fira Code', monospace",
                size: 10
              },
              color: 'rgba(255, 255, 255, 0.3)'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.06)',
              circular: true
            },
            angleLines: {
              color: 'rgba(255, 255, 255, 0.06)'
            },
            pointLabels: {
              font: {
                family: "'Fira Sans', sans-serif",
                size: 12,
                weight: '500'
              },
              color: '#9898A6'
            }
          }
        },
        animation: {
          duration: 800,
          easing: 'easeOutQuart'
        }
      }
    });
  }

  // ---- Initialize ----
  configureDefaults();

  // ---- Public API ----
  window.Charts = {
    COLORS: COLORS,
    getColor: getColor,
    destroyAllCharts: destroyAllCharts,
    renderDoughnutChart: renderDoughnutChart,
    renderBarChart: renderBarChart,
    renderRadarChart: renderRadarChart
  };

})();
