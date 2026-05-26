# FinCrisS AML Platform — API Documentation

**Base URL:** `https://api.fincriss.com`
**Interactive Docs (Swagger UI):** `https://api.fincriss.com/docs`

---

## Authentication

All endpoints except `/auth/login`, `/auth/refresh`, and `/auth/logout` require a Bearer token:

```
Authorization: Bearer <access_token>
```

Access tokens expire in **30 minutes**. Use `/auth/refresh` to get a new one without re-logging in.

---

## Table of Contents

1. [Auth](#1-auth)
2. [User Management](#2-user-management)
3. [Dashboard](#3-dashboard)
4. [Alerts](#4-alerts)
   - [Alert Queue Management (Triage)](#alert-queue-management-triage)
   - [Alert Workflow (Analyst)](#alert-workflow-analyst)
   - [Alert Notes](#alert-notes)
   - [AI Summary](#ai-summary)
5. [Cases](#5-cases)
   - [Case Notes & Evidence](#case-notes--evidence)
6. [STR (Suspicious Transaction Reports)](#6-str-suspicious-transaction-reports)
7. [Audit Log](#7-audit-log)
8. [Rules Engine](#8-rules-engine)
9. [Reference Data](#9-reference-data)
10. [Customer 360](#10-customer-360)
11. [Model](#11-model)
12. [System](#12-system)
13. [Roles & Permissions Reference](#13-roles--permissions-reference)
14. [Error Responses](#14-error-responses)

---

## 1. Auth

### POST /auth/login

Authenticate a user and receive access + refresh tokens.

**Auth required:** No

**Request body:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response `200`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "token_type": "bearer"
}
```

**Errors:**
| Status | Detail |
|--------|--------|
| 401 | Incorrect username or password |
| 403 | Account is disabled |

---

### POST /auth/refresh

Exchange a refresh token for a new access token. Token rotation — old token is revoked.

**Auth required:** No

**Request body:**
```json
{ "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..." }
```

**Response `200`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "bmV3UmVmcmVzaFRva2Vu...",
  "token_type": "bearer"
}
```

**Errors:**
| Status | Detail |
|--------|--------|
| 401 | Invalid refresh token |
| 401 | Refresh token has been revoked |
| 401 | Refresh token has expired |
| 403 | Account is disabled |

---

### POST /auth/logout

Revoke the refresh token, ending the session.

**Auth required:** No

**Request body:**
```json
{ "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4..." }
```

**Response `204`:** No content

---

### GET /auth/me

Get the currently authenticated user's profile, roles, and permissions.

**Auth required:** Yes (any role)

**Response `200`:**
```json
{
  "user_id": 1,
  "username": "admin",
  "email": "admin@fincriss.com",
  "full_name": "Super Admin",
  "is_active": true,
  "created_at": "2026-03-16T10:00:00.000Z",
  "last_login": "2026-03-16T12:30:00.000Z",
  "roles": ["super_admin"],
  "permissions": [
    "alerts:assign", "alerts:read", "alerts:write", "audit_log:read",
    "cases:close", "cases:read", "cases:write", "customers:read",
    "model:read", "reference:read", "reference:write",
    "rules:read", "rules:write",
    "str:approve", "str:read", "str:write",
    "users:read", "users:write"
  ]
}
```

---

### POST /auth/change-password

Change the authenticated user's own password. All existing refresh tokens are revoked.

**Auth required:** Yes (any role)

**Request body:**
```json
{
  "current_password": "old-password",
  "new_password": "new-strong-password"
}
```

**Response `204`:** No content

**Errors:**
| Status | Detail |
|--------|--------|
| 400 | Current password is incorrect |

---

## 2. User Management

> All endpoints in this section require the `super_admin` role.

### GET /api/users

List all users with their assigned roles.

**Auth required:** `users:read`

**Query parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `is_active` | boolean | — | Filter by active/inactive |
| `role_name` | string | — | Filter by role (e.g. `analyst`) |
| `limit` | integer | `50` | Max results (max: 500) |
| `offset` | integer | `0` | Pagination offset |

**Response `200`:**
```json
{
  "total": 3,
  "limit": 50,
  "offset": 0,
  "users": [
    {
      "user_id": 1,
      "username": "admin",
      "email": "admin@fincriss.com",
      "full_name": "Super Admin",
      "is_active": true,
      "created_at": "2026-03-16T10:00:00.000Z",
      "last_login": "2026-03-16T12:30:00.000Z",
      "roles": ["super_admin"]
    }
  ]
}
```

---

### POST /api/users

Create a new user.

**Auth required:** `users:write`

**Request body:**
```json
{
  "username": "jane.investigator",
  "email": "jane@bank.com",
  "full_name": "Jane Smith",
  "password": "secure-password-123",
  "role_name": "investigator"
}
```

> `role_name` is optional. Valid roles: `triage_manager`, `analyst`, `investigator`, `principal_officer`, `compliance`, `super_admin`

**Response `201`:** `{ "message": "User created", "user_id": 3 }`

**Errors:**
| Status | Detail |
|--------|--------|
| 400 | Role '{role_name}' not found |
| 409 | Username or email already exists |

---

### GET /api/users/{user_id}

Get full user detail including roles and effective permissions.

**Auth required:** `users:read`

**Response `200`:**
```json
{
  "user_id": 2,
  "username": "john.analyst",
  "email": "john@bank.com",
  "full_name": "John Doe",
  "is_active": true,
  "created_at": "2026-03-16T11:00:00.000Z",
  "updated_at": "2026-03-16T11:00:00.000Z",
  "last_login": null,
  "roles": [
    {
      "role_id": 1,
      "role_name": "analyst",
      "assigned_at": "2026-03-16T11:00:00.000Z",
      "assigned_by": "admin"
    }
  ],
  "permissions": ["alerts:read", "cases:read", "reference:read"]
}
```

---

### PUT /api/users/{user_id}

Update a user's email or full name.

**Auth required:** `users:write`

**Request body** (all fields optional):
```json
{ "email": "john.new@bank.com", "full_name": "John Updated" }
```

**Response `200`:** `{ "message": "User updated" }`

---

### PATCH /api/users/{user_id}/deactivate

Disable a user account. All active sessions are revoked immediately.

**Auth required:** `users:write`

**Response `200`:** `{ "message": "User deactivated" }`

**Errors:**
| Status | Detail |
|--------|--------|
| 400 | Cannot deactivate your own account |
| 404 | User not found |

---

### PATCH /api/users/{user_id}/activate

Re-enable a disabled user account.

**Auth required:** `users:write`

**Response `200`:** `{ "message": "User activated" }`

---

### POST /api/users/{user_id}/roles

Assign a role to a user. Idempotent.

**Auth required:** `users:write`

**Request body:** `{ "role_name": "investigator" }`

**Response `201`:** `{ "message": "Role 'investigator' assigned" }`

---

### DELETE /api/users/{user_id}/roles/{role_id}

Remove a role from a user.

**Auth required:** `users:write`

**Response `204`:** No content

**Errors:**
| Status | Detail |
|--------|--------|
| 400 | Cannot remove your own super_admin role |
| 404 | User-role assignment not found |

---

### GET /api/roles

List all available roles with their permissions.

**Auth required:** `users:read`

**Response `200`:**
```json
{
  "total": 6,
  "roles": [
    {
      "role_id": 1,
      "role_name": "triage_manager",
      "description": "Assigns and balances alert workload across analysts",
      "is_active": true,
      "permissions": ["alerts:assign", "alerts:read", "cases:read"]
    }
  ]
}
```

---

### POST /api/roles

Create a new role.

**Auth required:** `users:write`

**Request body:**
```json
{ "role_name": "custom_role", "description": "Description of the role" }
```

**Response `201`:** `{ "message": "Role created", "role_id": 7 }`

---

### DELETE /api/roles/{role_id}

Delete a role. Fails if any users are currently assigned to it.

**Auth required:** `users:write`

**Response `204`:** No content

---

### GET /api/permissions

List all available permissions.

**Auth required:** `users:read`

**Response `200`:**
```json
{
  "total": 16,
  "permissions": [
    { "permission_id": 1, "resource": "alerts", "action": "read", "permission": "alerts:read" }
  ]
}
```

---

### GET /api/roles/{role_id}/permissions/matrix

Get the full permission matrix for a specific role.

**Auth required:** `users:read`

---

### POST /api/roles/{role_id}/permissions

Add a permission to a role.

**Auth required:** `users:write`

**Request body:** `{ "permission_id": 3 }`

**Response `201`:** `{ "message": "Permission added to role" }`

---

### DELETE /api/roles/{role_id}/permissions/{permission_id}

Remove a permission from a role.

**Auth required:** `users:write`

**Response `204`:** No content

---

## 3. Dashboard

### GET /api/dashboard/tiles

Four KPI tile counts for the main dashboard.

**Auth required:** `alerts:read`

**Response `200`:**
```json
{
  "high_alerts_open": 14,
  "unassigned_alerts_open": 23,
  "open_cases": 8,
  "pending_strs": 2
}
```

| Field | Description |
|-------|-------------|
| `high_alerts_open` | HIGH priority alerts not yet closed |
| `unassigned_alerts_open` | Alerts with no analyst assigned, not yet closed |
| `open_cases` | Cases in any non-closed status |
| `pending_strs` | STRs awaiting Principal Officer approval |

---

## 4. Alerts

### GET /api/alerts

List all scored alerts ordered by priority score (highest first).

**Auth required:** `alerts:read`

**Query parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `priority_level` | string | — | `HIGH`, `MEDIUM`, or `LOW` |
| `status` | string | — | `PENDING` or `IN_PROGRESS` |
| `workflow_status` | string | — | `NEW`, `ASSIGNED`, `IN_REVIEW`, `ESCALATED`, `DISMISSED` |
| `has_case` | boolean | — | `true` = only alerts with a linked case |
| `limit` | integer | — | Max results (omit for all) |
| `offset` | integer | `0` | Pagination offset |

**Response `200`:**
```json
{
  "total": 142,
  "limit": 50,
  "offset": 0,
  "alerts": [
    {
      "alert_id": "ALT20260406000263",
      "priority_level": "HIGH",
      "priority_score": 100,
      "rule_score": 100,
      "ml_score": 1,
      "status": "IN_PROGRESS",
      "workflow_status": "ASSIGNED",
      "assigned_to_user_id": 5,
      "assigned_to_username": "Priya Sharma",
      "scored_at": "2026-04-06T00:43:03.736835",
      "alert_type": "PEP",
      "amount": 1581898.98,
      "currency": "INR",
      "severity": "HIGH",
      "alert_date": "2026-03-13T14:36:03.614905",
      "customer_id": "CUST000222",
      "customer_name": "Shree Holdings Pvt Ltd",
      "risk_rating": "HIGH",
      "is_pep": 0,
      "case_id": 113
    }
  ]
}
```

> `assigned_to_username` returns the analyst's **full name**.

---

### GET /api/alerts/open

List non-closed alerts (status `PENDING` or `IN_PROGRESS`) ordered by priority score. Use this for the main alert queue view.

**Auth required:** `alerts:read`

**Query parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `priority_level` | string | — | `HIGH`, `MEDIUM`, or `LOW` |
| `workflow_status` | string | — | `NEW`, `ASSIGNED`, `IN_REVIEW`, `ESCALATED`, `DISMISSED` |
| `has_case` | boolean | — | Filter by whether a case exists |
| `limit` | integer | — | Max results (omit for all) |
| `offset` | integer | `0` | Pagination offset |

**Response `200`:** Same structure as `GET /api/alerts`.

---

### GET /api/alerts/{alert_id}

Get full alert detail including scoring breakdown, rule explanations, customer profile, computed features, and AI summary.

**Auth required:** `alerts:read`

**Response `200`:**
```json
{
  "alert_id": "ALT20260406000263",
  "priority_level": "HIGH",
  "priority_score": 100,
  "rule_score": 100,
  "ml_score": 1,
  "rule_reasons": {
    "PEP": { "triggered": true, "score": 100, "reason": "Customer is a politically exposed person" }
  },
  "explanation": "PEP flag with high-value cross-border transfers",
  "model_version": "v1.2",
  "status": "IN_PROGRESS",
  "workflow_status": "ASSIGNED",
  "assigned_to_user_id": 5,
  "assigned_to_username": "Priya Sharma",
  "dismissed_reason": null,
  "scored_at": "2026-04-06T00:43:03.736835",
  "alert_type": "PEP",
  "amount": 1581898.98,
  "currency": "INR",
  "severity": "HIGH",
  "alert_date": "2026-03-13T14:36:03.614905",
  "scenario_code": "SCN-PEP-01",
  "source_system": "ACTIMIZE",
  "customer": {
    "customer_id": "CUST000222",
    "full_name": "Shree Holdings Pvt Ltd",
    "type": "business",
    "risk_rating": "HIGH",
    "is_pep": false,
    "nationality": "IND",
    "industry_code": "FINANCE",
    "occupation": null,
    "customer_since": "2020-01-01T00:00:00.000Z",
    "kyc_last_updated": "2025-06-01T00:00:00.000Z"
  },
  "features": {
    "txn_count_7d": 8,
    "txn_count_30d": 24,
    "txn_count_90d": 67,
    "avg_amount_30d": 185000.00,
    "max_amount_30d": 490000.00,
    "unique_counterparties_30d": 12,
    "countries_count_30d": 3,
    "high_risk_country_txns_30d": 2,
    "cash_intensive_ratio": 0.72,
    "alert_count_30d": 2,
    "alert_count_90d": 5,
    "features_computed_at": "2026-04-06T00:38:00.000Z"
  },
  "case": {
    "case_id": 113,
    "status": "IN_PROGRESS",
    "assigned_to_user_id": 5,
    "assigned_to_username": "Priya Sharma",
    "opened_at": "2026-04-06T01:00:00.000Z"
  },
  "ai_summary": {
    "alert_summary": "Customer shows coordinated cash movements...",
    "risk_signals": "PEP flag, high-value transfers to high-risk jurisdiction",
    "profile_analysis": "Business entity with elevated counterparty risk",
    "model": "gpt-4o",
    "prompt_tokens": 420,
    "completion_tokens": 210,
    "generated_at": "2026-04-06T01:05:00.000Z"
  }
}
```

> `ai_summary` is `null` if not yet generated. Use `POST /api/alerts/{alert_id}/generate-summary` to create one.

**Errors:**
| Status | Detail |
|--------|--------|
| 404 | Alert not found |

---

### POST /api/alerts/{alert_id}/open-case

Open an investigation case for an alert. Idempotent — returns existing case if already created.

**Auth required:** `cases:write`

**Request body** (all fields optional):
```json
{
  "assigned_to_user_id": 3,
  "notes": "Initial triage notes"
}
```

**Response `201`:**
```json
{
  "case_id": 113,
  "alert_id": "ALT20260406000263",
  "created": true,
  "message": "Case opened"
}
```

> If case already exists: `"created": false`, `"message": "Case already exists"`.

**Errors:**
| Status | Detail |
|--------|--------|
| 404 | Alert not found or not yet scored |

---

### Alert Queue Management (Triage)

#### GET /api/alerts/queue/unassigned

List all `NEW` (unassigned) alerts ordered by priority score.

**Auth required:** `alerts:assign`

**Query parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `priority_level` | string | — | `HIGH`, `MEDIUM`, or `LOW` |
| `limit` | integer | `50` | Max results (max: 500) |
| `offset` | integer | `0` | Pagination offset |

**Response `200`:**
```json
{
  "total": 23,
  "limit": 50,
  "offset": 0,
  "alerts": [
    {
      "alert_id": "ALT20260406000264",
      "priority_level": "HIGH",
      "priority_score": 91.2,
      "workflow_status": "NEW",
      "alert_type": "HAWALA",
      "amount": 750000.00,
      "currency": "INR",
      "alert_date": "2026-04-06T00:00:00.000Z",
      "customer_id": "CUST000045",
      "customer_name": "Priya Sharma",
      "risk_rating": "HIGH",
      "is_pep": false
    }
  ]
}
```

---

#### GET /api/alerts/queue/workload

Current alert counts per analyst (assigned + in-review). Use before assigning to balance workload.

**Auth required:** `alerts:assign`

**Response `200`:**
```json
{
  "workload": [
    {
      "user_id": 4,
      "username": "analyst1",
      "full_name": "Analyst One",
      "assigned_count": 12,
      "in_review_count": 3,
      "total": 15
    }
  ]
}
```

---

#### POST /api/alerts/{alert_id}/assign

Assign a `NEW` alert to an analyst.

**Auth required:** `alerts:assign`

**Request body:**
```json
{ "user_id": 4 }
```

**Response `200`:**
```json
{
  "message": "Alert assigned",
  "alert_id": "ALT20260406000264",
  "assigned_to": { "user_id": 4, "username": "analyst1", "full_name": "Analyst One" },
  "workflow_status": "ASSIGNED"
}
```

**Errors:**
| Status | Detail |
|--------|--------|
| 404 | Alert not found |
| 404 | Active user {user_id} not found |
| 409 | Cannot assign — current workflow_status is '{status}'. Use /reassign for active alerts. |

---

#### POST /api/alerts/{alert_id}/reassign

Reassign an alert to a different analyst. Allowed from `ASSIGNED`, `IN_REVIEW`, or `ESCALATED`.

**Auth required:** `alerts:assign`

**Request body:**
```json
{ "user_id": 5 }
```

**Response `200`:**
```json
{
  "message": "Alert reassigned",
  "alert_id": "ALT20260406000264",
  "assigned_to": { "user_id": 5, "username": "analyst2", "full_name": "Analyst Two" },
  "workflow_status": "ASSIGNED"
}
```

**Errors:**
| Status | Detail |
|--------|--------|
| 404 | Alert not found |
| 404 | Active user {user_id} not found |
| 409 | Cannot reassign — workflow_status is '{status}' |

---

#### POST /api/alerts/bulk-assign

Assign up to 100 `NEW` or `ASSIGNED` alerts to one analyst in a single call.

**Auth required:** `alerts:assign`

**Request body:**
```json
{
  "alert_ids": ["ALT20260406000264", "ALT20260406000265", "ALT20260406000266"],
  "user_id": 4
}
```

**Response `200`:**
```json
{
  "message": "3 alert(s) assigned",
  "assigned": ["ALT20260406000264", "ALT20260406000265", "ALT20260406000266"],
  "skipped": [],
  "assigned_to": { "user_id": 4, "username": "analyst1", "full_name": "Analyst One" }
}
```

> Alerts not in `NEW` or `ASSIGNED` status are silently skipped and listed in `skipped`.

---

### Alert Workflow (Analyst)

#### GET /api/alerts/queue/mine

List all alerts assigned to the currently authenticated user.

**Auth required:** Any authenticated user

**Query parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `workflow_status` | string | — | `ASSIGNED` or `IN_REVIEW` |
| `limit` | integer | `50` | Max results (max: 500) |
| `offset` | integer | `0` | Pagination offset |

**Response `200`:** Same structure as `GET /api/alerts`.

---

#### POST /api/alerts/{alert_id}/start-review

Mark an assigned alert as actively being reviewed. `ASSIGNED → IN_REVIEW`

**Auth required:** `alerts:write`

**Response `200`:**
```json
{
  "message": "Review started",
  "alert_id": "ALT20260406000264",
  "workflow_status": "IN_REVIEW"
}
```

**Errors:**
| Status | Detail |
|--------|--------|
| 403 | Alert is not assigned to you |
| 404 | Alert not found |
| 409 | Alert must be ASSIGNED to start review (current: IN_REVIEW) |

---

#### POST /api/alerts/{alert_id}/escalate

Escalate an alert for full investigation — opens a case automatically. `IN_REVIEW → ESCALATED`

**Auth required:** `alerts:write`

**Request body** (all fields optional):
```json
{
  "reason": "Multiple sub-threshold deposits across 3 branches in one week",
  "assigned_to_user_id": 3
}
```

**Response `201`:**
```json
{
  "message": "Alert escalated",
  "alert_id": "ALT20260406000264",
  "workflow_status": "ESCALATED",
  "case_id": 114
}
```

**Errors:**
| Status | Detail |
|--------|--------|
| 403 | Alert is not assigned to you |
| 404 | Alert not found or not yet scored |
| 409 | Alert must be IN_REVIEW to escalate (current: ASSIGNED) |

---

#### POST /api/alerts/{alert_id}/dismiss

Dismiss an alert as a false positive. `IN_REVIEW → DISMISSED`

**Auth required:** `alerts:write`

**Request body:**
```json
{ "reason": "Transactions are salary credits from verified employer — no structuring" }
```

> `reason` is required (minimum 5 characters).

**Response `200`:**
```json
{
  "message": "Alert dismissed",
  "alert_id": "ALT20260406000264",
  "workflow_status": "DISMISSED"
}
```

**Errors:**
| Status | Detail |
|--------|--------|
| 403 | Alert is not assigned to you |
| 404 | Alert not found |
| 409 | Alert must be IN_REVIEW to dismiss (current: ASSIGNED) |

---

### Alert Notes

#### POST /api/alerts/{alert_id}/notes

Add a note to an alert.

**Auth required:** `alerts:read`

**Request body:**
```json
{ "note": "Contacted branch manager — confirmed cash transactions are from agri sales" }
```

**Response `201`:** `{ "message": "Note added", "note_id": 7, "alert_id": "ALT20260406000264" }`

---

#### GET /api/alerts/{alert_id}/notes

Retrieve all notes for an alert (oldest first).

**Auth required:** `alerts:read`

**Response `200`:**
```json
{
  "alert_id": "ALT20260406000264",
  "notes": [
    {
      "id": 7,
      "user_id": 4,
      "username": "analyst1",
      "note": "Contacted branch manager — confirmed cash transactions are from agri sales",
      "created_at": "2026-04-06T11:30:00.000Z"
    }
  ]
}
```

---

### AI Summary

#### POST /api/alerts/{alert_id}/generate-summary

Generate an AI narrative for an alert using GPT-4o. PII is masked before sending. The summary is persisted and returned on subsequent `GET /api/alerts/{alert_id}` calls.

**Auth required:** `alerts:read`

**Query parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `regenerate` | boolean | `false` | Force regeneration even if summary already exists |

**Response `201`:**
```json
{
  "alert_id": "ALT20260406000264",
  "generated": true,
  "alert_summary": "Customer CUST000222 shows a pattern of coordinated cash withdrawals...",
  "risk_signals": "PEP flag, transactions to high-risk jurisdictions (UAE, Kenya)",
  "profile_analysis": "Business entity registered in 2020 with elevated counterparty risk",
  "model": "gpt-4o",
  "prompt_tokens": 420,
  "completion_tokens": 210,
  "generated_at": "2026-04-06T11:35:00.000Z"
}
```

> If `regenerate=false` and a summary already exists, `"generated": false` is returned with the cached summary.

**Errors:**
| Status | Detail |
|--------|--------|
| 404 | Alert not found |

---

## 5. Cases

### GET /api/cases

List all cases ordered by priority score (highest first).

**Auth required:** `cases:read`

**Query parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | — | `OPEN`, `IN_PROGRESS`, `STR_DRAFT`, `UNDER_REVIEW`, `CLOSED`, `CLOSED_FALSE_POSITIVE` |
| `priority_level` | string | — | `HIGH`, `MEDIUM`, or `LOW` |
| `assigned_to_user_id` | integer | — | Filter by assigned user ID |
| `limit` | integer | `50` | Max results (max: 500) |
| `offset` | integer | `0` | Pagination offset |

**Response `200`:**
```json
{
  "total": 28,
  "limit": 50,
  "offset": 0,
  "cases": [
    {
      "case_id": 113,
      "case_number": "CASE-2026-00113",
      "alert_id": "ALT20260406000263",
      "customer_id": "CUST000222",
      "priority_level": "HIGH",
      "status": "IN_PROGRESS",
      "summary": "Possible structuring across 3 linked accounts",
      "assigned_to_user_id": 5,
      "assigned_to_username": "Priya Sharma",
      "created_at": "2026-04-06T01:00:00.000Z",
      "updated_at": "2026-04-06T01:05:00.000Z",
      "closed_at": null,
      "priority_score": 100,
      "rule_score": 100,
      "ml_score": 1,
      "alert_type": "PEP",
      "amount": 1581898.98,
      "currency": "INR",
      "alert_date": "2026-03-13T14:36:03.614905",
      "customer_name": "Shree Holdings Pvt Ltd",
      "risk_rating": "HIGH",
      "is_pep": false
    }
  ]
}
```

---

### GET /api/cases/{case_id}

Get full case detail including alert scoring, rule breakdown, linked alerts, notes, and evidence.

**Auth required:** `cases:read`

**Response `200`:**
```json
{
  "case_id": 113,
  "case_number": "CASE-2026-00113",
  "alert_id": "ALT20260406000263",
  "customer_id": "CUST000222",
  "priority_level": "HIGH",
  "status": "IN_PROGRESS",
  "summary": "Possible structuring across 3 linked accounts",
  "assigned_to_user_id": 5,
  "assigned_to_username": "Priya Sharma",
  "investigator_id": 3,
  "created_at": "2026-04-06T01:00:00.000Z",
  "updated_at": "2026-04-06T01:05:00.000Z",
  "closed_at": null,
  "priority_score": 100,
  "rule_score": 100,
  "ml_score": 1,
  "rule_reasons": { "PEP": { "triggered": true, "score": 100, "reason": "Customer is a PEP" } },
  "explanation": "PEP flag with high-value cross-border transfers",
  "model_version": "v1.2",
  "alert_type": "PEP",
  "amount": 1581898.98,
  "currency": "INR",
  "severity": "HIGH",
  "alert_date": "2026-03-13T14:36:03.614905",
  "scenario_code": "SCN-PEP-01",
  "customer_name": "Shree Holdings Pvt Ltd",
  "customer_type": "business",
  "risk_rating": "HIGH",
  "is_pep": false,
  "nationality": "IND",
  "industry_code": "FINANCE",
  "occupation": null,
  "customer_since": "2020-01-01T00:00:00.000Z",
  "linked_alerts": [
    { "alert_id": "ALT20260406000270", "linked_at": "2026-04-06T02:00:00.000Z", "linked_by": "jane.investigator" }
  ],
  "notes": [
    { "id": 4, "user_id": 3, "username": "jane.investigator", "note": "Branch confirmed unusual pattern", "created_at": "2026-04-06T02:30:00.000Z" }
  ],
  "evidence": [
    { "id": 1, "file_name": "bank_statement_march.pdf", "s3_key": "cases/113/bank_statement_march.pdf", "uploaded_by": "jane.investigator", "uploaded_at": "2026-04-06T03:00:00.000Z" }
  ]
}
```

**Errors:**
| Status | Detail |
|--------|--------|
| 404 | Case not found |

---

### POST /api/cases

Create a new case directly without going through `open-case`.

**Auth required:** `cases:write`

**Request body:**
```json
{
  "alert_id": "ALT20260406000270",
  "summary": "Suspected hawala network — 4 related customers",
  "investigator_id": 3
}
```

**Response `201`:**
```json
{
  "case_id": 114,
  "case_number": "CASE-2026-00114",
  "alert_id": "ALT20260406000270",
  "message": "Case created"
}
```

**Errors:**
| Status | Detail |
|--------|--------|
| 404 | Alert not found or not yet scored |
| 409 | A case already exists for this alert |

---

### PATCH /api/cases/{case_id}

Update case metadata — reassign, update status, or add summary/investigator.

**Auth required:** `cases:write`

**Request body** (all fields optional):
```json
{
  "assigned_to_user_id": 3,
  "status": "IN_PROGRESS",
  "summary": "Confirmed 3 linked accounts; obtaining transaction history",
  "investigator_id": 3
}
```

> Allowed `status` values: `OPEN`, `IN_PROGRESS`, `STR_DRAFT`, `UNDER_REVIEW`.
> Use `POST /api/cases/{case_id}/close` for terminal statuses.

**Response `200`:** `{ "message": "Case updated", "case_id": 113 }`

**Errors:**
| Status | Detail |
|--------|--------|
| 400 | Use /close to set terminal statuses |
| 400 | No fields to update |
| 404 | Case not found |

---

### POST /api/cases/{case_id}/close

Close a case. Writes a ground truth record for future ML retraining.

**Auth required:** `cases:close`

**Request body:**
```json
{
  "outcome": "TRUE_POSITIVE",
  "rationale": "Confirmed structuring activity across 3 accounts. STR filed.",
  "closed_by": "jane.investigator"
}
```

> `outcome`: `TRUE_POSITIVE` → case status `CLOSED`; `FALSE_POSITIVE` → `CLOSED_FALSE_POSITIVE`
> `rationale` is required (minimum 5 characters).

**Response `200`:**
```json
{
  "message": "Case closed as TRUE_POSITIVE",
  "case_id": 113,
  "alert_id": "ALT20260406000263",
  "outcome": "TRUE_POSITIVE",
  "closed_by": "jane.investigator",
  "closed_at": "2026-04-08T14:30:00.000Z"
}
```

**Errors:**
| Status | Detail |
|--------|--------|
| 400 | outcome must be TRUE_POSITIVE or FALSE_POSITIVE |
| 404 | Case not found |
| 409 | Case already closed |

---

### DELETE /api/cases/{case_id}

Permanently delete a case. Restricted to super admins.

**Auth required:** `users:write`

**Response `200`:** `{ "message": "Case deleted" }`

---

### POST /api/cases/{case_id}/attach-alert

Link an additional alert to an existing case (many-to-many).

**Auth required:** `cases:write`

**Request body:** `{ "alert_id": "ALT20260406000270" }`

**Response `200`:** `{ "message": "Alert attached", "case_id": 113, "alert_id": "ALT20260406000270" }`

**Errors:**
| Status | Detail |
|--------|--------|
| 404 | Case not found |
| 404 | Alert not found |
| 409 | Cannot attach alerts to a closed case |

---

### Case Notes & Evidence

#### POST /api/cases/{case_id}/notes

Add a note to a case.

**Auth required:** `cases:read`

**Request body:**
```json
{ "note": "Obtained 6-month bank statement from branch. Three accounts show coordinated cash withdrawals." }
```

**Response `201`:** `{ "message": "Note added", "note_id": 4, "case_id": 113 }`

---

#### GET /api/cases/{case_id}/notes

Retrieve all case notes (oldest first).

**Auth required:** `cases:read`

**Response `200`:**
```json
{
  "case_id": 113,
  "notes": [
    { "id": 4, "user_id": 3, "username": "jane.investigator", "note": "Obtained 6-month bank statement.", "created_at": "2026-04-06T10:00:00.000Z" }
  ]
}
```

---

#### POST /api/cases/{case_id}/evidence

Generate a pre-signed S3 URL to upload a file as evidence. The frontend PUTs the file directly to this URL.

**Auth required:** `cases:write`

**Request body:**
```json
{ "file_name": "bank_statement_march.pdf", "content_type": "application/pdf" }
```

**Response `201`:**
```json
{
  "upload_url": "https://s3.amazonaws.com/aml-evidence/cases/113/bank_statement_march.pdf?X-Amz-Signature=...",
  "s3_key": "cases/113/bank_statement_march.pdf",
  "expires_in": 900
}
```

> `upload_url` expires in **15 minutes**. Use `PUT` with a matching `Content-Type` header.

---

## 6. STR (Suspicious Transaction Reports)

### Lifecycle

```
DRAFT → PENDING_APPROVAL → APPROVED → SUBMITTED
                         → REJECTED  (editable → re-submit)
```

Case status changes in parallel:
- STR created → case: `STR_DRAFT`
- STR submitted → case: `UNDER_REVIEW`
- STR rejected → case: `IN_PROGRESS`
- STR submitted to regulator → case: `CLOSED`

---

### GET /api/str

List STRs with optional filters, ordered by creation date (newest first).

**Auth required:** `str:read`

**Query parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | — | `DRAFT`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `SUBMITTED` |
| `case_id` | integer | — | Filter by case |
| `limit` | integer | `50` | Max results (max: 500) |
| `offset` | integer | `0` | Pagination offset |

**Response `200`:**
```json
{
  "total": 5,
  "limit": 50,
  "offset": 0,
  "strs": [
    {
      "id": 1,
      "case_id": 113,
      "status": "PENDING_APPROVAL",
      "version": 2,
      "created_by": 3,
      "approved_by": null,
      "submitted_at": null,
      "created_at": "2026-04-07T09:00:00.000Z",
      "updated_at": "2026-04-07T11:00:00.000Z",
      "case_number": "CASE-2026-00113",
      "priority_level": "HIGH",
      "created_by_username": "investigator1"
    }
  ]
}
```

---

### GET /api/str/pending

List all STRs awaiting Principal Officer approval, ordered by alert priority score.

**Auth required:** `str:approve`

---

### GET /api/str/{str_id}

Get full STR detail.

**Auth required:** `str:read`

**Response `200`:**
```json
{
  "id": 1,
  "case_id": 113,
  "status": "PENDING_APPROVAL",
  "narrative": "Customer CUST000222 conducted 12 cash transactions in March...",
  "evidence_refs": ["cases/113/bank_statement_march.pdf"],
  "version": 2,
  "created_by": 3,
  "approved_by": null,
  "rejection_reason": null,
  "submitted_at": null,
  "created_at": "2026-04-07T09:00:00.000Z",
  "updated_at": "2026-04-07T11:00:00.000Z",
  "case_number": "CASE-2026-00113",
  "priority_level": "HIGH",
  "created_by_username": "investigator1"
}
```

**Errors:** `404` STR not found

---

### POST /api/cases/{case_id}/str

Create a new STR draft for a case. Sets case status → `STR_DRAFT`.

**Auth required:** `str:write`

> Case must be `OPEN` or `IN_PROGRESS`. Only one active STR allowed per case at a time.

**Request body** (all fields optional):
```json
{
  "narrative": "Customer conducted multiple structured cash transactions...",
  "evidence_refs": ["cases/113/bank_statement_march.pdf"]
}
```

**Response `201`:** `{ "str_id": 1, "case_id": 113, "status": "DRAFT", "message": "STR draft created" }`

**Errors:**
| Status | Detail |
|--------|--------|
| 404 | Case not found |
| 409 | Cannot draft STR — case status is 'CLOSED' |
| 409 | An active STR already exists for this case |

---

### PATCH /api/str/{str_id}

Edit an STR in `DRAFT` or `REJECTED` status. Each save increments the version.

**Auth required:** `str:write`

**Request body** (at least one field required):
```json
{
  "narrative": "Updated narrative with additional transaction details...",
  "evidence_refs": ["cases/113/bank_statement_march.pdf", "cases/113/transaction_history.xlsx"]
}
```

**Response `200`:** `{ "message": "STR updated", "str_id": 1, "version": 3 }`

---

### POST /api/str/{str_id}/submit

Submit STR for Principal Officer review. `DRAFT → PENDING_APPROVAL`; case → `UNDER_REVIEW`

**Auth required:** `str:write`

> Narrative must be filled in before submission.

**Response `200`:** `{ "message": "STR submitted for approval", "str_id": 1, "status": "PENDING_APPROVAL", "case_id": 113 }`

---

### POST /api/str/{str_id}/approve

Approve a pending STR. `PENDING_APPROVAL → APPROVED`

**Auth required:** `str:approve`

**Response `200`:** `{ "message": "STR approved", "str_id": 1, "status": "APPROVED", "approved_by": "principal_off" }`

---

### POST /api/str/{str_id}/reject

Reject a pending STR. `PENDING_APPROVAL → REJECTED`; case → `IN_PROGRESS`

**Auth required:** `str:approve`

**Request body:** `{ "reason": "Narrative does not include counterparty details." }`

> `reason` is required (minimum 10 characters).

**Response `200`:**
```json
{
  "message": "STR rejected — case returned to investigator",
  "str_id": 1,
  "status": "REJECTED",
  "case_id": 113,
  "reason": "Narrative does not include counterparty details.",
  "rejected_by": "principal_off"
}
```

---

### POST /api/str/{str_id}/submit-to-regulator

Mark an approved STR as filed with FIU-IND. `APPROVED → SUBMITTED`; case → `CLOSED`

**Auth required:** `str:approve`

**Response `200`:**
```json
{
  "message": "STR submitted to regulator — case closed",
  "str_id": 1,
  "status": "SUBMITTED",
  "case_id": 113,
  "submitted_by": "principal_off",
  "submitted_at": "2026-04-08T14:00:00.000Z"
}
```

---

## 7. Audit Log

Append-only record of every state transition across alerts, cases, and STRs.

### GET /api/audit-logs

Full audit log with optional filters, newest first.

**Auth required:** `audit_log:read`

**Query parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `entity_type` | string | — | `ALERT`, `CASE`, or `STR` |
| `entity_id` | string | — | Alert ID, case_id, or STR id |
| `user_id` | integer | — | Filter by user who performed the action |
| `action` | string | — | e.g. `ALERT_ASSIGNED`, `CASE_CLOSED` |
| `limit` | integer | `50` | Max results (max: 500) |
| `offset` | integer | `0` | Pagination offset |

**Response `200`:**
```json
{
  "total": 3,
  "limit": 50,
  "offset": 0,
  "logs": [
    {
      "id": 42,
      "user_id": 3,
      "username": "jane.investigator",
      "action": "CASE_CLOSED",
      "entity_type": "CASE",
      "entity_id": "113",
      "old_value": { "status": "UNDER_REVIEW" },
      "new_value": { "status": "CLOSED", "outcome": "TRUE_POSITIVE" },
      "timestamp": "2026-04-08T14:05:00.000Z"
    }
  ]
}
```

**Action reference:**
| Action | Triggered by |
|--------|-------------|
| `ALERT_ASSIGNED` | Triage assigns alert |
| `ALERT_REASSIGNED` | Triage reassigns alert |
| `ALERT_BULK_ASSIGNED` | Bulk assign |
| `ALERT_REVIEW_STARTED` | Analyst starts review |
| `ALERT_ESCALATED` | Analyst escalates alert |
| `ALERT_DISMISSED` | Analyst dismisses alert |
| `CASE_CREATED` | New case created |
| `CASE_UPDATED` | Case metadata changed |
| `CASE_CLOSED` | Case closed |
| `CASE_ALERT_LINKED` | Additional alert attached |
| `STR_CREATED` | STR draft created |
| `STR_UPDATED` | STR draft edited |
| `STR_SUBMITTED` | STR submitted for approval |
| `STR_APPROVED` | STR approved |
| `STR_REJECTED` | STR rejected |
| `STR_FILED` | STR submitted to regulator |

---

### GET /api/audit-logs/{entity_type}/{entity_id}

Full chronological history for a specific alert, case, or STR.

**Auth required:** `audit_log:read`

**Path parameters:**
| Parameter | Description |
|-----------|-------------|
| `entity_type` | `ALERT`, `CASE`, or `STR` |
| `entity_id` | Alert ID (string), case_id (integer), or STR id (integer) |

---

## 8. Rules Engine

### GET /api/rules/configs

List all AML rule configurations.

**Auth required:** `rules:read`

**Query parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `is_enabled` | boolean | — | Filter by enabled/disabled |
| `category` | string | — | Filter by category |

**Response `200`:**
```json
{
  "total": 9,
  "rules": [
    {
      "rule_id": "STRUCTURING",
      "rule_name": "Structuring Detection",
      "description": "Detects multiple transactions just below reporting threshold",
      "category": "CASH",
      "is_enabled": true,
      "base_score": 80,
      "priority": 1,
      "version": 3,
      "created_at": "2026-01-01T00:00:00.000Z",
      "updated_at": "2026-03-10T00:00:00.000Z",
      "updated_by": "admin"
    }
  ]
}
```

---

### GET /api/rules/configs/{rule_id}

Get a specific rule with its thresholds.

**Auth required:** `rules:read`

**Query parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `include_thresholds` | boolean | `true` | Include threshold parameters |

**Response `200`:**
```json
{
  "rule_id": "STRUCTURING",
  "rule_name": "Structuring Detection",
  "category": "CASH",
  "is_enabled": true,
  "base_score": 80,
  "thresholds": [
    {
      "threshold_id": 1,
      "parameter_name": "amount_threshold",
      "parameter_value": 1000000.0,
      "parameter_type": "DECIMAL",
      "display_name": "Cash Threshold (INR)",
      "min_allowed": 100000.0,
      "max_allowed": 10000000.0,
      "default_value": 1000000.0,
      "unit": "INR"
    }
  ]
}
```

---

### POST /api/rules/configs

Create a new rule configuration.

**Auth required:** `rules:write`

**Request body:**
```json
{
  "rule_id": "CUSTOM_RULE",
  "rule_name": "Custom Rule Name",
  "description": "Description of what this rule detects",
  "category": "CUSTOM",
  "is_enabled": true,
  "base_score": 60,
  "priority": 10
}
```

**Response `201`:** `{ "message": "Rule created successfully", "rule_id": "CUSTOM_RULE" }`

---

### PUT /api/rules/configs/{rule_id}

Update a rule configuration. All changes are audit logged.

**Auth required:** `rules:write`

**Query parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `changed_by` | string | `api_user` | Username making the change |

**Request body** (all optional):
```json
{ "is_enabled": true, "base_score": 75, "priority": 2 }
```

**Response `200`:** `{ "message": "Rule updated successfully", "version": 4, "changes": 2 }`

---

### POST /api/rules/configs/{rule_id}/toggle

Enable or disable a rule (toggles current state).

**Auth required:** `rules:write`

**Request body:** `{ "changed_by": "admin" }`

**Response `200`:** `{ "message": "Rule disabled", "is_enabled": false }`

---

### GET /api/rules/thresholds/{rule_id}

Get all threshold parameters for a rule.

**Auth required:** `rules:read`

---

### PUT /api/rules/thresholds/{threshold_id}

Update a single threshold parameter.

**Auth required:** `rules:write`

**Request body:**
```json
{
  "parameter_value": 900000.0,
  "description": "Lowered threshold to catch smaller structuring attempts"
}
```

**Response `200`:** `{ "message": "Threshold updated successfully" }`

---

### POST /api/rules/thresholds/{rule_id}/bulk-update

Update multiple thresholds for a rule in a single request.

**Auth required:** `rules:write`

**Request body:**
```json
{
  "thresholds": { "amount_threshold": 900000.0, "transaction_count": 4.0 },
  "reason": "Quarterly threshold review",
  "changed_by": "admin"
}
```

**Response `200`:** `{ "message": "Updated 2 thresholds", "updated_count": 2 }`

---

### POST /api/rules/thresholds/{rule_id}/reset

Reset all thresholds for a rule to defaults.

**Auth required:** `rules:write`

**Request body:** `{ "changed_by": "admin" }`

**Response `200`:** `{ "message": "Reset 2 thresholds to defaults", "reset_count": 2 }`

---

### GET /api/rules/audit-log

Audit log of all rule configuration changes.

**Auth required:** `audit_log:read`

**Query parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `rule_id` | string | — | Filter by rule ID |
| `changed_by` | string | — | Filter by username |
| `limit` | integer | `50` | Max results (max: 500) |

**Response `200`:**
```json
{
  "total": 12,
  "entries": [
    {
      "log_id": 42,
      "rule_id": "STRUCTURING",
      "change_type": "THRESHOLD_CHANGED",
      "field_changed": "amount_threshold",
      "old_value": "1000000.0",
      "new_value": "900000.0",
      "changed_by": "admin",
      "changed_at": "2026-03-16T11:00:00.000Z",
      "reason": "Quarterly threshold review"
    }
  ]
}
```

> `change_type` values: `CONFIG_CHANGED`, `THRESHOLD_CHANGED`, `TOGGLED`, `RESET_TO_DEFAULT`

---

## 9. Reference Data

### High-Risk Countries

#### GET /api/reference/countries

**Auth required:** `reference:read`

**Query parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `risk_level` | string | — | `HIGH`, `MEDIUM`, `LOW` |
| `is_active` | boolean | `true` | Show active/inactive |

**Response `200`:**
```json
{
  "total": 24,
  "countries": [
    {
      "country_code": "IRN",
      "country_name": "Iran",
      "risk_level": "HIGH",
      "risk_score": 95,
      "reason": "FATF blacklist — state-sponsored money laundering",
      "added_date": "2024-01-01",
      "is_active": true,
      "last_updated": "2026-01-15T00:00:00.000Z"
    }
  ]
}
```

#### GET /api/reference/countries/{country_code}

Get a specific country by ISO 3-letter code. **Auth required:** `reference:read`

#### POST /api/reference/countries

**Auth required:** `reference:write`

```json
{
  "country_code": "PRK",
  "country_name": "North Korea",
  "risk_level": "HIGH",
  "risk_score": 98,
  "reason": "UN sanctions — weapons proliferation financing",
  "is_active": true
}
```

**Response `201`:** `{ "message": "Country created successfully", "country_code": "PRK" }`

#### PUT /api/reference/countries/{country_code}

Update a country. **Auth required:** `reference:write`

#### DELETE /api/reference/countries/{country_code}

Soft-delete (`is_active = false`). **Auth required:** `reference:write`

---

### High-Risk Locations

#### GET /api/reference/locations

**Auth required:** `reference:read`

**Query parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `location_type` | string | `BORDER`, `CASH_INTENSIVE`, `HIGH_CRIME` |
| `risk_level` | string | `HIGH`, `MEDIUM`, `LOW` |
| `is_active` | boolean | Default: `true` |

#### POST /api/reference/locations

**Auth required:** `reference:write`

```json
{
  "location_name": "Dharavi",
  "state": "Maharashtra",
  "country_code": "IND",
  "location_type": "CASH_INTENSIVE",
  "risk_level": "HIGH",
  "risk_score": 75,
  "reason": "High cash economy, informal lending networks",
  "is_active": true
}
```

#### PUT /api/reference/locations/{location_id}

**Auth required:** `reference:write`

#### DELETE /api/reference/locations/{location_id}

Soft-delete. **Auth required:** `reference:write`

---

### Industry Risk Scores

#### GET /api/reference/industries

**Auth required:** `reference:read`

**Query parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `risk_level` | string | `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| `cash_intensive` | boolean | Filter cash-intensive industries |

**Response `200`:**
```json
{
  "total": 20,
  "industries": [
    {
      "industry_code": "JEWELLERY",
      "industry_name": "Jewellery & Precious Metals",
      "risk_level": "HIGH",
      "risk_score": 85,
      "cash_intensive": true,
      "reason": "High-value cash transactions, easy to launder",
      "regulatory_notes": "Subject to PMLA reporting requirements",
      "last_updated": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/reference/industries

**Auth required:** `reference:write`

```json
{
  "industry_code": "CRYPTO",
  "industry_name": "Cryptocurrency Exchange",
  "risk_level": "HIGH",
  "risk_score": 80,
  "cash_intensive": false,
  "reason": "Anonymity risk, cross-border movement",
  "regulatory_notes": "RBI circular 2024 — mandatory KYC for all crypto transactions"
}
```

#### PUT /api/reference/industries/{industry_code}

**Auth required:** `reference:write`

---

### Sanctioned Countries

#### GET /api/reference/sanctioned-countries

**Auth required:** `reference:read`

**Response `200`:**
```json
{
  "total": 10,
  "sanctioned_countries": [
    {
      "sanction_id": 1,
      "country_code": "PRK",
      "country_name": "North Korea",
      "sanction_body": "UN",
      "sanction_type": "COMPREHENSIVE",
      "effective_date": "2006-10-14",
      "is_active": true,
      "notes": "Weapons proliferation financing",
      "last_updated": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /api/reference/sanctioned-countries/{sanction_id}

**Auth required:** `reference:read`

#### POST /api/reference/sanctioned-countries

**Auth required:** `reference:write`

#### PUT /api/reference/sanctioned-countries/{sanction_id}

**Auth required:** `reference:write`

#### DELETE /api/reference/sanctioned-countries/{sanction_id}

**Auth required:** `reference:write`

---

## 10. Customer 360

All endpoints require `customers:read`, granted to: `analyst`, `investigator`, `principal_officer`, `compliance`, `super_admin`.

---

### GET /api/customers

Paginated customer list with search and filter.

**Auth required:** `customers:read`

**Query parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `search` | string | — | Case-insensitive search across name, customer_id, display_name, registration_number |
| `party_type` | string | — | `individual`, `business`, `trust`, `NGO`, `government` |
| `customer_status` | string | — | `active`, `inactive`, `blocked`, `exited` |
| `risk_rating` | string | — | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `customer_segment` | string | — | Customer segment code |
| `is_pep` | boolean | — | PEP-flagged customers only |
| `limit` | integer | `50` | 1–500 |
| `offset` | integer | `0` | Pagination offset |

**Response `200`:**
```json
{
  "total": 300,
  "limit": 50,
  "offset": 0,
  "customers": [
    {
      "customer_id": "CUST000222",
      "party_type": "business",
      "full_name": "Shree Holdings Pvt Ltd",
      "customer_status": "active",
      "risk_rating": "HIGH",
      "is_pep": false,
      "customer_segment": "SME",
      "registration_number": "U65999MH2020PTC123456",
      "created_at": "2020-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /api/customers/{customer_id}

Get core customer profile.

**Auth required:** `customers:read`

**Response `200`:**
```json
{
  "customer_id": "CUST000222",
  "party_type": "business",
  "full_name": "Shree Holdings Pvt Ltd",
  "display_name": "Shree Holdings",
  "customer_status": "active",
  "risk_rating": "HIGH",
  "is_pep": false,
  "nationality": "IND",
  "country_of_residence": "IND",
  "industry_code": "FINANCE",
  "customer_segment": "SME",
  "registration_number": "U65999MH2020PTC123456",
  "date_of_incorporation": "2020-01-15",
  "onboarding_date": "2020-02-01",
  "kyc_status": "VERIFIED",
  "kyc_last_updated": "2025-06-01T00:00:00.000Z",
  "aml_risk_score": 78.5,
  "last_risk_review": "2025-12-01T00:00:00.000Z",
  "relationship_manager": "RM001",
  "branch_code": "MUM001"
}
```

---

### GET /api/customers/{customer_id}/identifiers

Government-issued IDs linked to the customer (PAN, Aadhaar, CIN, etc.).

**Auth required:** `customers:read`

---

### GET /api/customers/{customer_id}/aliases

Known aliases, trade names, and alternate names.

**Auth required:** `customers:read`

---

### GET /api/customers/{customer_id}/contacts

Phone numbers and email addresses.

**Auth required:** `customers:read`

---

### GET /api/customers/{customer_id}/addresses

All addresses (current, registered, correspondence).

**Auth required:** `customers:read`

---

### GET /api/customers/{customer_id}/accounts

All bank accounts linked to the customer.

**Auth required:** `customers:read`

**Response `200`:**
```json
{
  "customer_id": "CUST000222",
  "total": 3,
  "accounts": [
    {
      "account_id": "ACC000001",
      "account_number": "001234567890",
      "account_type": "CURRENT",
      "currency": "INR",
      "status": "ACTIVE",
      "balance": 4250000.00,
      "opened_date": "2020-02-01",
      "branch_code": "MUM001"
    }
  ]
}
```

---

### GET /api/customers/{customer_id}/account-relationships

Joint holders and signatories across accounts.

**Auth required:** `customers:read`

---

### GET /api/customers/{customer_id}/transactions

Transaction history with filters.

**Auth required:** `customers:read`

**Query parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `from_date` | date | — | `YYYY-MM-DD` |
| `to_date` | date | — | `YYYY-MM-DD` |
| `trans_type` | string | — | `CREDIT`, `DEBIT` |
| `min_amount` | float | — | Minimum amount |
| `max_amount` | float | — | Maximum amount |
| `country` | string | — | ISO 3-letter country code |
| `limit` | integer | `50` | 1–500 |
| `offset` | integer | `0` | Pagination offset |

**Response `200`:**
```json
{
  "customer_id": "CUST000222",
  "total": 142,
  "transactions": [
    {
      "trans_id": "TXN0001234",
      "trans_date": "2026-03-13T14:36:03.000Z",
      "amount": 1581898.98,
      "currency": "INR",
      "trans_type": "DEBIT",
      "country": "ARE",
      "counterparty_id": "CPTY000045",
      "account_id": "ACC000001"
    }
  ]
}
```

---

### GET /api/customers/{customer_id}/network

Counterparty network — entities this customer transacted with.

**Auth required:** `customers:read`

---

### GET /api/customers/{customer_id}/risk-history

Historical risk rating changes over time.

**Auth required:** `customers:read`

---

### GET /api/customers/{customer_id}/kyc-profile

KYC verification details and document status.

**Auth required:** `customers:read`

---

### GET /api/customers/{customer_id}/documents

KYC and compliance documents on file.

**Auth required:** `customers:read`

---

### GET /api/customers/{customer_id}/screening-results

Sanctions and PEP screening results.

**Auth required:** `customers:read`

---

### GET /api/customers/{customer_id}/beneficial-owners

Ultimate beneficial owners (UBOs) for business entities.

**Auth required:** `customers:read`

---

### GET /api/customers/{customer_id}/devices

Registered devices (mobile/web) used by the customer.

**Auth required:** `customers:read`

---

### GET /api/customers/{customer_id}/regulatory-filings

STRs and other regulatory filings linked to this customer.

**Auth required:** `customers:read`

---

### GET /api/customers/{customer_id}/watchlist-entries

Active watchlist and sanctions list matches.

**Auth required:** `customers:read`

---

### GET /api/customers/{customer_id}/alerts

All AML alerts for this customer.

**Auth required:** `customers:read`

**Response `200`:**
```json
{
  "customer_id": "CUST000222",
  "total": 5,
  "alerts": [
    {
      "alert_id": "ALT20260406000263",
      "alert_type": "PEP",
      "severity": "HIGH",
      "amount": 1581898.98,
      "currency": "INR",
      "alert_date": "2026-03-13T14:36:03.614905",
      "priority_level": "HIGH",
      "priority_score": 100,
      "workflow_status": "ASSIGNED",
      "assigned_to_user_id": 5,
      "assigned_to_username": "Priya Sharma"
    }
  ]
}
```

---

### GET /api/customers/{customer_id}/cases

All investigation cases for this customer.

**Auth required:** `customers:read`

---

### GET /api/customers/{customer_id}/360

Full Customer 360 view — all data in a single call. Use for loading the complete customer profile page.

**Auth required:** `customers:read`

**Response `200`:** Combined object containing profile, accounts, transactions summary, alerts, cases, screening results, risk history, beneficial owners, and all other sub-resources.

---

## 11. Model

### GET /api/model/status

Read-only metadata about the currently deployed ML model. Tries S3 first (reflects what Lambda is using), falls back to local `models/latest_model.json`.

**Auth required:** `model:read`

**Response `200`:**
```json
{
  "model_type": "GradientBoosting",
  "trained_at": "2026-04-01T08:00:00.000Z",
  "version": "v1.2",
  "s3_model_key": "models/alert_prioritization_v1.pkl",
  "rule_weight": 0.6,
  "ml_weight": 0.4,
  "high_priority_threshold": 60,
  "medium_priority_threshold": 30,
  "training_stats": {
    "total_samples": 2840,
    "true_positive_samples": 412,
    "false_positive_samples": 2428,
    "analyst_labeled": 310,
    "heuristic_labeled": 2530
  },
  "metadata_source": "s3",
  "retrieved_at": "2026-05-26T06:00:00.000Z"
}
```

| `metadata_source` | Meaning |
|---|---|
| `s3` | Live model metadata — reflects what the Scoring Lambda is using |
| `local` | S3 unreachable — fell back to local file |
| `unavailable` | No metadata found anywhere |

---

## 12. System

### GET /health

Check system health. No auth required.

**Response `200`:**
```json
{
  "status": "healthy",
  "database": "connected",
  "enabled_rules": 9,
  "pending_alerts": 47,
  "open_cases": 12,
  "timestamp": "2026-05-26T06:00:00.000Z"
}
```

---

## 13. Roles & Permissions Reference

### Demo Users (password: `Fincriss@123`)

| Username | Role | Description |
|----------|------|-------------|
| `admin` | `super_admin` | Full access |
| `triage_mgr` | `triage_manager` | Assigns and balances alert workload |
| `analyst1` | `analyst` | Reviews assigned alerts |
| `investigator1` | `investigator` | Opens cases, drafts STRs |
| `principal_off` | `principal_officer` | Approves STR filings |
| `compliance1` | `compliance` | Read-only audit access |

---

### Alert Workflow States

```
NEW → ASSIGNED → IN_REVIEW → ESCALATED
                           → DISMISSED
```

| State | Assign endpoint | Description |
|-------|----------------|-------------|
| `NEW` | `/assign` | Scored, not yet assigned |
| `ASSIGNED` | `/reassign` | Assigned to analyst |
| `IN_REVIEW` | `/reassign` | Analyst actively reviewing |
| `ESCALATED` | `/reassign` | Escalated to investigation — case opened |
| `DISMISSED` | — | Closed as false positive |

---

### Case Lifecycle States

```
OPEN → IN_PROGRESS → STR_DRAFT → UNDER_REVIEW → CLOSED
                                              → CLOSED_FALSE_POSITIVE
```

---

### STR Lifecycle States

```
DRAFT → PENDING_APPROVAL → APPROVED → SUBMITTED
                         → REJECTED  (editable → re-submit)
```

---

### Permission Matrix

| Permission | triage_manager | analyst | investigator | principal_officer | compliance | super_admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `alerts:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `alerts:write` | | ✓ | ✓ | ✓ | | ✓ |
| `alerts:assign` | ✓ | | ✓ | | | ✓ |
| `cases:read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `cases:write` | | | ✓ | ✓ | | ✓ |
| `cases:close` | | | ✓ | ✓ | | ✓ |
| `customers:read` | | ✓ | ✓ | ✓ | ✓ | ✓ |
| `model:read` | | | | ✓ | ✓ | ✓ |
| `rules:read` | | | | ✓ | ✓ | ✓ |
| `rules:write` | | | | | | ✓ |
| `reference:read` | | ✓ | ✓ | ✓ | ✓ | ✓ |
| `reference:write` | | | | | | ✓ |
| `str:read` | | | ✓ | ✓ | ✓ | ✓ |
| `str:write` | | | ✓ | ✓ | | ✓ |
| `str:approve` | | | | ✓ | | ✓ |
| `audit_log:read` | | | | ✓ | ✓ | ✓ |
| `users:read` | | | | | | ✓ |
| `users:write` | | | | | | ✓ |

---

## 14. Error Responses

All errors follow this structure:

```json
{ "detail": "Human-readable error message" }
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `204` | Success, no content |
| `400` | Bad request — invalid input |
| `401` | Unauthorized — missing or invalid token |
| `403` | Forbidden — valid token but insufficient permissions |
| `404` | Resource not found |
| `409` | Conflict — invalid state transition or duplicate resource |
| `500` | Internal server error |

### Common Error Examples

```json
{ "detail": "Invalid or expired token" }
{ "detail": "Permission required: cases:write" }
{ "detail": "Incorrect username or password" }
{ "detail": "Account is disabled" }
{ "detail": "Alert not found" }
{ "detail": "Case already closed" }
{ "detail": "Cannot assign — current workflow_status is 'ESCALATED'. Use /reassign for active alerts." }
{ "detail": "Cannot reassign — workflow_status is 'DISMISSED'" }
```
