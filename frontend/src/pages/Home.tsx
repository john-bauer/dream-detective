import { useNavigate } from 'react-router'
import Container from '../components/Container'
import SearchBar from '../components/SearchBar'
import ServerStatus from '../components/ServerStatus'

export default function Home() {
  const navigate = useNavigate()
  return (
    <Container narrow>
      {/*-------- Title & Description ------ */}
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="w-full">
          <h1 className="leading-9 text-2xl sm:text-3xl font-bold font-host-grotesk text-gray-900">Dream Detective<span className="text-blue-600"></span></h1>
          <p className="text-gray-800 mt-4 leading-6 text-md sm:text-lg">An AI agent that interprets your dreams.</p>
          {/*-------- Search Form ------ */}
          <div className="mt-8">
            <SearchBar
              initialValue=""
              onSubmit={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
              autoFocus
            />
          </div>
          {/*-------- Server Status ------ */}
          <div className="mt-4">
            <ServerStatus />
          </div>
        </div>
      </div>
    </Container>
  )
}