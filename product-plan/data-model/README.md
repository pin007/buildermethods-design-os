# Data Model — Trading Squad

## Overview

Core entity relationships for the Trading Squad platform. These types drive the UI across all sections — translate them to Python dataclasses or Pydantic models.

## Entity Map

```
Broker
  └── Portfolio (belongs to a Broker)
        └── Order (placed within a Portfolio)
              ├── Instrument (what is being traded)
              ├── OrderEvent (lifecycle audit trail)
              ├── Trade (execution record when filled)
              └── Recommendation (optional — origin of the order)
```

## Core Entities

### Broker
Represents a connected brokerage account (Interactive Brokers or Binance).

**Key fields:** `id`, `name`, `shortName`, `status` (connected/disconnected/error), `assetTypes`, `baseCurrency`, `connectedAt`

### Portfolio
A portfolio managed within a broker account.

**Key fields:** `id`, `name`, `currency`, `brokerId`, `dashboardStats` (live stats)

### Instrument
A tradeable instrument with real-time price data.

**Key fields:** `id`, `symbol`, `name`, `assetType` (stock/crypto/option/forex/futures), `exchange`, `currentPrice`, `dayChange`, `dayChangePercent`, `week52High/Low`, `recentVolatility`

### Order
The central entity representing a trade order through its full lifecycle.

**Key fields:** `id`, `portfolioId`, `instrumentId`, `symbol`, `side` (BUY/SELL), `orderType` (market/limit/stop_loss), `quantity`, `limitPrice`, `stopPrice`, `status` (12 states), `brokerId`, `timeInForce`, `bracketGroupId`, `bracketRole`, `fillPrice`, `filledQuantity`, `commission`

**Optional fields by status:**
- `approvalContext` — only on `pending_approval` orders (contains `expiresAt`, `riskAnalysis`)
- `rejectionReason` — only on `rejected` orders
- `errorMessage` — only on `failed` orders
- `amendedFields` — only on `amended` orders
- `ocoLinkedOrderId` — only on OCO bracket child legs

### Order Status States (12)

| Status | Color | Description |
|--------|-------|-------------|
| `draft` | gray | Created but not submitted |
| `pending_approval` | amber | Awaiting human approval |
| `approved` | blue | Approved, ready for submission |
| `submitted` | blue | Sent to broker |
| `acknowledged` | blue | Broker confirmed receipt |
| `partially_filled` | teal | Some quantity executed |
| `filled` | green | Fully executed |
| `cancelled` | gray | Cancelled by user |
| `rejected` | red | Rejected by approver or broker |
| `expired` | gray | TIF expired or approval timed out |
| `amended` | blue | Order modified |
| `failed` | red | Broker execution error |

### Recommendation
An AI-generated trade recommendation (from Market Analyst or Trading Advisor).

**Key fields:** `id`, `instrumentId`, `symbol`, `action` (BUY/SELL), `quantity`, `confidence`, `riskScore`, `status`, `strategyName`, `reasoning`, `targetPrices` (entry/target/stopLoss), `orderId` (set when order is created from this)

### OrderEvent
Event sourcing record for the complete order lifecycle audit trail.

**Key fields:** `id`, `orderId`, `status`, `timestamp`, `message`, `data`

### Trade
Execution record created when an order is filled.

**Key fields:** `id`, `orderId`, `instrumentId`, `symbol`, `side`, `quantity`, `price`, `total`, `commission`, `currency`, `brokerId`, `executedAt`

### RecentActivity
Lightweight activity feed entry for the dashboard.

**Key fields:** `id`, `type` (fill/cancelled/rejected/submitted/approved), `message`, `orderId`, `symbol`, `timestamp`

## Risk Analysis

Embedded in `ApprovalContext` for pending orders:

```python
@dataclass
class RiskAnalysis:
    portfolio_impact_percent: float  # % of portfolio value
    position_size_percent: float     # % concentration
    cash_balance_after: float        # remaining cash if order fills
    risk_level: Literal['low', 'medium', 'high']
    warnings: list[str]              # pre-trade warnings
```

**Risk thresholds:**
- Low: portfolio impact < 1% (auto-execute)
- Medium: portfolio impact 1-5% (manual approval required)
- High: portfolio impact > 5% (manual approval + risk warning)

## Python Translation Example

```python
from dataclasses import dataclass, field
from typing import Optional, Literal
from datetime import datetime

OrderStatus = Literal[
    'draft', 'pending_approval', 'approved', 'submitted',
    'acknowledged', 'partially_filled', 'filled', 'cancelled',
    'rejected', 'expired', 'amended', 'failed'
]

@dataclass
class Order:
    id: str
    portfolio_id: str
    instrument_id: str
    symbol: str
    instrument_name: str
    side: Literal['BUY', 'SELL']
    order_type: Literal['market', 'limit', 'stop_loss']
    quantity: int
    status: OrderStatus
    broker_id: str
    broker_short_name: str
    time_in_force: Literal['DAY', 'GTC', 'GTD', 'IOC', 'FOK']
    created_at: datetime
    updated_at: datetime
    limit_price: Optional[float] = None
    stop_price: Optional[float] = None
    bracket_group_id: Optional[str] = None
    bracket_role: Optional[Literal['parent', 'stop_loss', 'take_profit']] = None
    recommendation_id: Optional[str] = None
    fill_price: Optional[float] = None
    filled_quantity: int = 0
    commission: Optional[float] = None
    approval_context: Optional[dict] = None
    rejection_reason: Optional[str] = None
    error_message: Optional[str] = None
```

## See Also

- `types.ts` — Full TypeScript interface definitions
- `sample-data.json` — Sample data for all entity types
