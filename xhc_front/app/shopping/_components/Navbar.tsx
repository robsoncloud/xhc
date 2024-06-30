"use client"
import { ShoppingBag, ShoppingBasket, ShoppingCart, ShoppingCartIcon } from 'lucide-react'
import React, { useContext, useState } from 'react'
import CartContext from '../_providers/CartContext'
import ProductCartCheckout from './ProductCartCheckout'




const Navbar = () => {

    const { state } = useContext(CartContext) || {}

    if (state === undefined) {
        throw new Error("You need to use the CartProvider")
    }
    
    const [openCheckout, setOpenCheckout] = useState(false)


    return (
        <div className='bg-gradient-to-r from-green-400 to-blue-500 '>
            <nav className='flex items-center justify-between max-w-6xl mx-auto h-16 '>
                <span>Wear</span>
                <div className='flex gap-1 relative '>
                    <ShoppingCart onClick={() => setOpenCheckout(prev => !prev)} className='cursor-pointer' /> {state.length}
                 
                        <ProductCartCheckout visible={openCheckout} />
                 
                </div>
                
            </nav>


        </div>
    )
}

export default Navbar