"use client"
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { ComponentProps, PropsWithChildren } from 'react'

const Navbar = ({ children }: PropsWithChildren) => {
    return (
        <nav className='flex  bg-foreground justify-center align-center'>
            {children}
        </nav>
    )
}

export default Navbar

export function NavLink(props: Omit<ComponentProps<typeof Link>, "className">) {
    const pathname = usePathname()
    return <Link {...props} className={cn('text-primary-foreground p-4 hover:bg-primary-foreground hover:text-foreground transition-all', pathname == props.href && "bg-primary-foreground text-foreground")} />
}