import { AuthLayout } from '@/modules/auth/ui/layouts/auth-layout'
import React from 'react'

const Layout = ({children}: Readonly<{children: React.ReactNode}>) => {
  return (
    <AuthLayout>
      {children}
    </AuthLayout>
  )
}

export default Layout
