import { createBrowserRouter } from 'react-router';
import { PublicHome } from './pages/PublicHome';
import { RafflePage } from './pages/RafflePage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { CreateRaffle } from './pages/CreateRaffle';
import { MyNumbers } from '@/components/MyNumbers';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicHome />,
  },
  {
    path: '/r/:raffleId',
    element: <RafflePage />,
  },
  {
    path: '/admin',
    element: <AdminLogin />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboard />,
  },
  {
    path: '/admin/create',
    element: <CreateRaffle />,
  },
  {
    path: '/my-numbers',
    element: <MyNumbers />,
  }
]);
