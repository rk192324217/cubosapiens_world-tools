import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

export interface TestResult {
  suiteName: string;
  testName: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED';
  durationMs: number;
  errorMessage?: string;
  screenshotPath?: string;
}

export class SeleniumExcelReporter {
  private results: TestResult[] = [];
  private reportDir: string;
  private reportFilename: string;

  constructor(reportFilename = 'selenium-report.xlsx') {
    this.reportDir = path.resolve(__dirname, '../reports');
    this.reportFilename = reportFilename;

    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }
  }

  /**
   * Adds a test execution result to the queue.
   */
  public addResult(result: TestResult): void {
    this.results.push(result);
  }

  /**
   * Generates the multi-sheet Excel report.
   */
  public async generateReport(): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Cubosapiens Automation Framework';
    workbook.created = new Date();

    // -------------------------------------------------------------
    // SHEET 1: Test Summary
    // -------------------------------------------------------------
    const summarySheet = workbook.addWorksheet('Summary');
    
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const failed = this.results.filter(r => r.status === 'FAILED').length;
    const skipped = this.results.filter(r => r.status === 'SKIPPED').length;
    const totalDurationSec = (this.results.reduce((acc, r) => acc + r.durationMs, 0) / 1000).toFixed(2);

    summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 25 },
      { header: 'Value', key: 'value', width: 20 }
    ];

    summarySheet.addRows([
      { metric: 'Total Tests Executed', value: total },
      { metric: 'Passed', value: passed },
      { metric: 'Failed', value: failed },
      { metric: 'Skipped', value: skipped },
      { metric: 'Pass Rate (%)', value: total > 0 ? `${((passed / total) * 100).toFixed(2)}%` : '0%' },
      { metric: 'Total Duration (s)', value: `${totalDurationSec}s` },
      { metric: 'Generated At', value: new Date().toLocaleString() }
    ]);

    // Format Summary Header
    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1F4E79' }
    };

    // -------------------------------------------------------------
    // SHEET 2: Detailed Results
    // -------------------------------------------------------------
    const detailSheet = workbook.addWorksheet('Test Details');

    detailSheet.columns = [
      { header: '#', key: 'index', width: 5 },
      { header: 'Suite Name', key: 'suiteName', width: 25 },
      { header: 'Test Name', key: 'testName', width: 35 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Duration (ms)', key: 'durationMs', width: 15 },
      { header: 'Error Details', key: 'errorMessage', width: 50 }
    ];

    this.results.forEach((res, idx) => {
      const row = detailSheet.addRow({
        index: idx + 1,
        suiteName: res.suiteName,
        testName: res.testName,
        status: res.status,
        durationMs: res.durationMs,
        errorMessage: res.errorMessage || 'N/A'
      });

      // Highlight Pass/Fail Status
      const statusCell = row.getCell('status');
      if (res.status === 'PASSED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } };
        statusCell.font = { color: { argb: '006100' }, bold: true };
      } else if (res.status === 'FAILED') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC7CE' } };
        statusCell.font = { color: { argb: '9C0006' }, bold: true };
      }
    });

    detailSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    detailSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1F4E79' }
    };

    // -------------------------------------------------------------
    // SHEET 3: Screenshots Log
    // -------------------------------------------------------------
    const screenshotSheet = workbook.addWorksheet('Screenshots Log');

    screenshotSheet.columns = [
      { header: 'Test Name', key: 'testName', width: 35 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Screenshot File', key: 'screenshotPath', width: 60 }
    ];

    const failedOrCaptured = this.results.filter(r => r.screenshotPath);
    if (failedOrCaptured.length === 0) {
      screenshotSheet.addRow({
        testName: 'N/A',
        status: 'N/A',
        screenshotPath: 'No screenshots were generated during this run.'
      });
    } else {
      failedOrCaptured.forEach(res => {
        screenshotSheet.addRow({
          testName: res.testName,
          status: res.status,
          screenshotPath: res.screenshotPath
        });
      });
    }

    screenshotSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    screenshotSheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '1F4E79' }
    };

    // Save Workbook
    const outputPath = path.join(this.reportDir, this.reportFilename);
    await workbook.xlsx.writeFile(outputPath);
    console.log(`\n[Excel Reporter] Report generated successfully at: ${outputPath}`);
    
    return outputPath;
  }
}