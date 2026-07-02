# Test Instructions: Alerts

Framework-agnostic. Adapt to your testing setup.

## User Flow Tests

### Flow 1: View Active Alerts and Acknowledge

**Setup:** 3 active alerts: 1 critical (broker disconnected), 1 warning (data stale), 1 info (backfill completed)

**Steps:**
1. Navigate to `/alerts`
2. "Active Alerts" tab shows by default
3. Alerts sorted: critical first (broker disconnected), then warning, then info
4. Click "Acknowledge" on the critical alert

**Expected Results:**
- [ ] Critical alert shows "Acknowledged by admin at 2 minutes ago"
- [ ] Alert becomes dimmed/muted visually (still visible)
- [ ] Stat card "Firing" count unchanged (acknowledged ≠ resolved)
- [ ] Action buttons (Acknowledge, Silence) removed from acknowledged alert

### Flow 2: Create a Silence

**Steps:**
1. Click "Create New Silence" button in Silences tab
2. Form opens with fields: matchers, start time, end time, comment
3. Add matcher: key="alertname", value="BrokerDisconnected"
4. Set duration: 4 hours from now
5. Comment: "Broker maintenance window"
6. Click "Create Silence"

**Expected Results:**
- [ ] Toast: "Silence created" (green, 4s)
- [ ] Silence appears in Silences tab with matcher pills showing `alertname="BrokerDisconnected"`
- [ ] Time remaining shows "~4h remaining"
- [ ] Matched alerts in Active Alerts tab show "Silenced by 'maintenance'" indicator

#### Failure Path: No Comment Provided

**Steps:**
1. Fill in matchers but leave comment field empty
2. Click "Create Silence"

**Expected Results:**
- [ ] Validation error under comment: "Comment is required"
- [ ] Silence is NOT created
- [ ] Form stays open

### Flow 3: Expire a Silence Early

**Steps:**
1. Find active silence in Silences tab
2. Click "Expire" button
3. Confirmation dialog: "Expire this silence early? Matching alerts will resume firing."
4. Click "Confirm"

**Expected Results:**
- [ ] Toast: "Silence expired" (blue, 4s)
- [ ] Silence disappears from active silences list (or moves to expired)
- [ ] Previously silenced alerts become active again in Active Alerts tab

## Empty State Tests

### No Active Alerts

**Expected Results:**
- [ ] Active Alerts tab shows empty state
- [ ] Icon visible (e.g., check circle)
- [ ] Message: "No active alerts. All systems operational."
- [ ] No CTA (informational)

### No Silences

**Expected Results:**
- [ ] Silences tab shows empty state
- [ ] Message: "No active silences."
- [ ] "Create New Silence" button still visible at top

### No Routes Configured

**Expected Results:**
- [ ] Routes tab shows empty state
- [ ] Message: "No routing rules configured. Create routes to receive alert notifications."

### No Inhibition Rules

**Expected Results:**
- [ ] Inhibitions tab shows empty state
- [ ] Message: "No inhibition rules configured."

## Component Tests

### Severity Badges

- [ ] "critical" → red badge with red border
- [ ] "warning" → amber badge with amber border
- [ ] "info" → blue badge with blue border

### Source Badges

- [ ] "broker" → violet badge
- [ ] "market-data" → sky badge
- [ ] "risk" → red badge
- [ ] "strategy" → amber badge
- [ ] "portfolio" → emerald badge
- [ ] "system" → zinc badge

### Label Matcher Pills

- [ ] Shows key="value" format
- [ ] Multiple matchers shown as separate pills
- [ ] Pills have appropriate styling (monospace font, small text)

## Sample Test Data

```python
mock_alert_critical = {
    "id": "alert-001",
    "name": "BrokerDisconnected",
    "severity": "critical",
    "source": "broker",
    "summary": "Interactive Brokers connection lost",
    "started_at": "2025-01-20T14:30:00Z",
    "acknowledged": False,
    "silenced": False,
}

mock_alert_warning = {
    "id": "alert-002",
    "name": "DataStale",
    "severity": "warning",
    "source": "market-data",
    "summary": "AAPL data not updated for 2 hours",
    "started_at": "2025-01-20T13:00:00Z",
    "acknowledged": False,
    "silenced": False,
}

mock_silence = {
    "id": "silence-001",
    "matchers": [{"key": "alertname", "value": "BrokerDisconnected"}],
    "starts_at": "2025-01-20T14:00:00Z",
    "ends_at": "2025-01-20T18:00:00Z",
    "comment": "Broker maintenance window",
    "status": "active",
    "matched_count": 1,
}

mock_empty_alerts = []
mock_empty_silences = []
```
