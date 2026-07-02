# Test Instructions: Settings & Operations

Framework-agnostic. Adapt to your testing setup.

## User Flow Tests

### Flow 1: Test Broker Connection

**Setup:** IB broker configured with valid credentials

**Steps:**
1. Navigate to `/settings/broker-gateways`
2. See IB section with green status dot and "Connected" label
3. Latency shows "12ms", last heartbeat "2 seconds ago"
4. Click "Test Connection" button

**Expected Results:**
- [ ] Button shows loading spinner while test runs
- [ ] On success: toast "Connection test successful: 12ms latency" (green, 4s)
- [ ] Latency value updates to latest value

#### Failure Path: Broker Disconnected

**Setup:** IB broker credentials invalid or server unreachable

**Expected Results:**
- [ ] Status dot is red
- [ ] Label shows "Disconnected" in red
- [ ] Toast: "Connection test failed: Connection refused" (red, 6s)

### Flow 2: Save Settings with Validation

**Setup:** Risk Management settings page

**Steps:**
1. Navigate to `/settings/risk`
2. Set daily loss limit to "-100" (invalid — must be positive)
3. Click "Save Changes"

**Expected Results:**
- [ ] Validation error shows inline: "Must be a positive number"
- [ ] Red border on the field
- [ ] Settings are NOT saved
- [ ] No success toast

### Flow 3: Navigate Away with Unsaved Changes

**Steps:**
1. Navigate to `/settings/risk`
2. Change position size limit slider from 5% to 8%
3. Click "Market Data" in the sidebar (without saving)

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Dialog reads: "You have unsaved changes. Leave without saving?"
- [ ] Two buttons: "Cancel" (stays on page) and "Leave Without Saving" (navigates away, discards changes)
- [ ] Clicking Cancel keeps user on settings page with change preserved
- [ ] Clicking "Leave Without Saving" navigates to new page, discards change

### Flow 4: Reveal and Rotate API Key

**Steps:**
1. Navigate to `/settings/broker-gateways`
2. IB API Key field shows "••••••••••••••••••••••••"
3. Click eye icon button
4. API key value is revealed
5. Click "Rotate" button
6. Confirmation dialog: "Generate new API key? The current key will be invalidated immediately."
7. Click "Confirm Rotate"

**Expected Results:**
- [ ] Eye icon toggles to show/hide masked field
- [ ] Toast: "API key rotated" (blue, 4s)
- [ ] New key value shown in the field (revealed state)
- [ ] Broker is re-authenticated automatically

## Empty State Tests

Settings pages don't have traditional empty states (they always show forms), but test these:

### Broker Not Yet Configured

**Expected Results:**
- [ ] Broker section shows "Not configured" with empty credential fields
- [ ] Status dot is gray (not connected, not error)
- [ ] "Test Connection" button is disabled or shows appropriate message

### No Notification Channels Configured

**Expected Results:**
- [ ] Notification matrix table shows no channels with credentials
- [ ] Info message: "Configure at least one channel to receive notifications"
- [ ] Matrix checkboxes are disabled until a channel is configured

## Component Tests

### Masked Field

- [ ] Value hidden with dots by default
- [ ] Eye icon click reveals actual value
- [ ] Second eye icon click hides value again
- [ ] Rotate button shows confirmation dialog before acting

### Risk Slider with Numeric Input

- [ ] Slider and numeric input are synchronized (move one, other updates)
- [ ] Default value indicator visible (e.g., "Default: 5%")
- [ ] Values outside allowed range are rejected with validation message

### Drag-to-Reorder

- [ ] Data source rows have visible drag handles
- [ ] Dragging changes the order
- [ ] Order is preserved after saving
- [ ] New order reflected in the source priority

## Sample Test Data

```python
mock_broker_config = {
    "id": "ib-1",
    "name": "Interactive Brokers",
    "status": "connected",
    "latency_ms": 12,
    "last_heartbeat": "2025-01-20T14:59:48Z",
    "host": "localhost",
    "port": 7497,
    "api_key": "••••••••••••••••••••••••",
}

mock_risk_config = {
    "position_size_limit_pct": 5.0,
    "concentration_limit_pct": 20.0,
    "daily_loss_limit": 500.00,
    "max_drawdown_pct": 25.0,
    "correlation_threshold": 0.7,
}

mock_notification_channels = {
    "email": {"configured": True, "address": "trader@example.com"},
    "slack": {"configured": False},
    "discord": {"configured": False},
}
```
