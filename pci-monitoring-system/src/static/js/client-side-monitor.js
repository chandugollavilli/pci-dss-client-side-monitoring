/**
 * PCI DSS Client-Side Monitoring Agent (CSMA)
 * Monitors scripts, DOM changes, and network requests on payment pages
 * Addresses PCI DSS v4.0.1 Requirements 6.4.3 and 11.6.1
 */

class PCIMonitoringAgent {
    constructor(config = {}) {
        this.config = {
            apiEndpoint: config.apiEndpoint || '/api/events',
            pageUrl: window.location.href,
            enableCSPReporting: config.enableCSPReporting !== false,
            enableDOMMonitoring: config.enableDOMMonitoring !== false,
            enableNetworkMonitoring: config.enableNetworkMonitoring !== false,
            enableScriptHashing: config.enableScriptHashing !== false,
            paymentFieldSelectors: config.paymentFieldSelectors || [
                'input[type="text"][name*="card"]',
                'input[type="text"][name*="credit"]',
                'input[type="text"][name*="number"]',
                'input[type="text"][name*="cvv"]',
                'input[type="text"][name*="cvc"]',
                'input[type="text"][name*="exp"]',
                'input[name*="cardholder"]',
                'input[id*="card"]',
                'input[id*="credit"]',
                'input[class*="card"]',
                'input[class*="payment"]'
            ],
            suspiciousDomains: config.suspiciousDomains || [
                'evil.com',
                'malicious.net',
                'skimmer.org'
            ]
        };
        
        this.scriptInventory = new Map();
        this.domObserver = null;
        this.originalFetch = null;
        this.originalXHR = null;
        
        this.init();
    }
    
    init() {
        console.log('[PCI Monitor] Initializing client-side monitoring agent');
        
        // Monitor existing scripts
        this.scanExistingScripts();
        
        // Set up DOM monitoring
        if (this.config.enableDOMMonitoring) {
            this.setupDOMMonitoring();
        }
        
        // Set up network monitoring
        if (this.config.enableNetworkMonitoring) {
            this.setupNetworkMonitoring();
        }
        
        // Set up CSP violation reporting
        if (this.config.enableCSPReporting) {
            this.setupCSPReporting();
        }
        
        // Monitor for new script additions
        this.setupScriptMonitoring();
        
        console.log('[PCI Monitor] Client-side monitoring agent initialized');
    }
    
