const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function generateReport() {
    const summaryPath = path.join(__dirname, 'reports', 'k6-summary.json');
    if (!fs.existsSync(summaryPath)) {
        console.error('k6-summary.json not found!');
        return;
    }

    const data = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    const workbook = new ExcelJS.Workbook();
    
    // Sheet 1: Summary Metrics
    const summarySheet = workbook.addWorksheet('Summary Metrics');
    summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 25 },
        { header: 'Value', key: 'value', width: 20 }
    ];

    const metrics = data.metrics;
    const reqDuration = metrics.http_req_duration?.values || {};
    const reqFailed = metrics.http_req_failed?.values || { rate: 0 };
    
    summarySheet.addRows([
        { metric: 'Total Requests', value: metrics.http_reqs?.values.count || 0 },
        { metric: 'RPS', value: metrics.http_reqs?.values.rate || 0 },
        { metric: 'Avg Latency (ms)', value: reqDuration.avg || 0 },
        { metric: 'Min Latency (ms)', value: reqDuration.min || 0 },
        { metric: 'Max Latency (ms)', value: reqDuration.max || 0 },
        { metric: 'Error Rate (%)', value: (reqFailed.rate * 100).toFixed(2) }
    ]);

    // Sheet 2: Per-Endpoint Metrics
    const endpointSheet = workbook.addWorksheet('Per-Endpoint Metrics');
    endpointSheet.columns = [
        { header: 'Endpoint', key: 'endpoint', width: 30 },
        { header: 'Requests', key: 'requests', width: 15 },
        { header: 'Avg Duration', key: 'avg', width: 15 },
        { header: 'P95 Duration', key: 'p95', width: 15 }
    ];

    // Simple parser for endpoints if grouped (k6 tags not perfectly exposed in standard summary JSON without custom groups/tags setup,
    // assuming standard output or iterating through expected tags if present).
    // The default k6 JSON summary puts tags in metrics if we configured custom metrics per tag, but we used standard metrics.
    // For this example, we populate a placeholder if exact per-URL stats are missing in standard JSON.
    endpointSheet.addRow({ endpoint: 'Health Check (/)', requests: 'N/A', avg: 'N/A', p95: 'N/A' });
    endpointSheet.addRow({ endpoint: 'Tools API (/api/tools)', requests: 'N/A', avg: 'N/A', p95: 'N/A' });

    // Sheet 3: Error Breakdown
    const errorSheet = workbook.addWorksheet('Error Breakdown');
    errorSheet.columns = [
        { header: 'Status Code', key: 'code', width: 15 },
        { header: 'Count', key: 'count', width: 15 }
    ];
    // In k6, errors by status code might need custom metrics. We populate dummy data if missing.
    errorSheet.addRow({ code: '> 399', count: metrics.http_req_failed?.values.passes || 0 });

    const reportPath = path.join(__dirname, 'reports', 'load-report.xlsx');
    await workbook.xlsx.writeFile(reportPath);
    console.log(`Load report generated at ${reportPath}`);
}

generateReport().catch(console.error);
