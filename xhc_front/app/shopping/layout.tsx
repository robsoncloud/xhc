"use client"
import { ShoppingBag, ShoppingCart } from 'lucide-react'
import React, { PropsWithChildren } from 'react'
import Navbar from './_components/Navbar'
import CartContext, { CartProvider } from './_providers/CartContext'





const ShoppingLayout = ({ children }: PropsWithChildren) => {

    return (
        <CartProvider>
            <div className=' bg-white h-screen '>
                <Navbar />
                <main className='mx-auto max-w-6xl bg-white h-screen mt-10'>
                    {children}
                </main>
            </div>
        </CartProvider>

    )
}

export default ShoppingLayout