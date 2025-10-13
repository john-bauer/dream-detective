/**
* @description This application doesn't really have a "layout", but I've added it
* to handle page transitions.
*/

import { Outlet, useLocation } from 'react-router'

export default function Layout() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="route-fade">
      <Outlet />
    </div>
  )
}