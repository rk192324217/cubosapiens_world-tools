import * as ExcelJS from 'exceljs';
import * as fs from 'fs';
import * as path from 'path';

export class ExcelReporter {
  private workbook: ExcelJS.Workbook;
  private summarySheet: ExcelJS.Worksheet;
  private detailsSheet: ExcelJS.Worksheet;
  private screenshotsSheet: ExcelJS.Worksheet;
  
  private totalTests = 0;
  private passedTests = 0;
  private failedTests = 0;
  private startTime: number;

  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.summarySheet = this.workbook.addWorksheet('Summary');
    this.detailsSheet = this.workbook.addWorksheet('Test Details');
    this.screenshotsSheet = this.workbook.addWorksheet('Screenshots Log');
    this.startTime = Date.now();
    
    this.initSheets();
  }

  private initSheets() {
    this.summarySheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 20 }
    ];

    this.detailsSheet.name = 'Selenium Web Tests';
    this.detailsSheet.columns = [
      { header: '', key: 'empty', width: 5 },
      { header: 'Test Case ID', key: 'testId', width: 15 },
      { header: 'Module / Feature', key: 'module', width: 20 },
      { header: 'Test Title', key: 'title', width: 40 },
      { header: 'Description', key: 'desc', width: 40 },
      { header: 'Pre-Conditions', key: 'precond', width: 30 },
      { header: 'Test Steps', key: 'steps', width: 40 },
      { header: 'Expected Result', key: 'expected', width: 40 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'Execution Type', key: 'execType', width: 15 },
      { header: 'Status', key: 'status', width: 10 }
    ];

    this.screenshotsSheet.columns = [
      { header: 'Test Name', key: 'testName', width: 30 },
      { header: 'Screenshot Status', key: 'screenshotStatus', width: 20 }
    ];
  }

  public addTestResult(suite: string, testName: string, status: 'pass' | 'fail', duration: number, errorTrace?: string) {
    this.totalTests++;
    if (status === 'pass') this.passedTests++;
    else this.failedTests++;

    this.detailsSheet.addRow({
      empty: '',
      testId: `TC-${String(this.totalTests).padStart(4, '0')}`,
      module: suite,
      title: testName,
      desc: `Automated verification of ${testName} in ${suite}`,
      precond: 'Web page loaded successfully',
      steps: '1. Launch browser\n2. Navigate to element\n3. Assert property',
      expected: 'Assertion evaluates to true',
      priority: 'High',
      execType: 'Automated',
      status: status.toUpperCase()
    });
  }

  public addScreenshot(testName: string, base64Data: string) {
    const reportDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    const safeTestName = testName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `screenshot_${safeTestName}_${Date.now()}.png`;
    const filepath = path.join(reportDir, filename);
    
    fs.writeFileSync(filepath, base64Data, 'base64');
    
    this.screenshotsSheet.addRow({
      testName,
      screenshotPath: filepath
    });
  }

  public async finalize() {
    const duration = Date.now() - this.startTime;
    const passRate = this.totalTests > 0 ? (this.passedTests / this.totalTests) * 100 : 0;

    this.summarySheet.addRows([
      { metric: 'Total Tests', value: this.totalTests },
      { metric: 'Passed', value: this.passedTests },
      { metric: 'Failed', value: this.failedTests },
      { metric: 'Pass Rate (%)', value: passRate.toFixed(2) },
      { metric: 'Duration (ms)', value: duration }
    ]);

    const reportDir = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    await this.workbook.xlsx.writeFile(path.join(reportDir, 'selenium-report.xlsx'));
  }
}
