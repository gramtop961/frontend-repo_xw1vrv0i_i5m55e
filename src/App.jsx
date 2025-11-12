import { useEffect, useMemo, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function App() {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState({})
  const [customer, setCustomer] = useState({ name: '', email: '', address: '' })
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Seed more demo products if empty
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${BACKEND}/api/products`)
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data)
        } else {
          // richer demo catalog
          const demo = [
            // Grocery & Staples
            { title: 'Basmati Rice 5kg', price: 12.99, category: 'Grocery', in_stock: true, description: 'Premium long-grain basmati rice' },
            { title: 'Sunflower Oil 1L', price: 3.49, category: 'Grocery', in_stock: true, description: 'Refined cooking oil' },
            { title: 'Toor Dal 1kg', price: 2.99, category: 'Grocery', in_stock: true, description: 'Protein-rich lentils' },
            { title: 'Whole Wheat Atta 5kg', price: 6.99, category: 'Grocery', in_stock: true, description: 'Stone-ground chapati flour' },
            { title: 'Sugar 2kg', price: 2.49, category: 'Grocery', in_stock: true, description: 'Fine granulated sugar' },

            // Dairy & Bakery
            { title: 'Milk 1L', price: 1.19, category: 'Dairy', in_stock: true, description: 'Toned milk' },
            { title: 'Yogurt 500g', price: 1.49, category: 'Dairy', in_stock: true, description: 'Thick and creamy curd' },
            { title: 'Brown Bread', price: 1.29, category: 'Bakery', in_stock: true, description: 'High-fiber sliced bread' },

            // Fruits & Vegetables
            { title: 'Bananas (6 pcs)', price: 1.39, category: 'Fruits', in_stock: true, description: 'Ripe and fresh' },
            { title: 'Apples 1kg', price: 2.59, category: 'Fruits', in_stock: true, description: 'Crisp red apples' },
            { title: 'Tomatoes 1kg', price: 1.19, category: 'Vegetables', in_stock: true, description: 'Juicy and ripe' },
            { title: 'Onions 1kg', price: 0.99, category: 'Vegetables', in_stock: true, description: 'Kitchen essential' },
            
            // Snacks & Beverages
            { title: 'Potato Chips 150g', price: 1.49, category: 'Snacks', in_stock: true, description: 'Classic salted chips' },
            { title: 'Chocolate Cookies 200g', price: 1.99, category: 'Snacks', in_stock: true, description: 'Choco-chip goodness' },
            { title: 'Green Tea 25 bags', price: 2.29, category: 'Beverages', in_stock: true, description: 'Antioxidant-rich tea' },
            { title: 'Instant Coffee 100g', price: 3.99, category: 'Beverages', in_stock: true, description: 'Rich and aromatic' },

            // Personal Care & Household
            { title: 'Toothpaste 150g', price: 1.59, category: 'Personal Care', in_stock: true, description: 'Fluoride protection' },
            { title: 'Shampoo 340ml', price: 3.49, category: 'Personal Care', in_stock: true, description: 'Soft and shiny hair' },
            { title: 'Detergent Powder 2kg', price: 4.99, category: 'Household', in_stock: true, description: 'Powerful stain removal' },
            { title: 'Dishwash Liquid 500ml', price: 1.79, category: 'Household', in_stock: true, description: 'Grease cutting formula' },

            // Packaged & Frozen
            { title: 'Pasta 500g', price: 1.09, category: 'Packaged', in_stock: true, description: 'Durum wheat pasta' },
            { title: 'Tomato Ketchup 1kg', price: 2.39, category: 'Packaged', in_stock: true, description: 'No added preservatives' },
            { title: 'Frozen Peas 500g', price: 1.69, category: 'Frozen', in_stock: true, description: 'Sweet garden peas' },
            { title: 'Ice Cream 1L (Vanilla)', price: 3.49, category: 'Frozen', in_stock: true, description: 'Classic vanilla treat' },
          ]
          for (const p of demo) {
            await fetch(`${BACKEND}/api/products`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(p)
            })
          }
          const res2 = await fetch(`${BACKEND}/api/products`)
          const data2 = await res2.json()
          setProducts(data2)
        }
      } catch (e) {
        setError('Failed to load products')
      }
    }
    load()
  }, [])

  const addToCart = (p) => {
    setCart(prev => ({ ...prev, [p.id]: { product: p, quantity: (prev[p.id]?.quantity || 0) + 1 } }))
  }
  const updateQty = (id, qty) => {
    setCart(prev => ({ ...prev, [id]: { ...prev[id], quantity: Math.max(1, qty) } }))
  }
  const removeItem = (id) => {
    setCart(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  const totals = useMemo(() => {
    const items = Object.values(cart)
    const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
    const tax = +(subtotal * 0.1).toFixed(2)
    const total = +(subtotal + tax).toFixed(2)
    return { subtotal: +subtotal.toFixed(2), tax, total }
  }, [cart])

  const checkout = async () => {
    setLoading(true); setError(''); setInvoice(null)
    try {
      const payload = {
        customer_name: customer.name,
        customer_email: customer.email,
        customer_address: customer.address,
        items: Object.values(cart).map(ci => ({ product_id: ci.product.id, quantity: ci.quantity }))
      }
      const res = await fetch(`${BACKEND}/api/checkout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setInvoice(data)
      setCart({})
    } catch (e) {
      setError('Checkout failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dmart Lite</h1>
          <div className="text-sm text-gray-600">Cart: {Object.keys(cart).length} items · Total ${totals.total.toFixed(2)}</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-3">Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                <div className="font-medium">{p.title}</div>
                <div className="text-sm text-gray-500 mb-2">{p.category}</div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">${p.price.toFixed(2)}</span>
                  <button onClick={() => addToCart(p)} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Add</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="lg:col-span-1">
          <h2 className="text-lg font-semibold mb-3">Billing</h2>
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <div className="space-y-2">
              <input value={customer.name} onChange={e=>setCustomer({...customer, name:e.target.value})} placeholder="Full name" className="w-full border rounded px-3 py-2"/>
              <input value={customer.email} onChange={e=>setCustomer({...customer, email:e.target.value})} placeholder="Email" className="w-full border rounded px-3 py-2"/>
              <textarea value={customer.address} onChange={e=>setCustomer({...customer, address:e.target.value})} placeholder="Address" className="w-full border rounded px-3 py-2"/>
            </div>
            <div>
              <h3 className="font-medium mb-2">Cart</h3>
              <div className="space-y-2 max-h-56 overflow-auto pr-1">
                {Object.values(cart).length === 0 && <div className="text-sm text-gray-500">No items yet</div>}
                {Object.values(cart).map(ci => (
                  <div key={ci.product.id} className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-sm">{ci.product.title}</div>
                      <div className="text-xs text-gray-500">${ci.product.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" min={1} value={ci.quantity} onChange={e=>updateQty(ci.product.id, +e.target.value)} className="w-16 border rounded px-2 py-1"/>
                      <button onClick={()=>removeItem(ci.product.id)} className="text-red-600 text-sm">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-3 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax (10%)</span><span>${totals.tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-gray-900"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
            </div>
            <button disabled={loading || Object.values(cart).length===0 || !customer.name || !customer.email || !customer.address}
              onClick={checkout}
              className="w-full py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
              {loading ? 'Processing...' : 'Checkout'}
            </button>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {invoice && (
              <div className="border-t pt-3 text-sm">
                <div className="font-semibold mb-1">Invoice {invoice.invoice_number}</div>
                <div>Subtotal: ${invoice.subtotal.toFixed(2)}</div>
                <div>Tax: ${invoice.tax.toFixed(2)}</div>
                <div>Total: ${invoice.total.toFixed(2)}</div>
              </div>
            )}
          </div>
        </aside>
      </main>

      <footer className="py-8 text-center text-xs text-gray-500">Built with Vibe Coding</footer>
    </div>
  )
}

export default App
