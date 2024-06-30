import Navbar, { NavLink } from '@/components/Navbar'
import React, { PropsWithChildren } from 'react'

const LayoutAdmin = ({ children }: PropsWithChildren) => {
    return (
        <div className='space-y-8'>
            <Navbar>
                <NavLink href="/admin">Dashboard </NavLink>
                <NavLink href="/admin/computers">Computers </NavLink>
                <NavLink href="/admin/users">Users </NavLink>
            </Navbar>
            <main className='container'>
                {children}
            </main>
        </div>
    )
}

export default LayoutAdmin