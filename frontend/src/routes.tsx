import { createBrowserRouter } from 'react-router'
import Home from './pages/Home'
import Search from './pages/Search'
import Layout from './pages/Layout'


export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'search', element: <Search /> },
    ],
  },
])
