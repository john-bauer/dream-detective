/**
* @description This application doesn't really have a "layout", but I've added it
* to handle page transitions and scroll restoration.
*/

import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'

export default function Layout() {
  const location = useLocation()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div key={location.pathname} className="route-fade">
      <Outlet />
    </div>
  )
}