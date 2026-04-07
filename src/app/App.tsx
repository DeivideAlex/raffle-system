import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}
