# Technical Architecture – Request Approval System 

## 📌 Overview

This system implements an event-driven approval workflow using Azure serverless services. It enables users to submit requests via a web UI and facilitates approval/rejection through email-based actions.

---

## 🧩 System Components

### 1. Frontend (Azure Static Web App)

**Technology:** HTML, CSS, JavaScript

**Hosting:** Azure Static Web Apps

**Responsibilities:**

* Capture user input (segment, category, amount, email)
* Format and validate data
* Invoke backend API via HTTP POST

**API Call:**

```http
POST /api/submitRequest
Content-Type: application/json
```

**Payload:**

```json
{
  "segment": "RTO",
  "category": "RTO Cat1",
  "amount": 10000,
  "email": "user@email.com",
  "caseId": "RTO-RTO Cat1"
}
```

---

### 2. Backend API (Azure Functions)

#### 🔹 Function: submitRequest

**Trigger:** HTTP POST
**Purpose:** Entry point for new requests

**Responsibilities:**

* Generate unique requestId (timestamp-based)
* Persist request in Table Storage
* Invoke Logic App (HTTP trigger)

**Output:**

```json
{
  "message": "Saved successfully",
  "requestId": "1773767012345"
}
```

---

#### 🔹 Function: approveRequest

**Trigger:** HTTP GET (via email link)

**Query Params:**

```http
?requestId=<id>&caseId=<id>
```

**Responsibilities:**

* Validate input parameters
* Update Table Storage:

  * status = "Approved"
* Return HTML response page

---

#### 🔹 Function: rejectRequest

**Trigger:** HTTP GET (via email link)

**Responsibilities:**

* Update Table Storage:

  * status = "Rejected"
* Return confirmation HTML

---

### 3. Database (Azure Table Storage)

**Table Name:** requests

**Schema:**

| Column       | Type     | Description                   |
| ------------ | -------- | ----------------------------- |
| partitionKey | string   | caseId                        |
| rowKey       | string   | requestId                     |
| segment      | string   | Business segment              |
| category     | string   | Request category              |
| amount       | number   | Requested amount              |
| email        | string   | Requestor email               |
| status       | string   | Pending / Approved / Rejected |
| createdAt    | datetime | ISO timestamp                 |

---

### 4. Workflow Engine (Azure Logic App)

**Trigger:** HTTP Request

**Input Payload:**

```json
{
  "requestId": "...",
  "caseId": "...",
  "segment": "...",
  "category": "...",
  "amount": 10000,
  "email": "..."
}
```

**Actions:**

* Send email using Outlook connector
* Construct dynamic approval links:

```text
Approve:
https://<function-app>/api/approveRequest?requestId=...&caseId=...

Reject:
https://<function-app>/api/rejectRequest?requestId=...&caseId=...
```

---

### 5. Email System

**Connector:** Office 365 Outlook

**Features:**

* HTML email body
* Embedded approval links
* Dynamic data injection

---

## 🔄 End-to-End Data Flow

1. User submits request via frontend UI
2. Frontend sends POST request to submitRequest function
3. Function:

   * Generates requestId
   * Stores record in Table Storage (status = Pending)
4. Function invokes Logic App via HTTP POST
5. Logic App sends approval email
6. User clicks Approve/Reject link
7. Corresponding function is triggered
8. Status updated in Table Storage
9. HTML confirmation page displayed

---

## ⚙️ Architecture Pattern

* **Serverless Architecture**
* **Event-Driven Workflow**
* **Stateless APIs**
* **Decoupled Services (Function ↔ Logic App)**

---

## 🔐 Security Architecture

### 1. API Security

* Azure Function secured via function keys
* Only trusted clients invoke APIs

### 2. Logic App Security

* Protected using signed URL (sig parameter)
* Prevents unauthorized execution

### 3. CORS

* Configured to allow Static Web App domain

### 4. Data Protection

* No sensitive data stored (PII minimal)
* Storage access via secure key credentials

---

## ⚠️ Error Handling & Edge Cases

* Missing query params → HTTP 400
* Invalid requestId → safe failure (no update)
* Email delivery failure → retry via Logic App (optional enhancement)
* Duplicate requests handled via unique rowKey

---

## 📊 Scalability Considerations

* Azure Functions auto-scale based on demand
* Table Storage supports large-scale data
* Logic App handles concurrent workflows

---

## 💰 Cost Optimization

* Consumption-based billing
* No idle infrastructure cost
* Pay-per-execution model

---

## 🚀 Future Enhancements

* Authentication via Azure AD
* Multi-level approval workflow
* Approval timeout & escalation
* Dashboard (React / Power BI)
* Logging via Application Insights
* Retry policies in Logic App
* Role-based email routing

---
