"use client"
import React, { useContext } from 'react'
import { ClothingProduct } from './Products'
import { ShoppingBag, ShoppingCart } from 'lucide-react'
import CartContext from '../_providers/CartContext'


type PropsProductCard = {
    product: ClothingProduct
}

const ProductCard = ({ product }: PropsProductCard) => {

    const context = useContext(CartContext)

    if (context === undefined) {
        throw new Error("You need to use the CartProvider")
    }

    const { state, dispatch } = context;


    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between min-h-52">
            <div className='flex items-center justify-center flex-col flex-1'>
                <ShoppingBag size={48} className="text-green-600" />
            </div>
            <div className='p-2 flex justify-between items-center'>
                <div className='text-sm font-medium'>
                    <div className='text-gray-900'>{product && (product.name)}</div>
                    <div className='text-gray-500 text-xs'>${product && (product.price)}</div>
                </div>
                <button
                    className="text-green-600 hover:text-green-500 focus:outline-none"
                >
                    <ShoppingCart size={16} onClick={() => dispatch({ type: "ADD", payload: product })} />
                </button>
            </div>

        </div>
    )
}

export default ProductCard