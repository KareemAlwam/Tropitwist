import { useEffect, useState } from 'react';
import { route } from '../../utils/routes';
import { api, clearSession, getSession, restoreSession, setSession } from '../../services/api';

const initialForm = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' };

export default function Account() {
  const [mode, setMode] = useState('login');
  const [isDashboard, setIsDashboard] = useState(() => Boolean(getSession()));
  const [form, setForm] = useState(initialForm);
  const [accountProfile, setAccountProfile] = useState(() => getSession()?.user || { firstName: '', lastName: '', email: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    let active = true;
    restoreSession().then((savedSession) => {
      if (!active || !savedSession) return;
      setAccountProfile(savedSession.user);
      setIsDashboard(true);
    });
    return () => { active = false; };
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setStatus('');
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setForm(initialForm);
    setErrors({});
    setStatus('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (mode === 'register' && !form.firstName.trim()) nextErrors.firstName = 'Tell us your first name.';
    if (mode === 'register' && !form.lastName.trim()) nextErrors.lastName = 'Tell us your last name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (mode === 'register' && form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      const payload = mode === 'register'
        ? { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password };
      const data = await api(`/auth/${mode === 'register' ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(payload) });
      setSession(data);
      setAccountProfile(data.user);
      setIsDashboard(true);
    } catch (error) { setStatus(error.message); }
  }

  const field = (name, label, type = 'text', className = '') => (
    <label className={`text-xs font-bold tracking-wide ${className}`}>
      {label}{errors[name] && <span aria-hidden="true" className="ml-1 inline-block h-2 w-2 rounded-full bg-cherry align-middle" />}
      <input name={name} type={type} value={form[name]} onChange={updateField} aria-invalid={Boolean(errors[name])} className={`checkout-input bg-cream ${errors[name] ? 'border-2 border-cherry' : ''}`} />
      {errors[name] && <span className="mt-1 block text-[11px] font-normal text-cherry">{errors[name]}</span>}
    </label>
  );

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      {isDashboard ? (
        <Dashboard profile={accountProfile} onProfileUpdate={setAccountProfile} onSignOut={async () => {
          try { await api('/auth/logout', { method: 'POST', skipAuthRefresh: true }); } catch { /* Clear the local state even if the network is unavailable. */ }
          clearSession();
          setIsDashboard(false);
          setForm(initialForm);
          setStatus('');
        }} />
      ) : (
        <section className="card-enter max-w-2xl mx-auto rounded-brand bg-[#FFF1D8] p-6 md:p-10">
          <div className="flex flex-wrap gap-2 border-b border-ink/10 pb-4 mb-7">
            {['login', 'register'].map((option) => (
              <button key={option} type="button" onClick={() => switchMode(option)} className={`rounded-full px-5 py-2.5 text-[10px] font-bold tracking-widest transition-colors ${mode === option ? 'bg-ink text-cream' : 'text-ink/55 hover:text-cherry'}`}>
                {option === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </button>
            ))}
          </div>
          <h2 className="motion-reveal font-display font-bold text-5xl">{mode === 'login' ? 'WELCOME BACK.' : 'JOIN THE GLOW.'}</h2>
          <p className="motion-rise motion-delay-1 mt-3 text-sm text-ink/60">{mode === 'login' ? 'Pick up where your routine left off.' : 'Create your customer profile for easier checkout.'}</p>
          <form noValidate onSubmit={handleSubmit} className="mt-7 grid sm:grid-cols-2 gap-4">
            {mode === 'register' && field('firstName', 'FIRST NAME')}
            {mode === 'register' && field('lastName', 'LAST NAME')}
            {field('email', 'EMAIL ADDRESS', 'email', 'sm:col-span-2')}
            {field('password', 'PASSWORD', 'password', mode === 'login' ? 'sm:col-span-2' : '')}
            {mode === 'register' && field('confirmPassword', 'CONFIRM PASSWORD')}
            <button type="submit" className="sm:col-span-2 mt-3 w-full rounded-full bg-cherry text-cream py-4 text-xs font-bold tracking-widest hover:bg-ink transition-colors">
              {mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </button>
            {status && <p role="status" className="sm:col-span-2 rounded-brand bg-banana p-4 text-sm text-ink">{status}</p>}
          </form>
        </section>
      )}
    </main>
  );
}

function Dashboard({ profile, onProfileUpdate, onSignOut }) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState(profile);
  const [profileErrors, setProfileErrors] = useState({});
  const [profileStatus, setProfileStatus] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersStatus, setOrdersStatus] = useState('loading');
  useEffect(() => {
    let active = true;
    api('/orders').then((data) => {
      if (active) { setOrders(data); setOrdersStatus('ready'); }
    }).catch(() => { if (active) setOrdersStatus('error'); });
    return () => { active = false; };
  }, []);
  const dashboardCards = [
    { label: 'Orders', value: String(orders.length), detail: orders.length ? 'Completed purchases' : 'No purchases yet' },
    { label: 'Saved addresses', value: '0', detail: 'Add one at checkout' },
    { label: 'Wishlist', value: '0', detail: 'Saved products' },
  ];
  const quickActions = [
    { label: 'Continue shopping', href: '/search' },
    { label: 'View wishlist', href: '/wishlist' },
    { label: 'Go to cart', href: '/cart' },
    ...(profile.role === 'admin' ? [{ label: 'Open admin dashboard', href: '/admin' }] : []),
  ];
  const displayName = profile.firstName.trim() || profile.lastName.trim();
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  function updateProfileField(event) {
    const { name, value } = event.target;
    if (name === 'email') return;
    setDraftProfile((current) => ({ ...current, [name]: value }));
    setProfileErrors((current) => ({ ...current, [name]: '' }));
    setProfileStatus('');
  }

  async function saveProfile(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!draftProfile.firstName.trim()) nextErrors.firstName = 'Tell us your first name.';
    if (!draftProfile.lastName.trim()) nextErrors.lastName = 'Tell us your last name.';
    setProfileErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const profilePayload = {
      firstName: draftProfile.firstName.trim(),
      lastName: draftProfile.lastName.trim(),
      email: draftProfile.email.trim(),
    };
    try {
      const updatedProfile = await api('/me', { method: 'PATCH', body: JSON.stringify(profilePayload) });
      onProfileUpdate(updatedProfile);
      const session = getSession();
      if (session) setSession({ ...session, user: updatedProfile });
      setProfileStatus('Your profile has been updated.');
      setIsEditingProfile(false);
    } catch (error) { setProfileStatus(error.message); }
  }

  const profileField = (name, label, type = 'text', readOnly = false) => (
    <label className="text-xs font-bold tracking-wide">
      {label}
      <input
        name={name}
        type={type}
        value={draftProfile[name]}
        onChange={updateProfileField}
        readOnly={readOnly}
        aria-readonly={readOnly}
        className={`checkout-input mt-2 bg-cream ${readOnly ? 'cursor-not-allowed opacity-70' : ''} ${profileErrors[name] ? 'border-cherry' : ''}`}
      />
      {profileErrors[name] && <span className="mt-1 block text-[11px] font-normal text-cherry">{profileErrors[name]}</span>}
    </label>
  );

  return (
    <section className="max-w-5xl mx-auto">
      <div className="card-enter rounded-brand border border-ink/10 bg-[#FFF1D8] p-6 md:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-cherry">CUSTOMER ACCOUNT</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-none text-ink md:text-6xl">
              {displayName ? `Welcome, ${displayName}.` : 'Welcome back.'}
            </h1>
            <p className="mt-3 text-sm text-ink/65">{profile.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {profile.role === 'admin' && <a href={route('/admin')} className="self-start rounded-full bg-cherry px-5 py-3 text-[10px] font-bold tracking-widest text-cream transition-colors hover:bg-ink">ADMIN DASHBOARD</a>}
            <button type="button" onClick={onSignOut} className="self-start rounded-full border border-ink/20 px-5 py-3 text-[10px] font-bold tracking-widest transition-colors hover:border-cherry hover:text-cherry sm:self-auto">
              SIGN OUT
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {dashboardCards.map((card, index) => (
          <article key={card.label} className="card-enter rounded-brand border border-ink/10 bg-cream p-6 hover-lift" style={{ animationDelay: `${index * 90}ms` }}>
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-bold tracking-wide text-ink/65">{card.label}</p>
              <span className="rounded-full bg-banana/60 px-3 py-1 text-[10px] font-bold tracking-widest text-ink">READY</span>
            </div>
            <p className="mt-6 font-display text-5xl font-bold leading-none">{card.value}</p>
            <p className="mt-2 text-sm text-ink/60">{card.detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-brand border border-ink/10 bg-cream p-6 md:p-8">
          <div className="flex flex-col gap-2 border-b border-ink/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-cherry">ORDERS</p>
              <h2 className="mt-2 font-display text-3xl font-bold">Recent activity</h2>
            </div>
            <span className="text-[10px] font-bold tracking-widest text-ink/55">{orders.length} ORDERS</span>
          </div>
          {ordersStatus === 'loading' && <p className="py-10 text-center text-sm text-ink/60">Loading orders...</p>}
          {ordersStatus === 'error' && <p className="py-10 text-center text-sm text-cherry">Orders could not be loaded.</p>}
          {ordersStatus === 'ready' && orders.length === 0 && <div className="py-10 text-center">
            <p className="text-sm font-semibold text-ink">No orders yet.</p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink/60">
              Completed purchases, delivery updates, and order totals will appear here after checkout is connected.
            </p>
            <a href={route('/search')} className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-[10px] font-bold tracking-widest text-cream transition-colors hover:bg-cherry">
              BROWSE PRODUCTS
            </a>
          </div>}
          {ordersStatus === 'ready' && orders.length > 0 && <div className="divide-y divide-ink/10">
            {orders.slice().reverse().slice(0, 5).map((order) => <article key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"><div><p className="font-semibold">{order.id}</p><p className="mt-1 text-xs text-ink/55">{new Date(order.createdAt).toLocaleDateString()}</p></div><div className="flex items-center gap-4"><span className="rounded-full bg-banana/50 px-3 py-1 text-xs capitalize">{order.status}</span><span className="font-bold">LE {order.total}</span></div></article>)}
          </div>}
        </section>

        <div className="grid gap-6">
          <section className="rounded-brand border border-ink/10 bg-[#FFF1D8] p-6 md:p-8">
            {isEditingProfile ? (
              <>
                <p className="text-[10px] font-bold tracking-widest text-cherry">PROFILE</p>
                <h2 className="mt-3 font-display text-3xl font-bold">Edit details</h2>
                <form noValidate onSubmit={saveProfile} className="mt-6 grid gap-4">
                  {profileField('firstName', 'FIRST NAME')}
                  {profileField('lastName', 'LAST NAME')}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button type="submit" className="rounded-full bg-ink px-5 py-3 text-[10px] font-bold tracking-widest text-cream transition-colors hover:bg-cherry">
                      SAVE CHANGES
                    </button>
                    <button type="button" onClick={() => {
                      setIsEditingProfile(false);
                      setProfileErrors({});
                    }} className="rounded-full border border-ink/20 px-5 py-3 text-[10px] font-bold tracking-widest transition-colors hover:border-cherry hover:text-cherry">
                      CANCEL
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <p className="text-[10px] font-bold tracking-widest text-cherry">PROFILE</p>
                <h2 className="mt-3 font-display text-3xl font-bold">Customer details</h2>
                <dl className="mt-6 space-y-4 text-sm">
                  <div>
                    <dt className="text-[10px] font-bold tracking-widest text-ink/45">NAME</dt>
                    <dd className="mt-1 font-semibold text-ink">{fullName || 'Add your name'}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold tracking-widest text-ink/45">EMAIL</dt>
                    <dd className="mt-1 break-words font-semibold text-ink">{profile.email}</dd>
                  </div>
                </dl>
                {profileStatus && <p role="status" className="mt-4 rounded-brand bg-banana/60 p-3 text-sm text-ink">{profileStatus}</p>}
                <button type="button" onClick={() => {
                  setDraftProfile(profile);
                  setProfileErrors({});
                  setIsEditingProfile(true);
                }} className="mt-7 rounded-full bg-ink px-5 py-3 text-[10px] font-bold tracking-widest text-cream transition-colors hover:bg-cherry">
                  EDIT PROFILE
                </button>
              </>
            )}
          </section>

          <section className="rounded-brand border border-ink/10 bg-cream p-6">
            <p className="text-[10px] font-bold tracking-widest text-cherry">QUICK ACTIONS</p>
            <div className="mt-5 grid gap-2">
              {quickActions.map((action) => (
                <a key={action.href} href={route(action.href)} className="flex items-center justify-between rounded-brand border border-ink/10 px-4 py-3 text-sm font-semibold transition-colors hover:border-cherry hover:text-cherry">
                  {action.label}
                  <span aria-hidden="true">→</span>
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>
      <AddressBook profile={profile} />
    </section>
  );
}

function AddressBook({ profile }) {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState('');

  const loadAddresses = () => api('/addresses').then(setAddresses).catch(() => setStatus('Addresses could not be loaded.'));
  useEffect(() => { loadAddresses(); }, []);

  async function addAddress(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      await api('/addresses', { method: 'POST', body: JSON.stringify(values) });
      setShowForm(false);
      setStatus('Address saved.');
      loadAddresses();
    } catch (error) { setStatus(error.message); }
  }

  async function deleteAddress(id) {
    try {
      await api(`/addresses/${id}`, { method: 'DELETE' });
      setStatus('Address removed.');
      loadAddresses();
    } catch (error) { setStatus(error.message); }
  }

  return <section className="mt-8 rounded-brand border border-ink/10 bg-cream p-6 md:p-8">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-5">
      <div><p className="text-[10px] font-bold tracking-[0.2em] text-cherry">ADDRESSES</p><h2 className="mt-2 font-display text-3xl font-bold">Delivery addresses</h2></div>
      <button type="button" onClick={() => setShowForm((value) => !value)} className="rounded-full bg-ink px-5 py-3 text-[10px] font-bold tracking-widest text-cream hover:bg-cherry">{showForm ? 'CANCEL' : 'ADD ADDRESS'}</button>
    </div>
    {status && <p role="status" className="mt-4 text-sm text-ink/65">{status}</p>}
    {showForm && <form onSubmit={addAddress} className="mt-6 grid gap-4 sm:grid-cols-2">
      <input name="label" defaultValue="Home" placeholder="LABEL" className="checkout-input" />
      <input name="phone" placeholder="PHONE NUMBER" required className="checkout-input" />
      <input name="firstName" defaultValue={profile.firstName} placeholder="FIRST NAME" required className="checkout-input" />
      <input name="lastName" defaultValue={profile.lastName} placeholder="LAST NAME" required className="checkout-input" />
      <input name="address" placeholder="ADDRESS" required className="checkout-input sm:col-span-2" />
      <input name="city" placeholder="CITY" required className="checkout-input" />
      <input name="area" placeholder="AREA" required className="checkout-input" />
      <button type="submit" className="w-fit rounded-full bg-cherry px-5 py-3 text-[10px] font-bold tracking-widest text-cream hover:bg-ink">SAVE ADDRESS</button>
    </form>}
    <div className="mt-6 grid gap-3 md:grid-cols-2">{addresses.map((address) => <article key={address.id} className="border border-ink/10 p-4 text-sm"><div className="flex justify-between gap-4"><div><p className="font-semibold">{address.label}</p><p className="mt-2">{address.firstName} {address.lastName}</p><p className="text-ink/60">{address.address}, {address.area}, {address.city}</p><p className="mt-1 text-ink/60">{address.phone}</p></div><button type="button" onClick={() => deleteAddress(address.id)} className="self-start text-xs font-bold text-cherry hover:text-ink">REMOVE</button></div></article>)}</div>
    {!addresses.length && !showForm && <p className="mt-6 text-sm text-ink/60">No saved addresses yet.</p>}
  </section>;
}
