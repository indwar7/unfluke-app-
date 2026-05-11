# Data Handling Policy — Unfluke

**Last updated:** 11 May 2026
**Effective date:** 11 May 2026

This Data Handling Policy explains in detail how Unfluke collects, processes, stores, secures, and disposes of user data. It supplements our [Privacy Policy](PRIVACY_POLICY.md) and is intended for transparency with users, regulators (DPDP Act / SEBI), and platform reviewers (Google Play Store / Apple App Store).

---

## 1. Data Categories

| Category | Examples | Sensitivity | Storage |
|---|---|---|---|
| Identity data | Name, email, mobile | Personal | India servers, encrypted at rest |
| Authentication data | Password (bcrypt hash), OTP | Sensitive | India servers, hashed/short-lived |
| Profile data | Trading experience, preferences | Personal | India servers |
| Usage data | Screen visits, feature usage | Non-personal | India servers, aggregated |
| Device data | Device model, OS, app version | Technical | India servers |
| Diagnostic data | Crash logs, performance metrics | Technical | Firebase Crashlytics (Google Cloud) |
| Payment metadata | Transaction ID, amount, status | Personal | India servers; card data NOT stored |
| User-generated content | Saved strategies, notes | Personal | India servers |
| Communications | Support tickets, emails | Personal | India servers |

---

## 2. Data We Explicitly Do NOT Collect

To minimize risk and respect user privacy, Unfluke does **not** collect:

- **Financial identifiers:** PAN, Aadhaar, voter ID, passport
- **Banking data:** account numbers, IFSC, net banking credentials, UPI PIN
- **Card data:** full card number, CVV, expiry (handled exclusively by PCI-DSS compliant payment gateways)
- **Broker integrations:** broker account credentials, API keys, demat account details
- **Sensitive personal data under SPDI Rules:** passwords (we only store hashes), financial information beyond payment metadata, physical/mental health, sexual orientation, biometric data
- **Precise location:** GPS coordinates (we only derive approximate city/region from IP)
- **Contact lists, SMS, call logs, calendar entries**
- **Microphone or background audio**

---

## 3. Data Collection Methods

### 3.1 Active Collection (User-Provided)

- Registration forms (name, email, mobile)
- OTP verification flow
- Profile edits
- Strategy creation and saves
- Support ticket submissions
- Payment flows (initiated by user)

### 3.2 Passive Collection (Automatic)

- App analytics (Firebase Analytics): screen views, button taps, feature usage
- Crash reporting (Firebase Crashlytics): stack traces when app crashes
- Server logs: API request metadata (endpoint, timestamp, IP), error logs

### 3.3 Third-Party Sources

- **Google Sign-in (Firebase Auth):** name, email, profile photo (only if user chooses Google login)
- **OTP gateway:** delivery confirmation status

---

## 4. Purpose Limitation

Data is collected and used **only for the purposes disclosed in the Privacy Policy** and listed below:

1. Account creation and authentication
2. Service delivery (backtests, simulations, scanners)
3. Payment processing
4. Customer support
5. Service improvement (analytics)
6. Security and fraud prevention
7. Legal compliance
8. User communications (transactional + opt-in marketing)

We do **not** use data for:
- Cross-context behavioral advertising
- Selling to data brokers
- Building shadow profiles
- Discriminatory profiling
- Any purpose not disclosed at the time of collection

---

## 5. Data Storage

### 5.1 Primary Storage

- **Cloud provider:** AWS / Google Cloud Platform
- **Region:** India (Mumbai/Delhi)
- **Database:** Encrypted at rest using AES-256
- **Backups:** Daily incremental, weekly full; encrypted; retained for 30–90 days

### 5.2 Secondary/Processor Storage

| Processor | Purpose | Data | Location |
|---|---|---|---|
| Firebase | Auth, analytics, crash reporting | Auth tokens, usage metrics, crash logs | Google Cloud (multi-region) |
| CCAvenue / HDFC Payment Gateway | Payment processing | Payment metadata | PCI-DSS compliant (India / global) |
| SendGrid / AWS SES | Transactional email | Email address, message content | Global |
| OTP gateway (e.g., MSG91) | SMS / WhatsApp OTP | Mobile number, OTP code | India |

All processors are bound by data processing agreements (DPA) requiring DPDP Act and IT Act compliance.

---

## 6. Data Security Measures

### 6.1 Technical Safeguards

- **Encryption in transit:** TLS 1.2+ for all client–server communication
- **Encryption at rest:** AES-256 for databases and backups
- **Password hashing:** bcrypt with cost factor ≥ 12
- **API security:** JWT tokens, rate limiting, IP-based throttling
- **Input validation:** All user inputs sanitized to prevent SQL injection, XSS
- **Dependency scanning:** Automated security scans on dependencies
- **Vulnerability patching:** Critical patches applied within 48 hours

