import React, { PropsWithChildren } from 'react'

const PageHeader = ({children}:PropsWithChildren) => {
  return (
    <div className='text-3xl font-medium mb-8'>{children}</div>
  )
}

export default PageHeader