import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { route } from '../../utils/routes';

const SAVED_ADDRESS_KEY = 'tropitwist-checkout-address';

export default function Checkout() {
  const { items, subtotal } = useCart();
  const shipping = subtotal >= 750 || subtotal === 0 ? 0 : 60;
  const total = subtotal + shipping;
  const [paymentMethod, setPaymentMethod] = useState('cash-on-delivery');
  const [rememberAddress, setRememberAddress] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedAddress, setSavedAddress] = useState({});

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SAVED_ADDRESS_KEY);
      if (stored) {
        setSavedAddress(JSON.parse(stored));
        setRememberAddress(true);
      }
    } catch {
      setSavedAddress({});
    }
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const customer = Object.fromEntries(formData.entries());
    const orderPayload = {
      customer,
      paymentMethod,
      items: items.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
        unitPrice: product.price,
      })),
      subtotal,
      shipping,
      total,
    };

    if (rememberAddress) {
      window.localStorage.setItem(SAVED_ADDRESS_KEY, JSON.stringify({
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        area: customer.area,
      }));
    } else {
      window.localStorage.removeItem(SAVED_ADDRESS_KEY);
    }

    // Replace this state update with the checkout API request when the backend is connected.
    console.info('Checkout payload ready for backend:', orderPayload);
    setSubmitted(true);
  }

  if (!items.length) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-[10px] font-bold tracking-[0.2em] text-cherry mb-3">CHECKOUT</p>
        <h1 className="font-display font-bold text-ink text-6xl leading-none">YOUR BAG IS EMPTY.</h1>
        <a href={route('/skincare')} className="inline-block mt-8 rounded-full bg-ink text-cream px-7 py-4 text-xs font-bold tracking-widest hover:bg-cherry transition-colors">SHOP SKINCARE</a>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 md:py-16">
      <div className="mb-10">
        <a href={route('/cart')} className="text-[10px] font-bold tracking-widest text-ink/55 hover:text-cherry">← BACK TO CART</a>
        <p className="text-[10px] font-bold tracking-[0.2em] text-cherry mt-7 mb-3">TROPITWIST CHECKOUT</p>
        <h1 className="font-display font-bold text-ink text-6xl md:text-8xl leading-[0.82]">READY TO<br /><span className="text-cherry">GLOW.</span></h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <section>
            <h2 className="font-display font-bold text-4xl mb-5">CONTACT DETAILS</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="text-xs font-bold tracking-wide">FIRST NAME<input required name="firstName" defaultValue={savedAddress.firstName} className="checkout-input" /></label>
              <label className="text-xs font-bold tracking-wide">LAST NAME<input required name="lastName" defaultValue={savedAddress.lastName} className="checkout-input" /></label>
              <label className="text-xs font-bold tracking-wide sm:col-span-2">EMAIL ADDRESS<input required type="email" name="email" className="checkout-input" /></label>
              <label className="text-xs font-bold tracking-wide sm:col-span-2">PHONE NUMBER<input required type="tel" name="phone" defaultValue={savedAddress.phone} className="checkout-input" /></label>
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold text-4xl mb-5">DELIVERY ADDRESS</h2>
            <div key={savedAddress.address || 'new-address'} className="grid sm:grid-cols-2 gap-4">
              <label className="text-xs font-bold tracking-wide sm:col-span-2">ADDRESS<input required name="address" defaultValue={savedAddress.address} className="checkout-input" /></label>
              <label className="text-xs font-bold tracking-wide">CITY<input required name="city" defaultValue={savedAddress.city} className="checkout-input" /></label>
              <label className="text-xs font-bold tracking-wide">AREA<input required name="area" defaultValue={savedAddress.area} className="checkout-input" /></label>
              <label className="text-xs font-bold tracking-wide sm:col-span-2">DELIVERY NOTES <span className="font-normal text-ink/45">(OPTIONAL)</span><textarea name="notes" rows="3" className="checkout-input resize-none" /></label>
            </div>
            <label className="flex items-center gap-2 mt-4 text-xs text-ink/70">
              <input type="checkbox" checked={rememberAddress} onChange={(event) => setRememberAddress(event.target.checked)} />
              Remember this address for my next order
            </label>
          </section>

          <section>
            <h2 className="font-display font-bold text-4xl mb-5">PAYMENT METHOD</h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 rounded-brand border p-4 text-sm cursor-pointer ${paymentMethod === 'cash-on-delivery' ? 'border-cherry bg-cherry/5' : 'border-ink/15'}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'cash-on-delivery'} onChange={() => setPaymentMethod('cash-on-delivery')} value="cash-on-delivery" />
                <span><strong className="block">Cash on delivery</strong><small className="text-ink/55">Pay when your order arrives.</small></span>
              </label>
              <label className={`flex items-center gap-3 rounded-brand border p-4 text-sm cursor-pointer ${paymentMethod === 'card' ? 'border-cherry bg-cherry/5' : 'border-ink/15'}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} value="card" />
                <span><strong className="block">Visa / Mastercard</strong><small className="text-ink/55">Secure card payment at checkout.</small></span>
              </label>
            </div>
            {paymentMethod === 'card' && (
              <div className="grid sm:grid-cols-2 gap-4 mt-4 rounded-brand bg-ink/5 p-4">
                <label className="text-xs font-bold tracking-wide sm:col-span-2">CARD NUMBER<input inputMode="numeric" placeholder="•••• •••• •••• ••••" className="checkout-input bg-cream" /></label>
                <label className="text-xs font-bold tracking-wide">EXPIRY DATE<input placeholder="MM / YY" className="checkout-input bg-cream" /></label>
                <label className="text-xs font-bold tracking-wide">CVV<input inputMode="numeric" placeholder="•••" className="checkout-input bg-cream" /></label>
                <p className="sm:col-span-2 text-[11px] text-ink/55">Card processing will be connected to the payment provider on the backend.</p>
              </div>
            )}
          </section>

          <button type="submit" className="w-full rounded-full bg-cherry text-cream py-4 text-xs font-bold tracking-widest hover:bg-ink transition-colors">
            PLACE ORDER · LE {total}
          </button>
          {submitted && <p className="rounded-brand bg-banana p-4 text-sm text-ink">Your order details are ready to be sent to the backend.</p>}
        </form>

        <aside className="rounded-brand bg-[#FFF1D8] p-6 md:p-8 lg:sticky lg:top-28">
          <h2 className="font-display font-bold text-4xl">YOUR ORDER</h2>
          <div className="mt-6 space-y-4 border-b border-ink/10 pb-6">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-3">
                <img src={product.image} alt="" className="h-14 w-14 rounded-brand object-cover mix-blend-multiply" />
                <div className="flex-1"><p className="text-sm font-semibold">{product.name}</p><p className="text-xs text-ink/50">Qty {quantity}</p></div>
                <span className="text-sm font-bold">LE {product.price * quantity}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3 mt-5 text-sm">
            <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>LE {subtotal}</span></div>
            <div className="flex justify-between"><span className="text-ink/60">Delivery</span><span>{shipping ? `LE ${shipping}` : 'FREE'}</span></div>
            <div className="flex justify-between border-t border-ink/10 pt-4 font-bold text-lg"><span>Total</span><span>LE {total}</span></div>
          </div>
        </aside>
      </div>
    </main>
  );
}