### 6.2 Administrative Safeguards

- **Access control:** Role-based access; principle of least privilege
- **Authentication:** Multi-factor authentication required for admin access
- **Audit logging:** All admin actions logged and reviewed
- **Background checks:** For personnel with data access
- **Training:** Annual data protection and security training for staff
- **Vendor due diligence:** Security review before onboarding new processors

### 6.3 Physical Safeguards

- All data hosted in **ISO 27001 / SOC 2** certified data centers
- No on-premise storage of user data

---

## 7. Data Retention and Disposal

### 7.1 Retention Periods

| Data Type | Retention Period | Reason |
|---|---|---|
| Active account data | While account is active | Service delivery |
| Inactive account data | 24 months post last login, then deleted | User control |
| Transaction records | 8 years | Income Tax Act, GST Act |
| Communications / support tickets | 3 years | Dispute resolution |
| Server logs | 90 days | Security, debugging |
| Backups | 30–90 days rolling | Disaster recovery |
| Marketing data | Until consent withdrawn | Consent-based |

### 7.2 Account Deletion

Upon user-initiated deletion request:
1. Account marked for deletion immediately
2. Login disabled
3. Personal data deleted from primary systems within **30 days**
4. Removed from backups during next backup rotation (within 90 days)
5. Anonymized aggregate analytics may be retained

Data we may retain after deletion (with legal basis):
- Transaction records (tax law)
- Fraud-related data (anti-fraud purposes)
- Data subject to ongoing legal proceedings

### 7.3 Disposal Methods

- **Digital data:** Cryptographic erasure or secure deletion
- **Physical media (if any):** Certified destruction (NIST 800-88 standards)

---

## 8. Data Sharing and Transfers

### 8.1 With Service Providers (Processors)

Shared only as needed; bound by DPA with confidentiality and security obligations.

### 8.2 With Legal Authorities

Shared only upon:
- Valid legal process (court order, summons, warrant)
- Compliance with the IT Act, DPDP Act, or other applicable laws
- Protection of rights, property, or safety

We will notify users of such requests **unless prohibited by law**.

### 8.3 Cross-Border Transfers

Primary storage is in India. When data is transferred outside India (e.g., via Firebase, payment processors):
- Recipient countries are not on any Government of India "negative list"
- Recipients are bound by contractual safeguards
- Transfers comply with DPDP Act Section 16

### 8.4 No Sale of Data

We do **not sell, rent, or lease personal data** to third parties under any circumstances.

---

## 9. User Rights and Controls

Users can exercise the following through the App or by emailing **support@unfluke.in**:

| Right | How to Exercise | Response Time |
|---|---|---|
| Access | Email request | Within 30 days |
| Correction | In-app profile edit / email | Within 30 days |
| Deletion | In-app or email | Within 30 days |
| Data portability | Email request | Within 30 days |
| Withdraw consent | In-app toggle or email | Immediate |
| Object to processing | Email | Within 30 days |
| Grievance | support@unfluke.in | Within 15 days |

---

## 10. Children's Data

- Services are restricted to users **18+ years**
- We do not knowingly collect children's data
- If discovered, child accounts are deleted immediately
- Parents/guardians may contact **support@unfluke.in** for removal

---

## 11. Data Breach Response

In the event of a data breach affecting personal data:

1. **Detection:** Continuous monitoring via SIEM and anomaly detection
2. **Containment:** Immediate isolation of affected systems
3. **Assessment:** Determine scope, affected users, and risk
4. **Notification:**
   - Data Protection Board of India: within timelines required by DPDP Act
   - CERT-In: as per Indian cybersecurity reporting rules
   - Affected users: without undue delay, with mitigation steps
5. **Remediation:** Root cause analysis, patching, and prevention measures
6. **Documentation:** Internal incident report

---

## 12. Compliance and Audits

Unfluke commits to:
- Annual internal security audits
- Periodic third-party penetration testing
- Compliance reviews against DPDP Act, IT Act, SPDI Rules, and Play Store / App Store policies
- Cooperation with Data Protection Board of India

---

## 13. Governance

- **Data Protection Officer (DPO):** [Name — TO BE FILLED]
- **Grievance Officer:** [Name — TO BE FILLED]
- **Email:** support@unfluke.in
- **Address:** A-99, Sector 65, Noida, Uttar Pradesh 201301, India

---

## 14. Changes to This Policy

This Data Handling Policy may be updated. Material changes will be communicated via the App, email, and Website with effective date.

---

## 15. Contact

For data-handling questions, audits, or partnership data requests:
- **Email:** support@unfluke.in
- **DPO:** support@unfluke.in

---

© 2026 Unfluke. All rights reserved.
