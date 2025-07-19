# pci-dss-client-side-monitoring
Automated client-side script monitoring system for PCI DSS 4.0.1 compliance and threat detection

# 🔐 PCI DSS v4.0.1 – Client-Side Script Monitoring and Alerting System

A production-grade solution designed to meet PCI DSS v4.0.1 Requirements **6.4.3** and **11.6.1**, protecting e-commerce payment pages from **Magecart**, **formjacking**, and other **client-side threats** using real-time monitoring, integrity validation, and anomaly detection.

---

## 🌐 Live Demo

- 🛒 [SecureShop – Demo E-commerce Site](https://uodesjpj.manus.space)
- 📊 [Monitoring Dashboard](https://77h9ikcj1gx9.manus.space)

---

## ✅ Key Features

- 📜 **Script Inventory Management** – Tracks all scripts on payment pages
- 🔐 **Script Integrity Validation** – Detects unauthorized or modified scripts
- 🧬 **DOM Monitoring** – Detects formjacking overlays and unauthorized DOM changes
- 🌐 **Network Monitoring** – Flags suspicious outbound connections
- ⚠️ **Real-Time Alerts** – Alerts generated in <1 second
- 📈 **Compliance Reporting** – Full mapping to PCI DSS 6.4.3 and 11.6.1
- ⚙️ **SIEM & Webhook Integration** – Easy integration with enterprise tools
- 💻 **Professional React Dashboard** – Intuitive alert & monitoring UI

---

## 📁 Project Structure

```bash
pci-dss-client-side-monitoring/
│
├── docs/                  # Technical documentation
├── backend/               # Flask API server for event handling and alerting
├── frontend/              # React dashboard for monitoring and compliance
├── agent/                 # Lightweight JS monitoring agent for client-side
├── deployment/            # Scripts and instructions for deployment
└── README.md              # You're reading it!

| Attack Vector              | Detection Status | Alert Message Example                              |
| -------------------------- | ---------------- | -------------------------------------------------- |
| Malicious Script Injection | ✅ Pass           | `SCRIPT INJECTION - Malicious script injected`     |
| Unauthorized Domain Script | ✅ Pass           | `UNAUTHORIZED SCRIPT - Loaded from evil.com`       |
| Formjacking Overlay        | ✅ Pass           | `FORMJACKING - Suspicious overlay on payment form` |

🏗️ Technology Stack
Frontend: React.js, Tailwind CSS
Backend: Python (Flask), PostgreSQL
Client Agent: JavaScript (MutationObserver, CSP, Fetch API)
Integration: Webhooks, Email, SIEM (CEF/JSON)
Security: CSP, SRI, Hashing, TLS, RBAC

🚀 Quick Start
🔧 Prerequisites
Python 3.8+
Node.js & npm
PostgreSQL

📦 Installation

# Clone repository
git clone https://github.com/your-username/pci-dss-client-side-monitoring.git
cd pci-dss-client-side-monitoring

# Backend setup
cd backend
pip install -r requirements.txt
python app.py

# Frontend setup
cd ../frontend
npm install
npm start

🖥️ Deploy Monitoring Agent
Add this to your payment page:

<script src="https://your-domain.com/js/pci-monitor.js"></script>
<script>
  window.pciMonitor = new PCIMonitoringAgent({
    apiEndpoint: 'https://your-domain.com/api/events',
    enableScriptHashing: true,
    enableDOMMonitoring: true,
    suspiciousDomains: ['evil.com', 'malicious-cdn.net']
  });
</script>

📝 Documentation
Comprehensive documentation is available in the /docs folder:
📘 comprehensive_documentation.md – Full system overview & guide
🔍 pci_dss_analysis.md – Deep dive into 6.4.3 & 11.6.1
🏗️ system_design.md – Component-level architecture
🎯 solution_presentation.md – Visual pitch and benefits
🧪 test_results.md – QA & functional test results

🛡️ PCI DSS Coverage
Requirement 6.4.3
✅ Script authorization and justification
✅ Integrity checks using hashes & SRI
✅ Script inventory with business reasoning

Requirement 11.6.1
✅ Change detection in HTTP headers and DOM
✅ Real-time alerting with full audit trail
✅ Weekly (or more frequent) evaluations

📊 Business Value
💳 Enhances payment page security
🔍 Reduces risk of card skimming (Magecart, formjacking)
🛠️ Easily integrated with CI/CD pipelines
📣 Boosts customer trust & regulatory confidence

🧩 Integrations
SIEM tools (e.g., Splunk, ELK)
Slack, Email, SMS, Webhooks
ServiceNow, Jira (via API/webhook)

🔄 Roadmap / Future Enhancements
🧠 AI/ML-based behavioral anomaly detection
📱 Mobile page monitoring support
☁️ Cloud-native monitoring agent support
🧰 Self-healing (auto-remediation on detection)
🧪 CI/CD security integration

📄 License
This project is licensed under the MIT License.

🤝 Contributing
Contributions welcome! If you’d like to collaborate, submit a pull request or open an issue.

📬 Contact
For implementation help, enterprise deployment, or questions:
Email: chandugollavilli66@gmail.com
LinkedIn: www.linkedin.com/in/chandragollavilli/

