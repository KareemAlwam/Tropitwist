import { useEffect, useState } from 'react';
import { products as storefrontProducts } from '../../data/products';
import { route } from '../../utils/routes';

const navItems = ['Overview', 'Orders', 'Products', 'Customers'];
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const fallbackDashboard = {
  admin: { name: 'Store admin' },
  metrics: [
    { key: 'revenue', label: 'Revenue', value: 'LE 0', change: 'Connect orders API' },
    { key: 'orders', label: 'Orders', value: '0', change: 'No orders yet' },
    { key: 'products', label: 'Products', value: storefrontProducts.length, change: 'Local catalog' },
    { key: 'customers', label: 'Customers', value: '0', change: 'Connect accounts API' },
  ],
  orders: [],
  products: storefrontProducts.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    size: product.size || 'N/A',
    price: `LE ${product.price}`,
    status: product.featured === false ? 'Draft' : 'Active',
  })),
  customers: [],
  chart: {
    label: 'STORE ACTIVITY',
    headline: 'Waiting for live data',
    values: [42, 68, 54, 86, 64, 78, 58],
  },
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [dashboard, setDashboard] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: '', usingFallback: false });
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isCurrent = true;

    async function loadDashboard() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`);
        if (!response.ok) throw new Error(`Admin dashboard request failed with status ${response.status}.`);
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('Admin dashboard API must return JSON from /api/admin/dashboard.');
        const data = await response.json();
        if (isCurrent) {
          setDashboard(data);
          setStatus({ loading: false, error: '' });
        }
      } catch (error) {
        if (isCurrent) {
          setDashboard(fallbackDashboard);
          setStatus({ loading: false, error: error.message, usingFallback: true });
        }
      }
    }

    loadDashboard();
    return () => { isCurrent = false; };
  }, []);

  const adminName = dashboard?.admin?.name || '';
  const dashboardData = dashboard || fallbackDashboard;

  return (
    <main className="min-h-screen bg-[#F4F0E8] text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-ink/10 bg-ink px-6 py-7 text-cream lg:flex">
        <a href={route('/')} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-banana font-display text-sm font-bold text-ink">TT</span>
          <span className="font-display text-xl font-bold tracking-wide">TROPITWIST</span>
        </a>
        <div className="mt-14">
          <p className="mb-4 text-[10px] font-bold tracking-[0.2em] text-cream/45">STORE MANAGEMENT</p>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveTab(item)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm transition-colors ${activeTab === item ? 'bg-cherry text-cream' : 'text-cream/65 hover:bg-cream/10 hover:text-cream'}`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t border-cream/10 pt-5">
          <p className="mb-4 text-xs text-cream/45">{status.usingFallback ? 'Local preview mode' : 'Live dashboard'}</p>
          <a href={route('/')} className="text-xs font-bold tracking-wide text-cream/60 hover:text-banana">← VIEW STOREFRONT</a>
        </div>
      </aside>

      <section className="lg:ml-64">
        <header className="border-b border-ink/10 bg-cream px-5 py-5 md:px-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-ink/45">TROPITWIST ADMIN</p>
              <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">{activeTab}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {adminName && <span className="rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold text-ink/65">{adminName}</span>}
              <span className={`rounded-full px-4 py-2 text-[10px] font-bold tracking-widest ${status.usingFallback ? 'bg-banana/60 text-ink' : 'bg-[#E8F3EC] text-[#2F6B4F]'}`}>
                {status.usingFallback ? 'PREVIEW DATA' : 'LIVE DATA'}
              </span>
            </div>
          </div>
          <nav className="mt-5 flex gap-2 overflow-x-auto lg:hidden">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveTab(item)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[10px] font-bold tracking-widest ${activeTab === item ? 'bg-cherry text-cream' : 'bg-ink/5 text-ink/60'}`}
              >
                {item}
              </button>
            ))}
          </nav>
        </header>

        <div className="px-5 py-7 md:px-10 md:py-10">
          {status.loading && <StateMessage>Loading dashboard data...</StateMessage>}
          {!status.loading && status.error && <div role="status" className="mb-6 rounded-brand border border-banana/60 bg-banana/20 p-4 text-sm text-ink"><strong className="font-bold">Preview mode.</strong> Live admin API is unavailable, so the dashboard is using local storefront data.</div>}
          {notice && <div role="status" className="mb-6 rounded-brand border border-ink/10 bg-cream p-4 text-sm text-ink">{notice}</div>}
          {!status.loading && activeTab === 'Overview' && <Overview data={dashboardData} />}
          {!status.loading && activeTab === 'Orders' && <Orders orders={dashboardData.orders} />}
          {!status.loading && activeTab === 'Products' && <Products products={dashboardData.products} onNotice={setNotice} />}
          {!status.loading && activeTab === 'Customers' && <Customers customers={dashboardData.customers} />}
        </div>
      </section>
    </main>
  );
}

function StateMessage({ children }) {
  return <div role="status" className="rounded-brand border border-ink/10 bg-cream p-8 text-sm text-ink/65">{children}</div>;
}

function Overview({ data }) {
  const metrics = data.metrics || [];
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <article key={metric.key || metric.label} className="card-enter rounded-brand border border-ink/10 bg-cream p-6 shadow-sm" style={{ animationDelay: `${index * 70}ms` }}>
            <p className="text-xs font-bold tracking-wide text-ink/55">{metric.label}</p>
            <p className="mt-6 font-display text-4xl font-bold">{metric.value}</p>
            {metric.change && <p className="mt-2 text-xs text-ink/55">{metric.change}</p>}
          </article>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <section className="rounded-brand bg-cream p-6 shadow-sm md:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-bold">Recent orders</h2>
            <span className="text-[10px] font-bold tracking-widest text-ink/45">{(data.orders || []).length} ORDERS</span>
          </div>
          <OrderTable orders={data.orders || []} />
        </section>
        <section className="rounded-brand bg-ink p-6 text-cream md:p-8">
          <p className="text-[10px] font-bold tracking-widest text-cream/65">{data.chart?.label || 'STORE ACTIVITY'}</p>
          <h2 className="mt-3 font-display text-3xl font-bold">{data.chart?.headline || 'Activity data'}</h2>
          {data.chart?.values?.length > 0 && (
            <div className="mt-10 flex h-32 items-end gap-2">
              {data.chart.values.map((value, index) => <span key={index} className="flex-1 rounded-t bg-banana/80 transition-all" style={{ height: `${Math.max(value, 12)}%` }} />)}
            </div>
          )}
          <p className="mt-6 text-xs leading-relaxed text-cream/60">Connect the orders endpoint to replace this preview chart with real sales activity.</p>
        </section>
      </div>
    </>
  );
}

function Orders({ orders }) {
  return (
    <section className="rounded-brand bg-cream p-6 shadow-sm md:p-8">
      <h2 className="font-display text-2xl font-bold">All orders</h2>
      <OrderTable orders={orders} />
    </section>
  );
}

function OrderTable({ orders }) {
  if (!orders.length) return <StateMessage>No orders yet. Orders will appear here after checkout is connected.</StateMessage>;
  return <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="border-b border-ink/10 text-[10px] font-bold tracking-widest text-ink/45"><tr><th className="pb-3">ORDER</th><th className="pb-3">CUSTOMER</th><th className="pb-3">DATE</th><th className="pb-3">TOTAL</th><th className="pb-3">STATUS</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-ink/5"><td className="py-4 font-bold">{order.id}</td><td className="py-4">{order.customer}</td><td className="py-4 text-ink/55">{order.date}</td><td className="py-4 font-bold">{order.total}</td><td className="py-4"><span className="rounded-full bg-banana/50 px-3 py-1 text-xs">{order.status}</span></td></tr>)}</tbody></table></div>;
}

function Products({ products, onNotice }) {
  return <section className="rounded-brand bg-cream p-6 shadow-sm md:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold tracking-[0.2em] text-cherry">CATALOG</p><h2 className="mt-2 font-display text-2xl font-bold">Product catalog</h2></div><button type="button" onClick={() => onNotice('Product creation will be connected to the admin product API.')} className="rounded-full bg-cherry px-5 py-3 text-[10px] font-bold tracking-widest text-cream transition-colors hover:bg-ink">ADD PRODUCT</button></div>{!products.length ? <StateMessage>No products have been returned by the catalog service.</StateMessage> : <div className="mt-6 overflow-hidden rounded-brand border border-ink/10">{products.map((product) => <div key={product.id} className="grid gap-3 border-b border-ink/10 p-4 last:border-0 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-bold">{product.name}</p><p className="text-xs capitalize text-ink/55">{product.category} · {product.size}</p></div><span className="w-fit rounded-full bg-[#E8F3EC] px-3 py-1 text-xs font-bold text-[#2F6B4F]">{product.status || 'Active'}</span><span className="font-bold">{product.price}</span></div>)}</div>}</section>;
}

function Customers({ customers }) {
  return <section className="rounded-brand bg-cream p-6 shadow-sm md:p-8"><h2 className="font-display text-2xl font-bold">Customers</h2>{!customers.length ? <StateMessage>No customer profiles yet. Customer data will appear here after account endpoints are connected.</StateMessage> : <div className="mt-6 grid gap-3">{customers.map((customer) => <div key={customer.id} className="border-b border-ink/10 py-4"><p className="font-bold">{customer.name}</p><p className="text-xs text-ink/55">{customer.email}</p></div>)}</div>}</section>;
}
