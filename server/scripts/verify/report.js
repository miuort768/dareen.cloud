const SEPS = {
    full: '═══════════════════════════════════════════════════════',
    heavy: '───────────────────────────────────────────────────────',
    light: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
};

function center(text, width = 55) {
    const pad = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(pad) + text;
}

function formatResults(results) {
    const lines = [];
    lines.push('');
    lines.push(SEPS.full);
    lines.push(center('03_verify.js — PostgreSQL Migration Report'));
    lines.push(SEPS.full);
    lines.push('');

    let totalScore = 0;
    let totalWarnings = 0;
    let totalErrors = 0;
    let totalChecks = 0;
    let passedChecks = 0;

    for (const result of results) {
        lines.push(`  ${result.name}`);
        lines.push(SEPS.heavy);

        for (const check of result.checks) {
            const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : check.status === 'error' ? '💥' : '❌';
            lines.push(`    ${icon} ${check.name.padEnd(30)} ${check.detail}`);
        }

        totalScore += result.score;
        totalWarnings += result.warnings;
        totalErrors += result.errors;
        totalChecks += result.checks.length;
        passedChecks += result.checks.filter(c => c.status === 'pass').length;

        const color = result.score >= 98 ? '✅' : result.score >= 80 ? '⚠️' : '❌';
        lines.push(`  ${SEPS.light}`);
        lines.push(`  Score: ${result.score}% ${color}  (${result.checks.filter(c => c.status === 'pass').length}/${result.checks.length} passed, ${result.warnings} warnings, ${result.errors} errors)`);
        lines.push('');
    }

    // Final score
    const finalScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;

    lines.push(SEPS.full);
    lines.push(center('═══ Migration Score ═══'));
    lines.push(SEPS.full);
    lines.push('');

    for (const result of results) {
        const pct = `${result.score}%`.padStart(4);
        lines.push(`  ${result.name.padEnd(25)} ${pct}`);
    }
    lines.push(`  ${''.padEnd(25)} ${'────'}`);
    lines.push(`  ${'Final Score'.padEnd(25)} ${finalScore}%`);

    const warnStr = totalWarnings === 0 ? '0 ✅' : `${totalWarnings} ⚠️`;
    const errStr = totalErrors === 0 ? '0 ✅' : `${totalErrors} ❌`;
    lines.push(`  ${'Warnings'.padEnd(25)} ${warnStr}`);
    lines.push(`  ${'Errors'.padEnd(25)} ${errStr}`);

    // Decision
    let decision, decisionIcon;
    if (finalScore >= 98 && totalErrors === 0) {
        decision = 'ALLOW SWITCH';
        decisionIcon = '✅';
    } else if (finalScore >= 95 && totalErrors === 0) {
        decision = 'ALLOW WITH WARNING';
        decisionIcon = '⚠️';
    } else {
        decision = 'BLOCK';
        decisionIcon = '❌';
    }
    lines.push('');
    lines.push(`  Decision: ${decision} ${decisionIcon}`);
    lines.push('');

    // Summary
    lines.push(`  ${totalChecks} total checks | ${passedChecks} passed | ${totalWarnings} warnings | ${totalErrors} errors`);
    lines.push('');
    lines.push(SEPS.full);
    lines.push('');

    const output = lines.join('\n');
    console.log(output);

    return { finalScore, decision, totalErrors, totalWarnings, output };
}

module.exports = { formatResults };
