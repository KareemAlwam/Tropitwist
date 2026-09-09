# Tropitwist Frontend UX and Product Audit

Audit date: 9 September 2026

## Executive summary

Tropitwist already has a distinctive visual identity. The cream, yellow, and red palette, condensed display type, stripe motif, and oversized headlines make the brand recognizable. The existing capture communicates energy and personality well.

The frontend is not yet ready to hand off as a finished commerce experience. It is a strong visual prototype with a functioning local cart, catalog browsing, search, checkout form, account mockup, wishlist page, and admin shell. Before backend work becomes the main focus, the frontend needs one focused completion pass around trust, product information, interaction feedback, accessibility, content consistency, and real commerce states.

Recommended decision: do the Priority 0 frontend work below first, define the API contracts, and then start the backend. Priority 1 visual refinement can continue in parallel once backend endpoints are stable.

## What already works well

- The brand is memorable and visually differentiated from generic beauty stores.
- Typography has a clear role: Barlow Condensed for expression and DM Sans for utility and reading.
- The homepage has a strong top-to-bottom rhythm: campaign, products, brand story, footer.
- Product, cart, checkout, search, account, wishlist, and admin routes already exist.
- Mobile navigation, responsive grids, reduced-motion handling, and form labels are present.
- Cart persistence and collection filtering make the prototype meaningfully interactive.
- The recent modular structure is suitable for adding APIs without rebuilding the frontend.

## Priority 0 — complete before backend handoff

### 1. Finish the core shopping journey

The current add-to-cart actions update state but provide no strong confirmation. Add a cart drawer or toast containing the product, quantity, current subtotal, “View cart,” and “Checkout” actions. Disable the button briefly while an add operation is pending and change its label to “Added.”

Checkout currently prepares a payload and logs it. It needs defined loading, success, failure, retry, duplicate-submission prevention, and payment-declined states. On success, show a dedicated confirmation page with order number, purchased items, total, delivery estimate, and contact details.

Required routes or states:

- `/order-confirmation/:orderId`
- Checkout submitting state
- Payment failure state
- Inventory changed state
- Network failure and retry state
- Expired or invalid cart state

### 2. Make product information credible

Product pages currently have only one image, a short description, generic benefits, generic instructions, a hard-coded rating, and hard-coded stock text. Beauty customers need enough information to judge fit and safety.

Add structured product content:

- Image gallery with 3–5 consistent images
- Ingredients and full INCI list
- Skin type and concern tags
- Texture, finish, scent, and size
- Directions and warnings
- Delivery and return summary near the purchase button
- Real inventory status
- Real reviews and review distribution
- Related products or “Complete the routine” section
- Wishlist control on both product cards and product pages

Never display “4.9 · 28 reviews,” “In stock,” or “Cruelty free” unless the data source supports those claims.

### 3. Replace dead and misleading interactions

The footer currently contains `#` links for Instagram, TikTok, shipping, returns, privacy, and FAQ. The newsletter prevents submission without feedback. The admin “Add product” button has no action. These lower trust more than omitting the controls entirely.

Before launch, either implement each control or remove/disable it with an honest “Coming soon” treatment. Add real policy pages and real contact details.

### 4. Define authentication behavior

Account login and registration currently accept validated values locally and open a simulated dashboard. Define these states before connecting the backend:

- Login, registration, logout, and session restoration
- Email verification
- Forgot/reset password
- Invalid credentials and locked/rate-limited account
- Guest checkout versus signed-in checkout
- Merge guest cart after login
- Profile, address, and order-history loading/error/empty states

Do not log passwords or complete checkout/customer payloads in production.

### 5. Establish API contracts

The backend should not be designed around the current JSX. Agree on resources and error shapes first:

- `GET /products` with category, search, sort, pagination, and availability
- `GET /products/:slug`
- `POST /cart/items`, `PATCH /cart/items/:id`, `DELETE /cart/items/:id`
- `POST /checkout/session` and `POST /orders`
- Authentication and current-user endpoints
- Wishlist endpoints
- Addresses and orders
- Newsletter subscription
- Admin product, inventory, order, and customer endpoints

Every request needs consistent loading, empty, success, validation-error, unauthorized, forbidden, not-found, conflict, and server-error responses.

## Priority 1 — high-impact UX improvements

### Navigation and discovery

- Change “SHOP” in the header from a link to the homepage into “ALL PRODUCTS.” “Shop” pointing home is ambiguous.
- Show the active navigation item.
- Include Account and Wishlist inside the mobile drawer; currently those header icons are hidden on mobile.
- Add a search shortcut inside the mobile menu.
- Support query parameters for search, filters, and sorting so results can be shared and survive refresh/back navigation.
- Add breadcrumbs on collection and product pages.
- Replace the current unknown-route fallback to Home with a real 404 page.
- Use product slugs rather than internal IDs such as `/products/p1`.

### Product cards

