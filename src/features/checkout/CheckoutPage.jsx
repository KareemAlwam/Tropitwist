import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { route } from '../../utils/routes';
import { calculateOrderTotals } from '../../utils/order';
import { validateCheckout, withoutPaymentDetails } from './validation';
import { api, getSession } from '../../services/api';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { shipping, total } = calculateOrderTotals(subtotal);
  const [paymentMethod, setPaymentMethod] = useState('cash-on-delivery');
  const [rememberAddress, setRememberAddress] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savedAddress, setSavedAddress] = useState({});
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [formVersion, setFormVersion] = useState(0);
  const [validationError, setValidationError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!getSession()) return;
    api('/addresses').then((addresses) => {
      setSavedAddresses(addresses);
      if (addresses[0]) {
        setSavedAddress(addresses[0]);
        setSelectedAddressId(addresses[0].id);
        setRememberAddress(true);
        setFormVersion((version) => version + 1);
      }
    }).catch(() => setSavedAddress({}));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    const errors = validateCheckout(formValues, 'cash-on-delivery');
    setFieldErrors(errors);
    if (Object.keys(errors).length) {
      setValidationError('Please correct the highlighted fields.');
      return;
    }
    if (!getSession()) {
      setValidationError('Sign in to place an order.');
      return;
    }
    setValidationError('');
    const customer = withoutPaymentDetails(formValues);
    const orderPayload = {
      customer,
      paymentMethod: 'cash-on-delivery',
      items: items.map(({ product, quantity }) => ({
        productId: product.id,
        quantity,
        unitPrice: product.price,
      })),
      subtotal,
      shipping,
      total,
    };

    try {
      if (rememberAddress && !savedAddresses.some((address) => address.address === customer.address && address.city === customer.city && address.area === customer.area)) {
        await api('/addresses', { method: 'POST', body: JSON.stringify({ label: 'Home', firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone, address: customer.address, city: customer.city, area: customer.area }) });
      }
      await api('/orders', { method: 'POST', body: JSON.stringify(orderPayload) });
      clearCart();
      setSubmitted(true);
    } catch (error) {
      setFieldErrors(error.details || {});
      setValidationError(error.message);
    }
  }

  if (!items.length) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="motion-rise text-[10px] font-bold tracking-[0.2em] text-cherry mb-3">CHECKOUT</p>
        <h1 className="motion-reveal font-display font-bold text-ink text-6xl leading-none">YOUR BAG IS EMPTY.</h1>
        <a href={route('/search')} className="inline-block mt-8 rounded-full bg-ink text-cream px-7 py-4 text-xs font-bold tracking-widest hover:bg-cherry transition-colors">VIEW ALL PRODUCTS</a>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-10 md:py-16">
      <div className="page-spotlight -mx-4 mb-10 border-b border-ink/10 px-4 pb-10 md:pb-14">
        <a href={route('/cart')} className="text-[10px] font-bold tracking-widest text-ink/55 hover:text-cherry">← BACK TO CART</a>
        <p className="motion-rise text-[10px] font-bold tracking-[0.2em] text-cherry mt-7 mb-3">TROPITWIST CHECKOUT</p>
        <h1 className="motion-reveal font-display font-bold text-ink text-6xl md:text-8xl leading-[0.82]">READY TO<br /><span className="text-cherry">GLOW.</span></h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10 items-start">
        <form key={formVersion} noValidate className="space-y-8" onSubmit={handleSubmit}>
          <section className="card-enter">
            <h2 className="font-display font-bold text-4xl mb-5">CONTACT DETAILS</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                ['firstName', 'FIRST NAME', savedAddress.firstName, ''],
                ['lastName', 'LAST NAME', savedAddress.lastName, ''],
                ['email', 'EMAIL ADDRESS', '', 'sm:col-span-2'],
                ['phone', 'PHONE NUMBER', savedAddress.phone, 'sm:col-span-2'],
              ].map(([name, label, value, layout]) => (
                <label key={name} className={`text-xs font-bold tracking-wide ${layout}`}>{label}{fieldErrors[name] && <span aria-hidden="true" className="ml-1 inline-block h-2 w-2 rounded-full bg-cherry align-middle" />}<input name={name} type={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'text'} defaultValue={value} aria-invalid={Boolean(fieldErrors[name])} className={`checkout-input ${fieldErrors[name] ? 'border-2 border-cherry' : ''}`} />{fieldErrors[name] && <span className="mt-1 block text-[11px] font-normal text-cherry">{fieldErrors[name]}</span>}</label>
              ))}
            </div>
          </section>

          <section className="card-enter motion-delay-1">
            <h2 className="font-display font-bold text-4xl mb-5">DELIVERY ADDRESS</h2>
            {savedAddresses.length > 0 && <label className="mb-4 block text-xs font-bold tracking-wide">SAVED ADDRESS
              <select value={selectedAddressId} onChange={(event) => { const next = savedAddresses.find((address) => address.id === event.target.value); setSelectedAddressId(event.target.value); setSavedAddress(next || {}); setFormVersion((version) => version + 1); }} className="checkout-input mt-2">
                {savedAddresses.map((address) => <option key={address.id} value={address.id}>{address.label} - {address.address}, {address.area}</option>)}
              </select>
            </label>}
            <div key={savedAddress.address || 'new-address'} className="grid sm:grid-cols-2 gap-4">
              {[
                ['address', 'ADDRESS', savedAddress.address, 'sm:col-span-2'],
                ['city', 'CITY', savedAddress.city, ''],
                ['area', 'AREA', savedAddress.area, ''],
              ].map(([name, label, value, layout]) => (
                <label key={name} className={`text-xs font-bold tracking-wide ${layout}`}>{label}{fieldErrors[name] && <span aria-hidden="true" className="ml-1 inline-block h-2 w-2 rounded-full bg-cherry align-middle" />}<input name={name} defaultValue={value} aria-invalid={Boolean(fieldErrors[name])} className={`checkout-input ${fieldErrors[name] ? 'border-2 border-cherry' : ''}`} />{fieldErrors[name] && <span className="mt-1 block text-[11px] font-normal text-cherry">{fieldErrors[name]}</span>}</label>
              ))}
              <label className="text-xs font-bold tracking-wide sm:col-span-2">DELIVERY NOTES <span className="font-normal text-ink/45">(OPTIONAL)</span><textarea name="notes" rows="3" className="checkout-input resize-none" /></label>
            </div>
            <label className="flex items-center gap-2 mt-4 text-xs text-ink/70">
              <input type="checkbox" checked={rememberAddress} onChange={(event) => setRememberAddress(event.target.checked)} />
              Remember this address for my next order
            </label>
          </section>

          <section className="card-enter motion-delay-2">
            <h2 className="font-display font-bold text-4xl mb-5">PAYMENT METHOD</h2>
            <div className="space-y-3">
              <label className={`flex min-w-0 items-center gap-3 rounded-brand border p-4 text-sm cursor-pointer ${paymentMethod === 'cash-on-delivery' ? 'border-cherry bg-cherry/5' : 'border-ink/15'}`}>
                <input type="radio" name="payment" checked={paymentMethod === 'cash-on-delivery'} onChange={() => setPaymentMethod('cash-on-delivery')} value="cash-on-delivery" />
                <span className="min-w-0"><strong className="block">Cash on delivery</strong><small className="text-ink/55">Pay when your order arrives.</small></span>
              </label>
              <div className="flex min-w-0 items-center gap-3 rounded-brand border border-ink/10 p-4 text-sm opacity-60">
                <input type="radio" name="payment" disabled />
                <span className="min-w-0"><strong className="block">Visa / Mastercard</strong><small className="text-ink/55">Available after payment-provider integration.</small></span>
              </div>
            </div>
            {paymentMethod === 'card' && (
              <div className="grid sm:grid-cols-2 gap-4 mt-4 rounded-brand bg-ink/5 p-4">
                <label className="text-xs font-bold tracking-wide sm:col-span-2">CARD NUMBER<input name="cardNumber" inputMode="numeric" placeholder="•••• •••• •••• ••••" className={`checkout-input bg-cream ${fieldErrors.cardNumber ? 'border-cherry' : ''}`} />{fieldErrors.cardNumber && <span className="mt-1 block text-[11px] font-normal text-cherry">{fieldErrors.cardNumber}</span>}</label>
                <label className="text-xs font-bold tracking-wide">EXPIRY DATE<input name="expiry" placeholder="MM / YY" className={`checkout-input bg-cream ${fieldErrors.expiry ? 'border-cherry' : ''}`} />{fieldErrors.expiry && <span className="mt-1 block text-[11px] font-normal text-cherry">{fieldErrors.expiry}</span>}</label>
                <label className="text-xs font-bold tracking-wide">CVV<input name="cvv" inputMode="numeric" placeholder="•••" className={`checkout-input bg-cream ${fieldErrors.cvv ? 'border-cherry' : ''}`} />{fieldErrors.cvv && <span className="mt-1 block text-[11px] font-normal text-cherry">{fieldErrors.cvv}</span>}</label>
                <p className="sm:col-span-2 text-[11px] text-ink/55">Card processing will be connected to the payment provider on the backend.</p>
              </div>
            )}
          </section>

          <button type="submit" className="w-full rounded-full bg-cherry text-cream py-4 text-xs font-bold tracking-widest hover:bg-ink transition-colors">
            PLACE ORDER · LE {total}
          </button>
          {validationError && <p role="alert" className="rounded-brand bg-cherry/10 p-4 text-sm text-cherry">{validationError}</p>}
          {submitted && <p className="rounded-brand bg-banana p-4 text-sm text-ink">Your order details are ready to be sent to the backend.</p>}
        </form>

        <aside className="card-enter motion-delay-2 rounded-brand bg-[#FFF1D8] p-6 md:p-8 lg:sticky lg:top-28">
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
