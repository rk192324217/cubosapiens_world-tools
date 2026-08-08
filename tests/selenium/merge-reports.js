const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Merges all per-suite Selenium Excel reports into a single 300-row master report
async function mergeReports() {
  const reportsDir = path.join(__dirname, 'reports');
  const files = fs.readdirSync(reportsDir).filter(
    f => f.startsWith('selenium-') && f.endsWith('.xlsx') && f !== 'selenium-report.xlsx'
  );

  if (files.length === 0) {
    console.log('No per-suite selenium reports found to merge.');
    return;
  }

  const master = new ExcelJS.Workbook();
  const summarySheet = master.addWorksheet('Summary');
  const detailsSheet = master.addWorksheet('Selenium Web Tests');

  summarySheet.columns = [
    { header: 'Metric', key: 'metric', width: 25 },
    { header: 'Value', key: 'value', width: 20 },
  ];

  detailsSheet.columns = [
    { header: '', key: 'empty', width: 5 },
    { header: 'Test Case ID', key: 'testId', width: 15 },
    { header: 'Module / Feature', key: 'module', width: 20 },
    { header: 'Test Title', key: 'title', width: 50 },
    { header: 'Description', key: 'desc', width: 40 },
    { header: 'Pre-Conditions', key: 'precond', width: 30 },
    { header: 'Test Steps', key: 'steps', width: 40 },
    { header: 'Expected Result', key: 'expected', width: 40 },
    { header: 'Priority', key: 'priority', width: 10 },
    { header: 'Execution Type', key: 'execType', width: 15 },
    { header: 'Status', key: 'status', width: 10 },
  ];

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let globalRowId = 1;

  for (const file of files.sort()) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(path.join(reportsDir, file));

    const sheet = wb.getWorksheet('Selenium Web Tests') || wb.getWorksheet('Test Details');
    if (!sheet) continue;

    sheet.eachRow((row, rowNum) => {
      if (rowNum === 1) return;
      const values = row.values;
      const status = String(values[11] || '').trim();
      if (!status) return;

      totalTests++;
      if (status === 'PASS') totalPassed++;
      else totalFailed++;

      detailsSheet.addRow({
        empty: '',
        testId: `TC-${String(globalRowId++).padStart(4, '0')}`,
        module: values[3],
        title: values[4],
        desc: values[5],
        precond: values[6],
        steps: values[7],
        expected: values[8],
        priority: values[9],
        execType: values[10],
        status: status,
      });
    });
  }

  const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : '0.00';
  summarySheet.addRows([
    { metric: 'Total Test Cases', value: totalTests },
    { metric: 'Passed', value: totalPassed },
    { metric: 'Failed', value: totalFailed },
    { metric: 'Pass Rate (%)', value: passRate },
    { metric: 'Test Suites', value: files.length },
    { metric: 'Report Generated At', value: new Date().toISOString() },
  ]);

  const outPath = path.join(reportsDir, 'selenium-report.xlsx');
  await master.xlsx.writeFile(outPath);
  console.log(`\n✅ Master Selenium Report: ${outPath}`);
  console.log(`   Total rows: ${totalTests} | Pass: ${totalPassed} | Fail: ${totalFailed} | Pass Rate: ${passRate}%`);
}

mergeReports().catch(err => {
  console.error('Failed to merge selenium reports:', err);
  process.exit(1);
});
