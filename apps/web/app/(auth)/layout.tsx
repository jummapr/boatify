import React from 'react'

const Layout = ({children}: Readonly<{children: React.ReactNode}>) => {
  return (
    <div className='min-h-screen min-w-screen flex flex-col items-center justify-center'>
      {children}
    </div>
  )
}

export default Layout
