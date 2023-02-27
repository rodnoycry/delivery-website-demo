import React, { useState, useEffect } from 'react'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import axios, { AxiosError } from 'axios'
import { zoneDeliveryInfo } from '@/config'
import { DetailedOrder, DetailedInputData } from '@/interfaces'
import { resetCart, addAdminOrder } from '@redux/store'
import { Order, InputState } from '@/redux/slices/orderSlice'
import { CartItem } from '@/redux/slices/cartSlice'
import { domain } from '@/services/apiService/config'
import styles from './Confirmation.module.css'
import { getCompleteOrder, getTime } from './functions'
import { checkErrors } from '../../functions'
import LoadImage from '@images/Load.png'

interface Props {
    sum: number
    inputStates: Order | Record<keyof Order, DetailedInputData>
    setInputStates: (
        inputStates: Order | Record<keyof Order, DetailedInputData>
    ) => void
    requiredInputs: string[]
    hasError: boolean
    setParentHasError: (hasError: boolean) => void
    setIsSuccess: (isSuccess: boolean) => void
    cart: CartItem[]
    storeInputStates: Order
}

const errorMeassageObj = {
    empty: '\u00a0',
    sumError: 'Сумма заказа недостаточна для выбранной зоны доставки',
    inputError: 'Необходимые для заказа поля не заполненны',
}

interface ErrorData {
    hasError?: boolean
    isRed?: boolean
}

type OrderError = Record<keyof DetailedOrder, ErrorData>
interface OrderErrorData {
    errorMessage: string
    errorObject?: OrderError
}

export const Confirmation: FC<Props> = ({
    sum: sum_,
    inputStates,
    setInputStates,
    requiredInputs,
    hasError: hasParentError,
    setParentHasError,
    setIsSuccess,
    cart,
    storeInputStates,
}) => {
    const [sum, setSum] = useState<number>(sum_)

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [hasError, setHasError] = useState<boolean>(hasParentError)
    const [errorMessage, setErrorMessage] = useState<string>(
        errorMeassageObj.empty
    )
    const dispatch = useDispatch()

    useEffect(() => {
        if (!hasError) {
            setErrorMessage(errorMeassageObj.empty)
        }
    }, [hasError])

    useEffect(() => {
        setSum(sum_)
    }, [sum_])

    useEffect(() => {
        setHasError(hasParentError)
    }, [hasParentError])

    useEffect(() => {
        if (inputStates.zone) {
            const minSum =
                zoneDeliveryInfo[
                    inputStates.zone as keyof typeof zoneDeliveryInfo
                ].minSum
            if (hasError) {
                setErrorMessage(errorMeassageObj.inputError)
            }
            if (minSum > sum) {
                setErrorMessage(errorMeassageObj.sumError)
                setParentHasError(true)
            } else {
                setErrorMessage('')
                setParentHasError(false)
            }
        }
    }, [sum, inputStates.zone])
    // On submit button
    const onSubmit = (): void => {
        setIsLoading(true)
        const time = getTime()
        const orderInfo = getCompleteOrder(time, cart, sum, storeInputStates)
        axios
            .post(`${domain}/api/orders/add`, orderInfo)
            .then((res) => {
                setIsLoading(false)
                setIsSuccess(true)
                dispatch(addAdminOrder(orderInfo))
                dispatch(resetCart())
            })
            .catch((error: AxiosError<OrderErrorData | null>) => {
                console.log(`$$$$$$$$`, error.response)
                if (error.response?.status === 400) {
                    if (
                        error.response?.data?.errorObject &&
                        typeof error.response?.data?.errorObject === 'object'
                    ) {
                        const inputStatesCopy = JSON.parse(
                            JSON.stringify(inputStates)
                        )
                        Object.entries(
                            error.response?.data?.errorObject
                        ).forEach(([inputName, errorData]) => {
                            inputStatesCopy[inputName] = {
                                ...inputStatesCopy[inputName],
                                ...errorData,
                            }
                        })
                        setInputStates(inputStatesCopy)
                    }
                    if (error.response?.data?.errorMessage) {
                        setErrorMessage(error.response?.data?.errorMessage)
                    }
                } else {
                    console.error(error)
                    setErrorMessage(
                        'Произошла ошибка, пожалуйста попробуйте отправить заказ повторно'
                    )
                }
                setIsLoading(false)
            })
    }
    return (
        <>
            <div className={styles.upperInfoContainer}>
                <div className={styles.upperInfo}>
                    <h1 className={styles.upperInfo}>Сумма заказа: {sum} ₽</h1>
                    <h4 className={styles.upperInfo} style={{ marginTop: 10 }}>
                        Итоговая сумма в чеке может измениться. Веб-сайт может
                        не учитывать детали доставки, бонусные карты
                    </h4>
                </div>
            </div>
            <div className={styles.buttons}>
                <Link to="/cart">
                    <button className={styles.backButton}>
                        <p className={styles.backButton}>
                            ⬅️ {`\u00a0`}Вернуться назад
                        </p>
                    </button>
                </Link>
                <button
                    onClick={() => {
                        if (!hasError) {
                            onSubmit()
                        }
                    }}
                    className={styles.submitButton}
                    disabled={hasError}
                >
                    {!isLoading ? (
                        <p className={styles.submitButton}>
                            Оформить заказ {`\u00a0`}✅
                        </p>
                    ) : (
                        <img
                            className={styles.loadImage}
                            src={LoadImage}
                            style={{ width: 30 }}
                        />
                    )}
                </button>
            </div>
            <div className={styles.lowerInfoContainer}>
                <div className={styles.upperInfo}>
                    <h4 className={styles.errorMessage}>{errorMessage}</h4>
                    <h4 className={styles.upperInfo} style={{ marginTop: 10 }}>
                        Нажимая на кнопку, Вы соглашаетесь с{' '}
                        <Link
                            to="/offer"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span style={{ textDecoration: 'underline' }}>
                                Офертой
                            </span>
                        </Link>
                        {', '}
                        <Link
                            to="/terms"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span style={{ textDecoration: 'underline' }}>
                                Пользовательским соглашением
                            </span>
                        </Link>{' '}
                        и{' '}
                        <Link
                            to="/policy"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span style={{ textDecoration: 'underline' }}>
                                Политикой обработки персональных данных
                            </span>
                        </Link>
                    </h4>
                </div>
            </div>
        </>
    )
}
