/**
 * Receives the /contact project brief (src/islands/ContactForm.tsx), logs it to
 * a Google Sheet and emails it to us. This is the whole "backend" for the form:
 * it runs on Google's servers under our Workspace account, not ours.
 *
 * Setup (one time)
 *   1. Create a Google Sheet, e.g. "Zenova enquiries". Open Extensions > Apps Script.
 *   2. Paste this file over the default Code.gs and save.
 *   3. Deploy > New deployment > type "Web app".
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      Authorize when asked (it needs Sheets and Gmail send access).
 *   4. Copy the Web app URL (ends in /exec) into SITE.contactEndpoint in
 *      src/data/site.ts.
 *
 * Changing this script later: Deploy > Manage deployments > edit > New version.
 * Saving alone does not update the live /exec URL.
 *
 * The site sends the body as text/plain JSON so the browser makes a CORS
 * "simple request"; Apps Script cannot answer a preflight.
 */

var NOTIFY_TO = 'hello@zenova.agency';
var MIN_FILL_MS = 3000; // faster than this is a bot
var MAX_LEN = { name: 120, email: 200, company: 200, service: 120, plan: 200, budget: 60, timeline: 60, message: 5000, page: 300 };
var HEADERS = ['Received', 'Name', 'Email', 'Company', 'Service', 'Scope option', 'Budget', 'Timeline', 'Message', 'Page'];

function doPost(e) {
  try {
    var data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Bots: reply "ok" so they learn nothing, but do not record or send.
    // elapsedMs is measured on the client (no clock-skew between devices).
    var tooFast = Number(data.elapsedMs) < MIN_FILL_MS;
    if (data.website || tooFast) return reply({ ok: true });

    var f = {};
    Object.keys(MAX_LEN).forEach(function (k) {
      f[k] = String(data[k] == null ? '' : data[k]).slice(0, MAX_LEN[k]).trim();
    });

    if (!f.name || !f.service || f.message.length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) {
      return reply({ ok: false, error: 'invalid' });
    }

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
      if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
      sheet.appendRow([
        new Date(), f.name, f.email, f.company, f.service, f.plan, f.budget, f.timeline, f.message, f.page,
      ].map(plainText));
    } finally {
      lock.releaseLock();
    }

    MailApp.sendEmail({
      to: NOTIFY_TO,
      replyTo: oneLine(f.email),
      subject: 'New project enquiry from ' + oneLine(f.name),
      body: [
        'Name: ' + f.name,
        'Email: ' + f.email,
        f.company && 'Company: ' + f.company,
        'Service: ' + f.service,
        f.plan && 'Scope option: ' + f.plan,
        f.budget && 'Budget: ' + f.budget,
        f.timeline && 'Timeline: ' + f.timeline,
        f.page && 'Sent from: ' + f.page,
        '',
        f.message,
      ].filter(function (line) { return line !== '' && line !== false && line !== undefined; }).join('\n'),
    });

    return reply({ ok: true });
  } catch (err) {
    console.error(err);
    return reply({ ok: false, error: 'server' });
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** No CR/LF in anything that ends up in a mail header. */
function oneLine(s) {
  return String(s).replace(/[\r\n]+/g, ' ');
}

/** A cell starting with = + - @ would be run as a formula in Sheets. */
function plainText(v) {
  return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v;
}
