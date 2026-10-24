// ============================================================================
// miliconfigOS v4.0 - automation engine
// One implementation of every job kind, shared by the on-demand API
// (`POST /api/v1/automation/:id/run`) and the Cron Trigger (`scheduled()`).
// Jobs only observe and report; destructive changes always require the
// administrator, and every run is recorded in automation_runs.
// ============================================================================

import { listUsers, loadGlobalConfig, addAuditLog } from '../db/d1.js';
import {
  listEndpoints,
  listAutomationJobs,
  recordAutomationRun,
  recordEndpointHealth
} from '../db/v4.js';
import { buildPlans } from './engine.js';
import { scanTargets } from './scanner.js';
import {
  applySourcesToPreferred,
  collectSourceAddresses,
  getSourcesAuto,
  resolveSourceEntries
} from './sources.js';

const MAX_JOBS_PER_TICK = 6;

export async function runAutomationJob(env, job, cfg, clientIp = 'cron') {
  const started = Date.now();
  let detail = '';
  try {
    if (job.kind === 'health') {
      const targets = (await listEndpoints(env)).filter(item => item.enabled).slice(0, 8);
      if (!targets.length) {
        detail = 'No enabled endpoints to check.';
      } else {
        const scan = await scanTargets(
          targets.map(item => ({ host: item.host, port: item.port, levels: ['syntax', 'dns', 'tcp', 'tls'] })),
          { concurrency: Math.min(8, Number(cfg.scannerConcurrency) || 4) }
        );
        for (let i = 0; i < targets.length; i++) {
          await recordEndpointHealth(env, targets[i].id, scan.results[i]);
        }
        const healthy = scan.results.filter(item => item.score >= 60).length;
        detail = `Checked ${targets.length} endpoint(s); ${healthy} scored 60 or higher.`;
      }
    } else if (job.kind === 'expiry') {
      const users = await listUsers(env);
      const now = Date.now();
      const expired = users.filter(user => user.expireAt > 0 && user.expireAt < now);
      detail = `${expired.length} expired user(s): ${expired.map(user => user.username).join(', ') || 'none'}. No accounts were modified.`;
    } else if (job.kind === 'quota') {
      const users = await listUsers(env);
      const exhausted = users.filter(user => user.dataLimitGb > 0 && user.usedBytes >= user.dataLimitGb * 1073741824);
      detail = `${exhausted.length} user(s) at quota: ${exhausted.map(user => user.username).join(', ') || 'none'}.`;
    } else if (job.kind === 'config-validation') {
      const users = await listUsers(env);
      const endpoints = await listEndpoints(env);
      let valid = 0;
      let invalid = 0;
      for (const user of users) {
        const plans = buildPlans({ user, endpoints, settings: cfg, formats: ['uri'], limit: 1 });
        if (plans.valid.length) valid += 1;
        else invalid += 1;
      }
      detail = `${valid} user(s) have at least one valid combination; ${invalid} do not.`;
    } else if (job.kind === 'sources-sync') {
      const auto = await getSourcesAuto(env);
      if (!auto.enabled) {
        detail = 'Automatic CFnew source sync is off; nothing was applied.';
      } else {
        const entries = resolveSourceEntries({ categories: auto.categories });
        const collected = await collectSourceAddresses(entries, {
          limit: auto.limit,
          family: auto.family,
          concurrency: Math.min(4, Number(cfg.scannerConcurrency) || 4)
        });
        if (!collected.candidates.length) {
          detail = `No usable entry from ${entries.length} source(s); the node pool was left unchanged.`;
        } else {
          const applied = await applySourcesToPreferred(env, collected.candidates, { replace: auto.replace });
          const proxies = collected.candidates.filter(item => item.proxy).length;
          detail = `Added ${applied.added.length} node entr${applied.added.length === 1 ? 'y' : 'ies'} (${proxies} proxy → location node) from ${collected.okCount}/${entries.length} live source(s); yx now holds ${applied.total}.`;
        }
      }
    } else {
      throw new Error(`Unknown job kind: ${job.kind}`);
    }

    await recordAutomationRun(env, job.id, { status: 'success', detail });
    await addAuditLog(env, 'اجرای اتوماسیون', `${job.name} · ${detail}`.slice(0, 300), clientIp);
    return { ok: true, jobId: job.id, kind: job.kind, detail, durationMs: Date.now() - started };
  } catch (err) {
    const message = String(err?.message || err);
    await recordAutomationRun(env, job.id, { status: 'failed', detail, error: message });
    return { ok: false, jobId: job.id, kind: job.kind, detail, error: message, durationMs: Date.now() - started };
  }
}

/**
 * Run every enabled job whose next_run_at has passed (or that never ran).
 * Used by the Cron Trigger; bounded so one tick can never loop forever.
 */
export async function runDueAutomationJobs(env) {
  const jobs = await listAutomationJobs(env);
  const now = Date.now();
  const due = jobs
    .filter(job => job.enabled && (!job.nextRunAt || job.nextRunAt <= now))
    .slice(0, MAX_JOBS_PER_TICK);
  if (!due.length) return [];

  const cfg = await loadGlobalConfig(env);
  const results = [];
  for (const job of due) {
    results.push(await runAutomationJob(env, job, cfg));
  }
  return results;
}
