// utils/reporter.js

import chalk from 'chalk';
import { createWriteStream, mkdirSync, existsSync } from 'fs';

if (!existsSync('reports/logs')) {
  mkdirSync('reports/logs', { recursive: true });
}

const logFile = createWriteStream(
  'reports/logs/terminal-report.log',
  { flags: 'w' }
);

function log(line = '') {

  console.log(line);

  logFile.write(
    line.replace(/\x1b\[[0-9;]*m/g, '') + '\n'
  );
}

function ms(d) {

  return d < 1000
    ? `${d}ms`
    : `${(d / 1000).toFixed(2)}s`;
}

function pad(str, len) {

  str = String(str ?? '');

  const clean =
    str.replace(/\x1B\[[0-9;]*m/g, '');

  const visibleLength = clean.length;

  return visibleLength >= len
    ? clean.slice(0, len)
    : clean + ' '.repeat(len - visibleLength);
}

function getId(title) {

  return title.match(/\[([A-Z]+-\d+)\]/)?.[1] ?? '—';
}

function getDesc(title) {

  return title.match(/\]\s+(.+)$/)?.[1]?.trim()
    ?? title.trim();
}

function getReason(result) {

  const msg =
    result.errors?.[0]?.message ?? '';

  if (!msg) return '—';

  if (
    msg.includes('Timeout') ||
    msg.includes('timeout')
  ) {
    return 'Element wait timeout exceeded';
  }

  const exp =
    msg.match(/Expected[:\s]+(.+)/i)?.[1]
      ?.trim()
      ?.slice(0, 50);

  const rec =
    msg.match(/Received[:\s]+(.+)/i)?.[1]
      ?.trim()
      ?.slice(0, 50);

  if (exp && rec) {

    return `Expected: ${exp} | Got: ${rec}`;
  }

  return msg
    .split('\n')
    .find(l => l.trim())
    ?.trim()
    ?.slice(0, 80) ?? '—';
}

export default class Reporter {

  constructor() {

    this.results = [];
    this.startTime = Date.now();
  }

  onBegin(config, suite) {

    const browser =
      config.projects?.[0]?.name ?? 'chromium';

    log('');

    log(
      chalk.cyan.bold(
        '┌──────────────────────────────────────────────────────────────┐'
      )
    );

    log(
      chalk.bgMagenta.white.bold(
        '│         🚀 ACCESS.ME AUTOMATION EXECUTION STARTED 🚀         │'
      )
    );

    log(
      chalk.cyan.bold(
        '└──────────────────────────────────────────────────────────────┘'
      )
    );

    log('');

    log(
      chalk.white(
        `  Total Tests : ${suite.allTests().length}`
      )
    );

    log(
      chalk.white(
        `  Browser     : ${browser}`
      )
    );

    log(
      chalk.white(
        `  Workers     : ${config.workers}`
      )
    );

    log(
      chalk.white(
        `  Started At  : ${new Date().toLocaleTimeString()}`
      )
    );

    log('');
  }

  onTestBegin(test) {

    process.stdout.write(
      chalk.dim(
        `⏳ Running → ${test.title}\r`
      )
    );
  }

  onTestEnd(test, result) {

    process.stdout.write(
      ' '.repeat(120) + '\r'
    );

    const id = getId(test.title);

    const desc = getDesc(test.title);

    const browser =
      test.titlePath()?.[1] ?? 'chromium';

    const reason =
      getReason(result);

    const duration =
      ms(result.duration);

    const module =
  id.startsWith('LP') || id.startsWith('LN')
    ? 'LOGIN PAGE'
    : id.startsWith('SP') || id.startsWith('SN')
    ? 'SIGNUP PAGE'
    : id.startsWith('PL')
    ? 'PLAYLIST PAGE'
    : 'UNKNOWN PAGE';

    
    this.results.push({
      id,
      desc,
      module,
      browser,
      status: result.status,
      duration: result.duration,
      reason,
    });

    const PASS =
      chalk.bgGreen.black.bold(' PASS ');

    const FAIL =
      chalk.bgRed.white.bold(' FAIL ');

    const SKIP =
      chalk.bgYellow.black.bold(' SKIP ');

    const browserBadge =
      chalk.bgBlue.white.bold(
        ` ${browser.toUpperCase()} `
      );

    if (result.status === 'passed') {

      log(
        `${PASS} ${browserBadge} ` +
        chalk.green(`${desc}`) +
        chalk.dim(` (${duration})`)
      );

    } else if (result.status === 'failed') {

      log(
        `${FAIL} ${browserBadge} ` +
        chalk.red(`${desc}`) +
        chalk.dim(` (${duration})`)
      );

      log(
        chalk.yellow(
          `     ↳ ${reason}`
        )
      );

    } else {

      log(
        `${SKIP} ${browserBadge} ` +
        chalk.yellow(`${desc}`)
      );
    }
  }

  onEnd(result) {

    const totalMs =
      Date.now() - this.startTime;

    const passed =
      this.results.filter(r => r.status === 'passed');

    const failed =
      this.results.filter(r => r.status === 'failed');

    const skipped =
      this.results.filter(r => r.status === 'skipped');

    const grouped = {};

    for (const r of this.results) {

      if (!grouped[r.module]) {

        grouped[r.module] = {
          total: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          browser: r.browser,
        };
      }

      grouped[r.module].total++;

      if (r.status === 'passed')
        grouped[r.module].passed++;

      if (r.status === 'failed')
        grouped[r.module].failed++;

      if (r.status === 'skipped')
        grouped[r.module].skipped++;
    }

    // FINAL REPORT TABLE

    log('');

    log(
      chalk.bgMagenta.white.bold(
        '            🚀 FINAL AUTOMATION EXECUTION REPORT 🚀            '
      )
    );

    log('');

    const top =
    '┌──────────────────────┬──────────┬──────────┬──────────┬──────────┬───────────────┐';

    const mid =
    '├──────────────────────┼──────────┼──────────┼──────────┼──────────┼───────────────┤';

    const bottom =
    '└──────────────────────┴──────────┴──────────┴──────────┴──────────┴───────────────┘';

    log(chalk.cyan(top));

    log(
      chalk.bgBlue.white.bold(
        '│ ' +
        pad('PAGE NAME', 20) + ' │ ' +
        pad('TOTAL', 6) + ' │ ' +
        pad('PASS', 6) + ' │ ' +
        pad('FAIL', 6) + ' │ ' +
        pad('SKIP', 6) + ' │ ' +
        pad('BROWSER', 11) + ' │'
      )
    );

    log(chalk.cyan(mid));

    for (const [module, data] of Object.entries(grouped)) {

      const failColor =
        data.failed > 0
          ? chalk.red.bold
          : chalk.green.bold;

      log(

        chalk.white('│ ') +

        chalk.yellow.bold(
          pad(module, 20)
        ) +

        chalk.white(' │ ') +

        chalk.cyan.bold(
          pad(data.total, 6)
        ) +

        chalk.white(' │ ') +

        chalk.green.bold(
          pad(data.passed, 6)
        ) +

        chalk.white(' │ ') +

        failColor(
          pad(data.failed, 6)
        ) +

        chalk.white(' │ ') +

        chalk.yellow.bold(
          pad(data.skipped, 6)
        ) +

        chalk.white(' │ ') +

        chalk.blue.bold(
          pad(data.browser, 11)
        ) +

        chalk.white(' │')
      );

      log(chalk.cyan(mid));
    }

    log(chalk.cyan(bottom));

    log('');

    const banner =
      failed.length === 0
        ? chalk.bgGreen.black.bold(
            ' ✅ ALL TESTS PASSED SUCCESSFULLY '
          )
        : chalk.bgRed.white.bold(
            ' ❌ SOME TESTS FAILED '
          );

    log(banner);

    log('');

    log(
      chalk.green.bold(
        ` ✔ PASSED : ${passed.length}    `
      ) +

      chalk.red.bold(
        ` ✖ FAILED : ${failed.length}    `
      ) +

      chalk.yellow.bold(
        ` ⚠ SKIPPED : ${skipped.length}    `
      ) +

      chalk.cyan.bold(
        ` ⏱ TOTAL TIME : ${ms(totalMs)}`
      )
    );

    if (failed.length > 0) {

      log('');

      log(
        chalk.bgRed.white.bold(
          '                 FAILED TEST DETAILS                 '
        )
      );

      log('');

      failed.forEach((f, i) => {

        log(
          chalk.red.bold(
            ` ${i + 1}. ${f.desc}`
          )
        );

        log(
          chalk.yellow(
            `    Reason : ${f.reason}`
          )
        );

        log(
          chalk.cyan(
            '    ─────────────────────────────────────────────'
          )
        );
      });
    }

    log('');

    log(
      chalk.bgBlue.white.bold(
        '                  EXECUTION SUMMARY                  '
      )
    );

    log('');

    log(
      chalk.white(
        ` Total Time   : ${ms(totalMs)}`
      )
    );

    log(
      chalk.white(
        ` Average/Test : ${ms(
          Math.round(
            totalMs / (this.results.length || 1)
          )
        )}`
      )
    );

    const slowest =
      [...this.results]
        .sort((a, b) => b.duration - a.duration)[0];

    const fastest =
      [...this.results]
        .sort((a, b) => a.duration - b.duration)[0];

    log(
      chalk.red(
        ` Slowest Test : ${slowest.desc} (${ms(slowest.duration)})`
      )
    );

    log(
      chalk.green(
        ` Fastest Test : ${fastest.desc} (${ms(fastest.duration)})`
      )
    );

    log('');

    log(
      chalk.dim(
        ' HTML Report : npm run report'
      )
    );

    log(
      chalk.dim(
        ' Log File    : reports/logs/terminal-report.log'
      )
    );

    log('');

    logFile.end();
  }
}