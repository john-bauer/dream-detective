/**
 * @description A simple reusable container component.
*/

interface ContainerProps {
  narrow?: boolean
  children: React.ReactNode
}

export default function Container({ narrow = false, children }: ContainerProps) {
  const containerClass = `mx-auto px-4 sm:px-6 lg:px-8 ${narrow ? 'max-w-4xl' : 'max-w-7xl'}`
  
  return (
    <div className={containerClass}>
      {children}
    </div>
  )
}