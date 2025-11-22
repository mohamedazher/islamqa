# N8N Workflow Setup Guide - BIQA Feedback Processing

## Overview
This updated workflow handles the new feedback form with request type categorization, signature verification, and formatted emails.

## What's New in the Updated Workflow

### 1. **Signature Verification** ✓
- Verifies the `app_signature` (SHA-256 HMAC) to ensure requests come from the app
- Rejects invalid requests with error message
- Secret Key: `biqa_app_feedback_secret_key_2024`

### 2. **Dynamic Email Formatting**
- Subject lines vary by request type:
  - ✨ Feature Request → "✨ New Feature Request from BIQA App"
  - 🎯 Improvement → "🎯 Improvement Suggestion from BIQA App"
  - 🐛 Bug Report → "🐛 BUG REPORT from BIQA App" (RED priority)
  - 💡 Suggestion → "💡 User Suggestion from BIQA App"
  - ❓ Question → "❓ User Question from BIQA App"
  - 💬 General → "💬 User Feedback from BIQA App"

### 3. **Priority Levels**
- Feature Requests & Improvements: **HIGH**
- Bug Reports: **URGENT** (red color)
- Suggestions: **MEDIUM**
- Questions & General: **LOW**

### 4. **Enhanced Email Body**
- Color-coded header based on request type
- Metadata section with timestamp, source, priority
- Formatted message with proper HTML
- System info footer with signature verification indicator
- Reply-to field automatically set to user's email

### 5. **Response Handling**
- App receives success confirmation with request type
- User gets immediate feedback that request was received
- Timestamp echoed back for verification

### 6. **Feedback Logging** (Optional)
- Additional webhook node to log feedback for analytics
- Can connect to database or logging service
- Currently configured but can be disabled if not needed

## Workflow Nodes

### Node 1: Webhook - Receive Feedback
```
- Path: send_biqa_email
- Method: POST
- Receives payload from BIQA app
```

### Node 2: Verify Signature & Format Email
```
- Type: Code node (JavaScript)
- Verifies app_signature using SHA-256
- Maps request types to colors and priorities
- Formats HTML email body
- Outputs subject, htmlBody, plainBody
- IMPORTANT: Update SECRET_KEY if changed in app
```

### Node 3: Send Formatted Email
```
- Type: AWS SES
- Sends formatted email with HTML
- From: BIQA@halerp.com
- To: mohamedazher@gmail.com
- Reply-To: User's email address
```

### Node 4: Log Feedback (Optional)
```
- Type: Webhook (optional, for analytics)
- Logs feedback data for tracking
- Can be connected to database later
```

### Node 5: Respond to App
```
- Type: Respond to Webhook
- Returns success response to app
- Includes request type and timestamp
```

## Setup Instructions

### 1. Import the Workflow
1. Open n8n
2. Go to Workflows
3. Click "Import from File"
4. Select `n8n_workflow_updated.json`
5. Or manually create nodes following the structure above

### 2. Configure AWS SES
```
- Credentials: AWS account (use existing)
- From Email: BIQA@halerp.com (must be verified in AWS SES)
- Region: Same as current setup
```

### 3. Update Secret Key (If Changed)
In the "Verify Signature & Format Email" node, update:
```javascript
const SECRET_KEY = 'biqa_app_feedback_secret_key_2024';
```
⚠️ **MUST MATCH** the `APP_SECRET` in `src/services/contactUsService.js`

### 4. Configure Email Recipients
Update the "To" addresses in "Send Formatted Email" node:
- `mohamedazher@gmail.com` - change to your email
- Can add multiple recipients: `["email1@example.com", "email2@example.com"]`

### 5. (Optional) Set Up Feedback Logging
If you want to log feedback to a database:
1. Configure the webhook in "Log Feedback" node
2. Connect to your database node (MongoDB, PostgreSQL, etc.)
3. Or send to an analytics service

## Incoming Payload Format