- Use one shared card pattern everywhere, including homepage, search, collections, and wishlist.
- Reserve fixed areas for badges, titles, descriptions, prices, and actions to keep grids aligned.
- Add a visible wishlist button.
- Provide an “Added” state after cart actions.
- Avoid showing both a sale badge and another badge in competing corners unless the hierarchy is clear.
- Keep descriptions to two lines and avoid long bundle descriptions changing card heights.

### Cart and checkout

- Add persistent cart feedback without forcing navigation.
- Make the mobile checkout action sticky near the bottom of the viewport.
- Show the amount remaining for free delivery, not “Add LE 750”; calculate `750 - subtotal`.
- Add estimated delivery time and accepted payment methods.
- Format EGP consistently. Prefer `EGP 350` or `350 EGP`; avoid mixing “LE” with other formats.
- Add coupon/promotion support only if it is part of the business model; otherwise do not add an empty field.
- Add input autocomplete attributes such as `given-name`, `family-name`, `email`, `tel`, `street-address`, and `cc-number`.
- Format card number and expiry while typing.
- Move focus to the first invalid field and provide an error summary.
- Never store payment data in browser storage or application logs.

### Trust and reassurance

Add a restrained reassurance strip close to product purchase actions and checkout:

- Delivery coverage and expected timing
- Free-delivery threshold
- Return policy summary
- Secure payment statement
- Customer-support channel and working hours

Avoid generic trust badges that are not verifiable. Real policies and clear language feel more professional.

### Content quality

- Establish a single tone guide and use it consistently.
- Proofread all product names and claims. For example, “Karate Oil by Glow” may be an unintended product name.
- Replace generic Unsplash imagery with consistent product photography before launch.
- Make image crops, lighting, background, scale, and pack orientation consistent.
- Add useful alt text based on what each image shows, not only the product name.
- Add empty-state recommendations rather than only “coming soon.”

## Color system and where to use it

Current brand colors:

| Token | Hex | Recommended role |
|---|---:|---|
| Cream | `#FFF8EE` | Default page background and quiet surfaces |
| Warm cream | `#FFF1D8` | Cards, form groupings, cart summaries, secondary panels |
| Ink | `#231F20` | Body copy, navigation, high-trust controls, footer variant |
| Cherry | `#F63946` | Primary CTA, active state, error, sale accent |
| Banana | `#F4C430` | Brand moments, promotions, selected highlights, positive notice |

### Recommended distribution

Use cream for roughly 60–70% of visible surfaces, warm cream for 10–15%, ink for 10–15%, yellow for 5–10%, and red for about 5%. This is guidance, not a rigid formula. The goal is to let yellow and red signal importance instead of turning every section into a campaign poster.

### Specific placement rules

- Primary purchase actions: cherry background, cream text.
- Secondary actions: ink background with cream text, or transparent with an ink border.
- Destructive actions: text-only cherry or a light cherry tint; do not style them like primary purchase actions.
- Success: introduce a muted green token rather than using yellow. Suggested `#2F6B4F` with a pale `#E8F3EC` surface.
- Informational notice: banana at 20–35% tint with ink text.
- Error: cherry text and border on a very light cherry surface; do not use solid red for large error panels.
- Input focus: ink or a darker yellow outline with sufficient contrast. The current bright yellow focus ring can be hard to distinguish on cream.
- Product imagery: warm cream or neutral white backgrounds. Avoid yellow stripes behind every product because they compete with packaging.
- Footer: ink background with cream text would create a more premium ending and stronger separation. Use banana only as a thin accent or newsletter panel.
- Admin: keep mostly neutral cream/ink; reserve brand colors for status and actions so the data remains readable.

### Accessibility caution

Yellow with white text should not be used. Small muted text such as `text-ink/45` and `text-ink/50` may be too faint on cream, especially at 10–12 px. Use at least approximately 65–70% ink for functional labels, prices, form help, and navigation. Test all final pairs against WCAG AA contrast requirements.

## Visual direction: professional without losing personality

The current screenshot uses red, yellow, stripes, and oversized type almost continuously. It is energetic but visually loud. A more professional result does not require abandoning the identity; it requires rhythm.

Use an alternating pattern:

1. One expressive brand section
2. One quiet product or information section
3. One expressive campaign moment
4. One quiet trust or editorial section

Keep stripes mainly in the hero, campaign banner, and small accents. Product grids should be calmer so photography, names, prices, and actions scan quickly. Use large display type for campaign headlines, but use more moderate headings for checkout, account, policies, and admin screens.

Standardize:

- Maximum content width
- Section spacing scale
- Button heights and radii
- Input heights and states
- Card image ratios
- Heading sizes at each breakpoint
- Badge placement
- Border and shadow strengths

The code currently contains multiple one-off color literals and very compressed JSX in shared catalog components. Convert repeated colors and component states into named design tokens and format components for maintainability before the design system grows.

## Accessibility and quality checklist

