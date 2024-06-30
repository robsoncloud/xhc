import { Dispatch, PropsWithChildren, createContext, useReducer, useState } from "react";
import { ClothingProduct } from "../_components/Products";
import { CartReducerType, cartReducer } from "./CartReducert";


export type CartContextType = {
    state: ClothingProduct[],
    dispatch: Dispatch<CartReducerType>
}

const CartContext = createContext<CartContextType | undefined>(undefined);


export function CartProvider({ children }: PropsWithChildren) {
    const [products, setProducts] = useState<ClothingProduct[]>([])

    const [state, dispatch] = useReducer(cartReducer, products)

    return (
        <CartContext.Provider value={{ state, dispatch }}>
            {children}
        </CartContext.Provider>
    )


}


export default CartContext;