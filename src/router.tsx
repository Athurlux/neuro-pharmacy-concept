import { createBrowserRouter } from 'react-router'
import { Layout } from './components/Layout'
import { RouteError } from './pages/RouteError'

// Each page is its own chunk.
const page = (load: () => Promise<{ default: React.ComponentType }>) => async () => ({ Component: (await load()).default })
const enquiry = (name: 'Availability' | 'Pharmacist' | 'Prescription' | 'Contact') => async () => ({ Component: (await import('./pages/Enquiries'))[name] })

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <RouteError />,
    hydrateFallbackElement: <div className="route-loading" aria-busy="true" />,
    children: [
      { index: true, lazy: page(() => import('./pages/Home')) },
      { path: 'shop', lazy: page(() => import('./pages/Shop')) },
      { path: 'shop/:slug', lazy: page(() => import('./pages/ProductDetail')) },
      { path: 'basket', lazy: page(() => import('./pages/Basket')) },
      { path: 'delivery', lazy: page(() => import('./pages/Delivery')) },
      { path: 'checkout', lazy: page(() => import('./pages/Checkout')) },
      { path: 'checkout/confirmation', lazy: page(() => import('./pages/Confirmation')) },
      { path: 'branches', lazy: page(() => import('./pages/Branches')) },
      { path: 'branches/:slug', lazy: page(() => import('./pages/BranchDetail')) },
      { path: 'enquire/availability', lazy: enquiry('Availability') },
      { path: 'enquire/pharmacist', lazy: enquiry('Pharmacist') },
      { path: 'prescriptions', lazy: enquiry('Prescription') },
      { path: 'contact', lazy: enquiry('Contact') },
      { path: 'about', lazy: page(() => import('./pages/About')) },
      { path: '*', lazy: page(() => import('./pages/NotFound')) },
    ],
  },
])
