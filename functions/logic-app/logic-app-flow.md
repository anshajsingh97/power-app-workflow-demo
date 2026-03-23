# Approval Workflow – Detailed Flow (Logic App Orchestration)

## 📌 Purpose
This document explains the execution flow of the approval system, with focus on how Azure Logic App orchestrates the process.

---

## 🔄 End-to-End Flow

### Step 1: Request Submission
- User submits request via Static Web App
- API call sent to Azure Function (submitRequest)

### Step 2: Data Persistence
- Request stored in Azure Table Storage
- Status set to **Pending**

---

## ⚡ Step 3: Logic App Trigger (Core Orchestration)

- Azure Function calls Logic App via HTTP POST
- Payload includes:
  - requestId
  - caseId
  - segment
  - category
  - amount
  - email

---

## 📧 Step 4: Email Generation (Logic App)

Logic App performs:

- Uses Outlook connector
- Sends approval email
- Email contains dynamic links:

---

## ✅ Step 5: Approval / Rejection

When user clicks link:

### Approve Flow:
- Calls approveRequest function
- Updates Table Storage:
  - status = Approved

### Reject Flow:
- Calls rejectRequest function
- Updates Table Storage:
  - status = Rejected

---

## 🧠 Role of Logic App

Logic App acts as:
- Workflow orchestrator
- Email trigger engine
- Integration layer between services

---

## ⚙️ Why Logic App?

- No-code / low-code orchestration
- Easy email integration
- Scalable and maintainable workflows

---

## 🚀 Future Enhancements

- Multi-level approvals
- Conditional routing
- SLA-based escalation
- Approval reminders
