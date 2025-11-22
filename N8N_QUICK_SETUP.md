# N8N Workflow Quick Setup

## 🚀 Quick Start (5 minutes)

### Step 1: Import Workflow
```
n8n → Workflows → Import from File
Select: n8n_workflow_updated.json
```

### Step 2: Verify Secret Key
In "Verify Signature & Format Email" node, line 3:
```javascript
const SECRET_KEY = 'biqa_app_feedback_secret_key_2024';
```
✅ Must match: `src/services/contactUsService.js`

### Step 3: Configure Email
In "Send Formatted Email" node:
```
To Addresses: ["mohamedazher@gmail.com"]
From: BIQA@halerp.com
Credentials: AWS account (existing)
```

### Step 4: Save & Deploy
```
Click "Save"
Click "Execute Workflow"
Status should be: "Waiting for webhook"
```

---

## 📧 Email Types & Colors

| Type | Emoji | Subject | Priority | Color |
|------|-------|---------|----------|-------|
| Feature Request | ✨ | ✨ New Feature Request... | HIGH | Teal |
| Improvement | 🎯 | 🎯 Improvement Suggestion... | HIGH | Teal |
| Bug Report | 🐛 | 🐛 BUG REPORT... | URGENT | Red |
| Suggestion | 💡 | 💡 User Suggestion... | MEDIUM | Blue |
| Question | ❓ | ❓ User Question... | LOW | Purple |
| General | 💬 | 💬 User Feedback... | LOW | Indigo |

---

## 🔒 Security - Signature Verification

### How It Works:
```javascript
// App calculates:
signature = SHA-256(email + ":" + message + ":secret_key")

// n8n verifies:
if (signature === expected_signature) {
  // Valid - process request
} else {
  // Invalid - reject
}
```

### Payload Format:
```json
{
  "from_email": "user@example.com",
  "message": "User feedback...",
  "request_type": "feature_request",
  "app_signature": "1a2b3c4d5e6f...",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## ✅ Test Checklist

- [ ] Webhook node is active ("Waiting for webhook")
- [ ] AWS SES credentials are set
- [ ] Secret key matches in app
- [ ] Email recipients are correct
- [ ] Test from app: Settings → Share Your Feedback
- [ ] Email received in inbox
- [ ] Email is color-coded by type
- [ ] Subject line matches request type
- [ ] User email appears in "Reply-To"

---

## 🎯 Request Type Mapping

### App Dropdown → Webhook → Email

```
Feature Request
  → request_type: "feature_request"
  → request_type_label: "Feature Request"
  → Color: Teal (#14b8a6)
  → Priority: HIGH

Improvement Suggestion
  → request_type: "improvement"
  → request_type_label: "Improvement Suggestion"
  → Color: Teal (#14b8a6)
  → Priority: HIGH

Bug Report
  → request_type: "bug_report"
  → request_type_label: "Bug Report"
  → Color: Red (#ef4444)
  → Priority: URGENT

Suggestion
  → request_type: "suggestion"
  → request_type_label: "Suggestion"
  → Color: Blue (#3b82f6)
  → Priority: MEDIUM

Question
  → request_type: "question"
  → request_type_label: "Question"
  → Color: Purple (#8b5cf6)
  → Priority: LOW

General Feedback
  → request_type: "general"
  → request_type_label: "General Feedback"
  → Color: Indigo (#6366f1)
  → Priority: LOW
```

---

## 🔧 Common Customizations

### Send Bug Reports to Different Email
```javascript
// In "Verify Signature & Format Email" node, add:
if (request_type === 'bug_report') {
  return {
    ...output,
    bugReportEmail: "engineering@company.com"
  }
}

// In "Send Formatted Email" node:
// Create IF/ELSE:
IF request_type == 'bug_report':
  TO: engineering@company.com
ELSE:
  TO: mohamedazher@gmail.com
```

### Add Slack Alert
```
1. Add "Slack" node after "Verify Signature"
2. Connect: Verify → Slack → Send Email
3. Configure:
   - Channel: #biqa-feedback
   - Message: "${emoji} ${request_type_label}\nFrom: ${from_email}\n${message}"
   - Color: Use typeInfo.color
```

### Log to Database
```
1. Add "Database" node after "Verify Signature"
2. Create table: biqa_feedback
3. Columns:
   - timestamp (DateTime)
   - email (String)
   - request_type (String)
   - priority (String)
   - message (Text)
   - verified (Boolean)
```

---

## 📊 Webhook Response

App receives:
```json
{
  "success": true,
  "message": "Thank you for your feedback! We appreciate your input.",
  "request_type": "Feature Request",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not sending | Check AWS credentials & sender verified |
| Signature invalid | Verify SECRET_KEY matches app |
| Wrong email format | Check HTML rendering in client |
| Wrong priority color | Verify request_type value |
| App gets 401 error | Check webhook path is correct |

---

## 📝 Payload Checklist

App sends (MUST include):
- [ ] `from_email` - User's email
- [ ] `message` - Feedback message
- [ ] `request_type` - Type selection
- [ ] `request_type_label` - Human readable type
- [ ] `app_signature` - SHA-256 verification
- [ ] `timestamp` - ISO 8601 format
- [ ] `user_agent` - Browser info
- [ ] `source` - "biqa_app"

---

## 🎓 Learning Resources

- **SHA-256 Hashing**: https://www.npmjs.com/package/crypto
- **n8n Webhooks**: https://docs.n8n.io/nodes/n8n-nodes-base.webhook/
- **AWS SES**: https://docs.aws.amazon.com/ses/
- **Email HTML Best Practices**: https://mjml.io/

---

## 📞 Support

Questions? Check:
1. `N8N_WORKFLOW_SETUP.md` - Full documentation
2. App code: `src/services/contactUsService.js` - Request format
3. App UI: `src/views/ContactUsView.vue` - Request types
