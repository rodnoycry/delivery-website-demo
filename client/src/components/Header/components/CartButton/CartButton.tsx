import React, { useState, useEffect } from 'react'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState as StoreState } from '@/redux/store'
import CartImg from './images/Cart.png'
import styles from './CartButton.module.css'
import { getSum } from '@/functions'

export const CartButton: FC = () => {
    const [itemsQty, setItemsQty] = useState(0)
    const [sum, setSum] = useState(0)
    const cart = useSelector((state: StoreState) => state.cartState)

    useEffect(() => {
        if (cart) {
            setItemsQty(cart?.length)
            setSum(cart ? getSum(cart) : 0)
        }
    }, [cart])

    const updateSumAndQty = (): void => {
        setItemsQty(cart?.length)
        setSum(cart ? getSum(cart) : 0)
    }
    return (
        <Link to="/cart">
            <button
                className={styles.cart}
                onClick={() => {
                    window.scrollTo(0, 0)
                    updateSumAndQty()
                }}
            >
                <div className={styles.cartCounter}>
                    <img className={styles.cart} src={CartImg} />
                    <span className={styles.cartCounter}>{itemsQty}</span>
                </div>
                <p className={styles.cart}>
                    <span>{sum}</span>
                    {` руб.`}
                </p>
            </button>
        </Link>
    )
}
