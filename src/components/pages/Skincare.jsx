import CollectionPage from '../catalog/CollectionPage';
import { CATEGORY_FILTERS } from '../../constants/catalog';

const config = { category: 'skincare', filters: CATEGORY_FILTERS.skincare, eyebrow: 'TROPITWIST SKINCARE', title: 'SKIN,', accent: 'SIMPLIFIED.', description: 'Straightforward essentials for soft, comfortable skin that keeps its glow all day.', aside: 'Thoughtful formulas, easy rituals, and no unnecessary steps. Find your everyday routine below.', searchPlaceholder: 'Search skincare', cardDescription: () => 'For your daily glow', actionLabel: 'ADD TO CART', emptyTitle: 'NOTHING HERE YET.', emptyText: 'Try another skincare category.' };
export default function Skincare() { return <CollectionPage config={config} />; }