    scanExistingScripts() {
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            this.processScript(script);
        });
    }
    
    async processScript(scriptElement) {
        const src = scriptElement.src;
        if (!src) return;
        
        const scriptInfo = {
            url: src,
            element: scriptElement,
            timestamp: Date.now()
        };
        
        // Calculate hash if enabled
        if (this.config.enableScriptHashing) {
            try {
                const response = await fetch(src);
                const scriptContent = await response.text();
                const hash = await this.calculateSHA256(scriptContent);
                scriptInfo.hash = hash;
            } catch (error) {
                console.warn('[PCI Monitor] Failed to fetch script for hashing:', src, error);
            }
        }
        
        this.scriptInventory.set(src, scriptInfo);
        
        // Report script load event
        this.reportEvent('script_load', {
            script_url: src,
            hash: scriptInfo.hash,
            timestamp: scriptInfo.timestamp
        });
    }
    
    async calculateSHA256(text) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    setupDOMMonitoring() {
        this.domObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                this.processMutation(mutation);
            });
        });
        
        this.domObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'href', 'action', 'onload', 'onclick']
        });
    }
    
    processMutation(mutation) {
        // Check for new script elements
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'SCRIPT' && node.src) {
                        this.processScript(node);
                    }
                    
                    // Check for scripts within added elements
                    const scripts = node.querySelectorAll && node.querySelectorAll('script[src]');
                    if (scripts) {
                        scripts.forEach(script => this.processScript(script));
                    }
                    
                    // Check for suspicious form overlays
                    this.checkForSuspiciousFormElements(node);
                }
            });
        }
        
        // Check for attribute changes that might indicate tampering
        if (mutation.type === 'attributes') {
            const target = mutation.target;
            if (target.tagName === 'SCRIPT' && mutation.attributeName === 'src') {
                this.reportEvent('dom_manipulation', {
                    type: 'script_src_change',
                    element: target.tagName,
                    attribute: mutation.attributeName,
                    oldValue: mutation.oldValue,
                    newValue: target.getAttribute(mutation.attributeName)
                });
            }
        }
    }
    
    checkForSuspiciousFormElements(element) {
        // Check for payment field interactions
        const paymentFields = element.querySelectorAll && element.querySelectorAll(this.config.paymentFieldSelectors.join(','));
        if (paymentFields && paymentFields.length > 0) {
            this.reportEvent('dom_manipulation', {
                type: 'payment_field_added',
                fieldCount: paymentFields.length,
                element: element.tagName,
                className: element.className,
                id: element.id
            });
        }
        
        // Check for form overlays (common in formjacking attacks)
        if (element.tagName === 'FORM' || element.tagName === 'DIV') {
            const style = window.getComputedStyle(element);
            if (style.position === 'absolute' || style.position === 'fixed') {
                if (style.zIndex && parseInt(style.zIndex) > 1000) {
                    this.reportEvent('dom_manipulation', {
                        type: 'suspicious_overlay',
                        element: element.tagName,
                        zIndex: style.zIndex,
                        position: style.position
                    });
                }
            }
        }
    }
    
    setupNetworkMonitoring() {
        // Monitor fetch requests
        this.originalFetch = window.fetch;
        window.fetch = (...args) => {
            this.analyzeNetworkRequest('fetch', args[0], args[1]);
            return this.originalFetch.apply(window, args);
        };
        
        // Monitor XMLHttpRequest
        this.originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new PCIMonitoringAgent.prototype.originalXHR();
            const originalOpen = xhr.open;
            
            xhr.open = function(method, url, ...args) {
                PCIMonitoringAgent.instance.analyzeNetworkRequest('xhr', url, { method });
                return originalOpen.apply(this, [method, url, ...args]);
            };
            
            return xhr;
        };
        
        // Store instance reference for XHR monitoring
        PCIMonitoringAgent.instance = this;
    }
    
    analyzeNetworkRequest(type, url, options = {}) {
        try {
            const urlObj = new URL(url, window.location.origin);
            const domain = urlObj.hostname;
            
            // Check against suspicious domains
            if (this.config.suspiciousDomains.some(suspiciousDomain => 
                domain.includes(suspiciousDomain) || suspiciousDomain.includes(domain))) {
                this.reportEvent('suspicious_network_request', {
                    type: type,
                    url: url,
                    domain: domain,
                    method: options.method || 'GET',
                    reason: 'suspicious_domain'
                });
            }
            
            // Check for data exfiltration patterns
            if (this.isPaymentPage() && this.containsPaymentData(url)) {
                this.reportEvent('suspicious_network_request', {
                    type: type,
                    url: url,
                    domain: domain,
                    method: options.method || 'GET',
                    reason: 'potential_data_exfiltration'
                });
            }
        } catch (error) {
            // Invalid URL, might be relative - less concerning
            console.debug('[PCI Monitor] Could not parse URL for analysis:', url);
        }
    }
    
    isPaymentPage() {
        // Simple heuristic to determine if this is a payment page
        const paymentIndicators = ['checkout', 'payment', 'billing', 'card', 'pay'];
        const url = window.location.href.toLowerCase();
        return paymentIndicators.some(indicator => url.includes(indicator));
    }
    
    containsPaymentData(url) {
        // Check if URL contains patterns that might indicate payment data
        const paymentPatterns = [
            /card.*number/i,
            /credit.*card/i,
            /cvv/i,
            /cvc/i,
            /expir/i,
            /\d{4}.*\d{4}.*\d{4}.*\d{4}/,  // Card number pattern
            /\d{3,4}/  // CVV pattern
        ];
        
        return paymentPatterns.some(pattern => pattern.test(url));
    }
    
    setupCSPReporting() {
        // Listen for CSP violation events
        document.addEventListener('securitypolicyviolation', (event) => {
            this.reportEvent('csp_violation', {
                violatedDirective: event.violatedDirective,
                blockedURI: event.blockedURI,
                documentURI: event.documentURI,
                effectiveDirective: event.effectiveDirective,
                originalPolicy: event.originalPolicy,
                sourceFile: event.sourceFile,
                lineNumber: event.lineNumber,
                columnNumber: event.columnNumber
            });
        });
    }
    
    setupScriptMonitoring() {
        // Monitor for dynamically added scripts
        const originalAppendChild = Element.prototype.appendChild;
        const originalInsertBefore = Element.prototype.insertBefore;
        
        Element.prototype.appendChild = function(child) {
            if (child.tagName === 'SCRIPT' && child.src) {
                PCIMonitoringAgent.instance.processScript(child);
            }
            return originalAppendChild.call(this, child);
        };
        
        Element.prototype.insertBefore = function(newNode, referenceNode) {
            if (newNode.tagName === 'SCRIPT' && newNode.src) {
                PCIMonitoringAgent.instance.processScript(newNode);
            }
            return originalInsertBefore.call(this, newNode, referenceNode);
        };
    }
    
    async reportEvent(eventType, eventData) {
        const payload = {
            event_type: eventType,
            page_url: this.config.pageUrl,
            script_url: eventData.script_url || null,
            event_data: eventData,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
        };
        
        try {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                console.error('[PCI Monitor] Failed to report event:', response.status, response.statusText);
            } else {
                const result = await response.json();
                if (result.alert_created) {
                    console.warn('[PCI Monitor] Security alert created:', result.alert_id);
                }
            }
        } catch (error) {
            console.error('[PCI Monitor] Error reporting event:', error);
        }
    }
    
    // Public method to manually report script hash mismatches
    reportScriptHashMismatch(scriptUrl, expectedHash, actualHash) {
        this.reportEvent('script_hash_mismatch', {
            script_url: scriptUrl,
            expected_hash: expectedHash,
            actual_hash: actualHash
        });
    }
    
    // Public method to get current script inventory
    getScriptInventory() {
        return Array.from(this.scriptInventory.entries()).map(([url, info]) => ({
            url: url,
            hash: info.hash,
            timestamp: info.timestamp
        }));
    }
    
    // Cleanup method
    destroy() {
        if (this.domObserver) {
            this.domObserver.disconnect();
        }
        
        if (this.originalFetch) {
            window.fetch = this.originalFetch;
        }
        
        if (this.originalXHR) {
            window.XMLHttpRequest = this.originalXHR;
        }
    }
}

// Auto-initialize if not in a module environment
if (typeof module === 'undefined') {
    // Initialize with default configuration
    window.pciMonitor = new PCIMonitoringAgent();
    
    // Expose for manual configuration
    window.PCIMonitoringAgent = PCIMonitoringAgent;
}