- Add a “Skip to content” link.
- Give the main content a stable `id`.
- Trap focus in the mobile navigation drawer, close it with Escape, and restore focus to the menu button.
- Prevent background scrolling while the drawer is open.
- Ensure every interactive target is at least about 44 × 44 px on touch screens.
- Add visible keyboard focus styles to links, buttons, selects, and icon controls.
- Announce cart-count and add-to-cart changes using an `aria-live` region.
- Use semantic headings in order and avoid headings chosen only for visual size.
- Add accessible names to sorting and filtering groups.
- Use `aria-current="page"` for active navigation.
- Test at 320 px width, 200% zoom, keyboard-only navigation, and reduced motion.
- Add local font fallbacks or self-host fonts to reduce external dependency and layout shift.
- Add image dimensions, responsive `srcset`, lazy loading below the fold, and optimized WebP/AVIF assets.

## Technical frontend improvements

### Required before production

- Add ESLint and a formatter.
- Add unit tests for order calculations, checkout validation, cart updates, and product filtering.
- Add component tests for cart, checkout errors, and navigation.
- Add end-to-end tests for browse → product → cart → checkout and login → account → logout.
- Add an error boundary and route-level error/empty states.
- Add environment validation for API URLs.
- Add analytics and consent only after privacy requirements are defined.
- Add SEO metadata, canonical URLs, Open Graph data, sitemap, robots policy, and product structured data.
- Add a proper 404 route.
- Decide whether to adopt a router. The current path lookup works for static navigation but a router will better support parameters, nested layouts, history navigation, and route-level loading.

### Performance targets

- Largest Contentful Paint below 2.5 seconds on a representative mobile connection.
- Cumulative Layout Shift below 0.1.
- Interaction to Next Paint below 200 ms.
- Avoid shipping full-size external images for card thumbnails.
- Lazy-load below-the-fold images and prefetch only the most likely next route.

## Screen-by-screen missing items

### Homepage

- Clearer product-category entry points
- Social proof or real review content
- Trust/delivery/returns section
- Newsletter feedback
- More consistent product photography
- A quieter area between major yellow/red campaign sections

### Collections and search

- URL-backed filters and sort
- Result count on every collection
- Pagination or load-more strategy
- Mobile filter/sort sheet for a larger catalog
- Applied-filter summary and reset
- Typo-tolerant search and suggestions from the backend

### Product detail

- Gallery, ingredients, suitability, warnings, shipping, returns, reviews, related products
- Wishlist button
- Variant support if sizes/scents will vary
- Real stock and low-stock states
- Add-to-cart confirmation
- Not-found behavior instead of silently showing the first product

### Cart

- Correct free-shipping progress message
- Loading/error states for server synchronization
- Stock and price-change messages
- Optional recommendations kept below the order decision area
- Sticky checkout action on mobile

### Checkout

- Real order submission and payment integration
- Confirmation route
- Autocomplete and input formatting
- First-error focus and submission loading state
- Delivery method and timing if the business supports alternatives
- Terms/privacy acknowledgement where legally required

### Account and wishlist

- Real sessions and authorization
- Password recovery and email verification
- Server-synced wishlist
- Order details, addresses, and reorder
- Guest-to-account cart/wishlist merge

### Admin

- Authentication and role authorization
- Retry controls and robust error states
- Product CRUD, media upload, inventory, order status updates
- Confirmation for destructive actions
- Pagination, search, filters, and audit history
- Mobile admin strategy; dense management interfaces may intentionally target tablet/desktop

## Recommended implementation order

### Phase 1: frontend completion and contracts

1. Fix misleading/dead controls and product not-found behavior.
2. Add toast/cart drawer, loading, success, and error patterns.
3. Complete product content model and design all commerce states.
4. Add accessibility foundations and responsive QA.
5. Define API schemas and frontend service interfaces.
6. Add tests around cart, checkout, validation, and routing.

### Phase 2: backend integration

1. Product catalog, images, categories, availability, and search.
2. Authentication, sessions, profiles, and addresses.
3. Server cart and guest-cart merge.
4. Checkout, payment, orders, and transactional email.
5. Wishlist and reviews.
6. Admin authorization and management endpoints.

### Phase 3: refinement and launch

1. Replace placeholder photography and content.
2. Run accessibility and device testing.
3. Optimize images, fonts, and Core Web Vitals.
4. Add SEO, analytics, monitoring, privacy, and security review.
5. Conduct a full test order in staging before launch.

## Backend readiness verdict

The project architecture is ready for backend integration, but the product experience is not yet fully specified. Complete Phase 1 first. Once the frontend has explicit loading, empty, success, error, authentication, inventory, and checkout states—and the product data model is agreed—the team can move confidently to backend work without repeatedly redesigning API behavior.

The shortest path to a professional result is: calm the use of brand colors, complete trust and feedback states, make product information credible, remove every dead interaction, and connect the backend to contracts derived from those completed states.
