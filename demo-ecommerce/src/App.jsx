import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, CreditCard, Shield, Lock, Star, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { MaliciousScriptDemo } from './components/MaliciousScriptDemo.jsx'
import './App.css'

// Sample product data
const products = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    rating: 4.8,
    description: "High-quality wireless headphones with noise cancellation"
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
    rating: 4.6,
    description: "Advanced fitness tracking with heart rate monitoring"
  },
  {
    id: 3,
    name: "Laptop Stand",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop",
    rating: 4.7,
    description: "Ergonomic aluminum laptop stand for better posture"
  },
  {
    id: 4,
    name: "Wireless Mouse",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=300&h=300&fit=crop",
    rating: 4.5,
    description: "Precision wireless mouse with long battery life"
  }
]

function App() {
  const [cart, setCart] = useState([])
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(false)

  useEffect(() => {
    // Initialize PCI monitoring on payment-related pages
    if (window.location.pathname.includes('checkout') || window.location.pathname.includes('payment')) {
      initializePCIMonitoring()
    }
  }, [])

  const initializePCIMonitoring = () => {
    // Load the PCI monitoring script
    const script = document.createElement('script')
    script.src = 'http://localhost:5000/js/client-side-monitor.js'
    script.onload = () => {
      console.log('PCI Monitoring Agent loaded')
      setIsMonitoringEnabled(true)
      
      // Initialize with custom configuration
      if (window.PCIMonitoringAgent) {
        window.pciMonitor = new window.PCIMonitoringAgent({
          apiEndpoint: 'http://localhost:5000/api/events',
          enableCSPReporting: true,
          enableDOMMonitoring: true,
          enableNetworkMonitoring: true,
          enableScriptHashing: true,
          paymentFieldSelectors: [
            'input[name="cardNumber"]',
            'input[name="expiryDate"]',
            'input[name="cvv"]',
            'input[name="cardholderName"]'
          ]
        })
      }
    }
    document.head.appendChild(script)
  }

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id)
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id, change) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null
        }
        return item
      }).filter(Boolean)
    })
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-2">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">SecureShop</span>
              </Link>
              
              <div className="flex items-center space-x-4">
                {isMonitoringEnabled && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">PCI Protected</span>
                  </div>
                )}
                
                <Link to="/cart" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Cart ({getTotalItems()})</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<ProductCatalog products={products} addToCart={addToCart} />} />
          <Route path="/cart" element={<ShoppingCartPage cart={cart} updateQuantity={updateQuantity} getTotalPrice={getTotalPrice} />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} getTotalPrice={getTotalPrice} />} />
          <Route path="/payment" element={<PaymentPage cart={cart} getTotalPrice={getTotalPrice} />} />
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </div>
    </Router>
  )
}

function ProductCatalog({ products, addToCart }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Premium Electronics</h1>
        <p className="text-xl text-gray-600">Discover our curated collection of high-quality tech products</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map(product => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
            <div className="aspect-square overflow-hidden rounded-t-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardHeader>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-gray-600">{product.rating}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                <Button onClick={() => addToCart(product)} className="bg-blue-600 hover:bg-blue-700">
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ShoppingCartPage({ cart, updateQuantity, getTotalPrice }) {
  const navigate = useNavigate()

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add some products to get started</p>
        <Link to="/">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="space-y-4 mb-8">
        {cart.map(item => (
          <Card key={item.id}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600">${item.price}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-lg font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total: ${getTotalPrice()}</span>
            <Button onClick={() => navigate('/checkout')} className="bg-blue-600 hover:bg-blue-700">
              Proceed to Checkout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CheckoutPage({ cart, getTotalPrice }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'US'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/payment')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Continue to Payment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${getTotalPrice()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PaymentPage({ cart, getTotalPrice }) {
  const navigate = useNavigate()
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    // This simulates loading additional scripts that might be monitored
    const loadAnalyticsScript = () => {
      const script = document.createElement('script')
      script.src = 'https://www.google-analytics.com/analytics.js'
      script.async = true
      document.head.appendChild(script)
    }
    
    const loadPaymentScript = () => {
      const script = document.createElement('script')
      script.innerHTML = `
        // Simulated payment processing script
        window.processPayment = function(data) {
          console.log('Processing payment...', data);
          return new Promise(resolve => setTimeout(resolve, 2000));
        };
      `
      document.head.appendChild(script)
    }

    loadAnalyticsScript()
    loadPaymentScript()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate payment processing
    try {
      if (window.processPayment) {
        await window.processPayment(paymentData)
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      navigate('/success')
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            This page is protected by PCI DSS compliant monitoring. All payment data is encrypted and secure.
          </AlertDescription>
        </Alert>
      </div>

      {/* Security Testing Demo - Only show on payment page */}
      <div className="mb-8">
        <MaliciousScriptDemo />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment Information</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Details</span>
                <Lock className="h-4 w-4 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    name="cardholderName"
                    value={paymentData.cardholderName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      value={paymentData.expiryDate}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      name="cvv"
                      value={paymentData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      maxLength="4"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Pay $${getTotalPrice()}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} × {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${getTotalPrice()}</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 text-green-700">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Secure Payment</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Your payment information is protected by industry-standard encryption and PCI DSS compliance monitoring.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SuccessPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
      <p className="text-gray-600 mb-8">
        Thank you for your purchase. Your order has been processed successfully and you will receive a confirmation email shortly.
      </p>
      
      <div className="space-y-4">
        <Link to="/">
          <Button className="bg-blue-600 hover:bg-blue-700">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default App

