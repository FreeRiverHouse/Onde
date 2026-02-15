#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
#  Cloudflare Web Analytics Fetcher for onde.la
#  Queries CF GraphQL API and writes JSON reports to data/analytics/
#
#  Usage: ./tools/analytics/fetch-cf-analytics.sh [--days N]
#         Default: fetches last 30 days of data
#
#  Output: data/analytics/cf-analytics-latest.json
#          data/analytics/cf-analytics-YYYY-MM-DD.json (snapshot)
# ──────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
OUTPUT_DIR="$PROJECT_ROOT/data/analytics"
mkdir -p "$OUTPUT_DIR"

# ── Config ──
CF_ACCOUNT_ID="91ddd4ffd23fb9da94bb8c2a99225a3f"
CF_API_TOKEN="RGNdXWCWyAHpUKqKRMf5vezPEVQSq3uw1TuX62aw"
CF_SITE_TAG="55503cb624cd432ab85d4d7f8cef5261"
CF_GQL="https://api.cloudflare.com/client/v4/graphql"

# ── Args ──
DAYS=30
while [[ $# -gt 0 ]]; do
  case "$1" in
    --days) DAYS="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

TODAY=$(date -u +%Y-%m-%d)
START_DATE=$(date -u -v-${DAYS}d +%Y-%m-%d 2>/dev/null || date -u -d "${DAYS} days ago" +%Y-%m-%d)
START_7D=$(date -u -v-7d +%Y-%m-%d 2>/dev/null || date -u -d "7 days ago" +%Y-%m-%d)

echo "📊 Fetching CF Web Analytics: $START_DATE → $TODAY (${DAYS}d)"

# ── Helper: run a GraphQL query ──
gql() {
  local query="$1"
  curl -sf "$CF_GQL" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$query\"}"
}

FILTER_30D="AND: [{datetime_geq: \\\"${START_DATE}T00:00:00Z\\\", datetime_leq: \\\"${TODAY}T23:59:59Z\\\"}, {siteTag: \\\"${CF_SITE_TAG}\\\"}]"
FILTER_7D="AND: [{datetime_geq: \\\"${START_7D}T00:00:00Z\\\", datetime_leq: \\\"${TODAY}T23:59:59Z\\\"}, {siteTag: \\\"${CF_SITE_TAG}\\\"}]"

# ── 1. Total page views (7d + 30d) ──
echo "  → Total page views..."
TOTAL_VIEWS=$(gql "query { viewer { accounts(filter: {accountTag: \\\"${CF_ACCOUNT_ID}\\\"}) { total30d: rumPageloadEventsAdaptiveGroups(filter: {${FILTER_30D}}, limit: 1) { count } total7d: rumPageloadEventsAdaptiveGroups(filter: {${FILTER_7D}}, limit: 1) { count } } } }")

# ── 2. Daily breakdown ──
echo "  → Daily breakdown..."
DAILY=$(gql "query { viewer { accounts(filter: {accountTag: \\\"${CF_ACCOUNT_ID}\\\"}) { rumPageloadEventsAdaptiveGroups(filter: {${FILTER_30D}}, limit: 60, orderBy: [date_ASC]) { count dimensions { date } } } } }")

# ── 3. Top pages ──
echo "  → Top pages..."
TOP_PAGES=$(gql "query { viewer { accounts(filter: {accountTag: \\\"${CF_ACCOUNT_ID}\\\"}) { rumPageloadEventsAdaptiveGroups(filter: {${FILTER_30D}}, limit: 25, orderBy: [count_DESC]) { count dimensions { requestPath } } } } }")

# ── 4. Top referrers ──
echo "  → Top referrers..."
TOP_REFERRERS=$(gql "query { viewer { accounts(filter: {accountTag: \\\"${CF_ACCOUNT_ID}\\\"}) { rumPageloadEventsAdaptiveGroups(filter: {${FILTER_30D}}, limit: 25, orderBy: [count_DESC]) { count dimensions { refererHost } } } } }")

# ── 5. Device type breakdown ──
echo "  → Device breakdown..."
DEVICES=$(gql "query { viewer { accounts(filter: {accountTag: \\\"${CF_ACCOUNT_ID}\\\"}) { rumPageloadEventsAdaptiveGroups(filter: {${FILTER_30D}}, limit: 10, orderBy: [count_DESC]) { count dimensions { deviceType } } } } }")

# ── 6. Browser breakdown ──
echo "  → Browser breakdown..."
BROWSERS=$(gql "query { viewer { accounts(filter: {accountTag: \\\"${CF_ACCOUNT_ID}\\\"}) { rumPageloadEventsAdaptiveGroups(filter: {${FILTER_30D}}, limit: 10, orderBy: [count_DESC]) { count dimensions { userAgentBrowser } } } } }")

# ── 7. Country breakdown ──
echo "  → Country breakdown..."
COUNTRIES=$(gql "query { viewer { accounts(filter: {accountTag: \\\"${CF_ACCOUNT_ID}\\\"}) { rumPageloadEventsAdaptiveGroups(filter: {${FILTER_30D}}, limit: 30, orderBy: [count_DESC]) { count dimensions { countryName } } } } }")

# ── 8. OS breakdown ──
echo "  → OS breakdown..."
OS_DATA=$(gql "query { viewer { accounts(filter: {accountTag: \\\"${CF_ACCOUNT_ID}\\\"}) { rumPageloadEventsAdaptiveGroups(filter: {${FILTER_30D}}, limit: 10, orderBy: [count_DESC]) { count dimensions { userAgentOS } } } } }")

# ── Assemble final JSON ──
echo "  → Assembling report..."

# Use node to merge everything into a clean JSON
node -e "
const data = {
  meta: {
    generated: new Date().toISOString(),
    period: { start: '${START_DATE}', end: '${TODAY}', days: ${DAYS} },
    site: 'onde.la',
    siteTag: '${CF_SITE_TAG}'
  },
  totals: ${TOTAL_VIEWS},
  daily: ${DAILY},
  topPages: ${TOP_PAGES},
  topReferrers: ${TOP_REFERRERS},
  devices: ${DEVICES},
  browsers: ${BROWSERS},
  countries: ${COUNTRIES},
  operatingSystems: ${OS_DATA}
};

// Extract the useful bits
const acct = (obj) => obj?.data?.viewer?.accounts?.[0] || {};

const result = {
  meta: data.meta,
  summary: {
    pageViews30d: acct(data.totals).total30d?.[0]?.count || 0,
    pageViews7d: acct(data.totals).total7d?.[0]?.count || 0,
  },
  daily: (acct(data.daily).rumPageloadEventsAdaptiveGroups || []).map(r => ({
    date: r.dimensions.date,
    views: r.count
  })),
  topPages: (acct(data.topPages).rumPageloadEventsAdaptiveGroups || [])
    .filter(r => r.dimensions.requestPath)
    .map(r => ({ path: r.dimensions.requestPath, views: r.count })),
  topReferrers: (acct(data.topReferrers).rumPageloadEventsAdaptiveGroups || [])
    .filter(r => r.dimensions.refererHost)
    .map(r => ({ referrer: r.dimensions.refererHost, views: r.count })),
  devices: (acct(data.devices).rumPageloadEventsAdaptiveGroups || [])
    .filter(r => r.dimensions.deviceType)
    .map(r => ({ type: r.dimensions.deviceType, views: r.count })),
  browsers: (acct(data.browsers).rumPageloadEventsAdaptiveGroups || [])
    .filter(r => r.dimensions.userAgentBrowser)
    .map(r => ({ browser: r.dimensions.userAgentBrowser, views: r.count })),
  countries: (acct(data.countries).rumPageloadEventsAdaptiveGroups || [])
    .filter(r => r.dimensions.countryName)
    .map(r => ({ country: r.dimensions.countryName, views: r.count })),
  operatingSystems: (acct(data.operatingSystems).rumPageloadEventsAdaptiveGroups || [])
    .filter(r => r.dimensions.userAgentOS)
    .map(r => ({ os: r.dimensions.userAgentOS, views: r.count })),
};

console.log(JSON.stringify(result, null, 2));
" > "$OUTPUT_DIR/cf-analytics-latest.json"

# Also save a dated snapshot
cp "$OUTPUT_DIR/cf-analytics-latest.json" "$OUTPUT_DIR/cf-analytics-${TODAY}.json"

echo ""
echo "✅ Analytics saved to:"
echo "   $OUTPUT_DIR/cf-analytics-latest.json"
echo "   $OUTPUT_DIR/cf-analytics-${TODAY}.json"
echo ""

# ── Quick summary to stdout ──
node -e "
const d = require('$OUTPUT_DIR/cf-analytics-latest.json');
console.log('═══════════════════════════════════════');
console.log('  ONDE.LA Analytics Summary');
console.log('  Period: ' + d.meta.period.start + ' → ' + d.meta.period.end);
console.log('═══════════════════════════════════════');
console.log('');
console.log('📈 Page Views');
console.log('   Last 7 days:  ' + d.summary.pageViews7d);
console.log('   Last 30 days: ' + d.summary.pageViews30d);
console.log('');
console.log('📄 Top Pages');
d.topPages.slice(0, 10).forEach((p, i) =>
  console.log('   ' + (i+1) + '. ' + p.path + ' — ' + p.views + ' views'));
console.log('');
console.log('🔗 Top Referrers');
d.topReferrers.slice(0, 10).forEach((r, i) =>
  console.log('   ' + (i+1) + '. ' + r.referrer + ' — ' + r.views + ' views'));
console.log('');
console.log('📱 Devices');
d.devices.forEach(dv => console.log('   ' + dv.type + ': ' + dv.views));
console.log('');
console.log('🌍 Top Countries');
d.countries.slice(0, 10).forEach((c, i) =>
  console.log('   ' + (i+1) + '. ' + c.country + ' — ' + c.views + ' views'));
console.log('');
console.log('🖥️  Browsers');
d.browsers.slice(0, 5).forEach(b => console.log('   ' + b.browser + ': ' + b.views));
console.log('');
console.log('💻 Operating Systems');
d.operatingSystems.slice(0, 5).forEach(o => console.log('   ' + o.os + ': ' + o.views));
console.log('═══════════════════════════════════════');
"