The app sends:
```javascript
{
  from_email: "user@example.com",
  message: "User's feedback message",
  request_type: "feature_request",        // or improvement, bug_report, etc.
  request_type_label: "Feature Request",  // Human readable
  app_signature: "sha256_hash_here",      // For verification
  timestamp: "2024-01-15T10:30:00.000Z",
  user_agent: "Mozilla/5.0...",
  source: "biqa_app"
}
```

## Email Output Example

### Subject:
```
✨ New Feature Request from BIQA App
```

### Email Body (Formatted HTML):
```
[Color-coded header with priority]

From: user@example.com

┌─ TYPE: Feature Request
├─ Priority: HIGH
├─ Received: Jan 15, 2024, 10:30 AM
└─ Source: BetterIslam Q&A App

MESSAGE:
[User's message here]

---SYSTEM INFO---
Request Verified: ✓
App Signature: 1a2b3c4d5e6f7g8h...
Source: biqa_app
```

## Testing the Workflow

### 1. Manual Test with cURL
```bash
curl -X POST https://integrations_v2.halerp.com/webhook/send_biqa_email \
  -H "Content-Type: application/json" \
  -d '{
    "from_email": "test@example.com",
    "message": "This is a test feedback message",
    "request_type": "feature_request",
    "request_type_label": "Feature Request",
    "app_signature": "YOUR_SIGNATURE_HERE",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "user_agent": "Test Client",
    "source": "biqa_app"
  }'
```

### 2. Generate Test Signature
```javascript
const crypto = require('crypto');
const secret = 'biqa_app_feedback_secret_key_2024';
const email = 'test@example.com';
const message = 'Test message';

const signature = crypto
  .createHash('sha256')
  .update(`${email}:${message}:${secret}`)
  .digest('hex');

console.log(signature); // Use this in your test
```

### 3. Test via App UI
1. Open BIQA app in browser
2. Settings → Share Your Feedback
3. Select a request type
4. Enter email and message
5. Submit
6. Check your inbox for formatted email

## Troubleshooting

### Email not sending?
- [ ] Verify AWS credentials are correct
- [ ] Check BIQA@halerp.com is verified in AWS SES
- [ ] Check recipient email is not in SES sandbox (if using sandbox)
- [ ] Check n8n logs for AWS errors

### Signature verification failing?
- [ ] Ensure SECRET_KEY matches in app: `src/services/contactUsService.js`
- [ ] Check email and message are exact match (case-sensitive)
- [ ] Verify hash algorithm is SHA-256

### Email looks wrong?
- [ ] Check request_type is valid (feature_request, improvement, bug_report, etc.)
- [ ] Verify HTML/plain text rendering in email client
- [ ] Check timezone for timestamp display

## Advanced Customization

### Add Slack Notification
Add a Slack node after "Verify Signature & Format Email":
```
- Channel: #biqa-feedback
- Message: Priority feedback with color coding
- Include request type and user email
```

### Add to Google Sheets
Add a Google Sheets node to log all feedback:
```
- Columns: Timestamp | Email | Type | Priority | Message | Verified
- Automatic categorization by request type
- Easy reporting and analytics
```

### Add Conditional Routing
Route bug reports to different email:
```
IF request_type == 'bug_report'
  → Send to engineering@company.com (HIGH priority)
ELSE
  → Send to feedback@company.com
```

## Security Notes

1. **Secret Key**: Keep `biqa_app_feedback_secret_key_2024` secure
   - Don't share in public repos
   - Only in app code and n8n workflow
   - Consider rotating periodically

2. **Signature Verification**: Ensures requests are from app only
   - Prevents spam/unauthorized feedback
   - All unverified requests are rejected

3. **Email Privacy**: User's email is stored
   - Consider GDPR/privacy policy implications
   - Add data retention policy

## Version History

### v2.0 (Current)
- ✅ Request type dropdown with 6 categories
- ✅ SHA-256 signature verification
- ✅ Dynamic email formatting based on type
- ✅ Color-coded priorities
- ✅ Responsive to app feedback
- ✅ Logging support for analytics

### v1.0 (Original)
- Basic webhook → email flow
- No signature verification
- Static email format
