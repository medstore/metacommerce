import "./user_dashboard.css"
import { useEffect } from "react"
import axios from "../../axios"
import { useState } from "react"
import CancelOrder from "./CancelOrder"
import ReviewProduct from "./ReviewProduct"
import { CircularProgress } from '@material-ui/core'
import { useContext } from "react"
import { AppContext } from "../../context/AppContext"

export default function UserOrders() {

    const [orders, setOrders] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useContext(AppContext)

    const getOrders = async () => {
        try {
            setIsLoading(true)
            const config = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("userAuthToken")}`
                },
            }
            const { data } = await axios.post("/api/private/getallorders", { userId: user._id }, config).catch((error) => {
                console.log("failed to load cart item")
            })
            if (data) {
                setOrders(data)
            }
            setIsLoading(false)
        } catch (e) {
            console.log("failed to load cart item")
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getOrders()
    }, [])

    function OrderCard(props) {
        return (
            <div className="cartitem">
                <div className="cartitemWrapper">
                    <div className="uchleft">
                        <img className="cartHeaderImg" src={props.value.productImg} alt="product image" />
                        <div className="headerText">
                            <h4>{props.value.productName}</h4>
                            <span className="delAddr">Ordered on {props.value.createdAt}</span>
                            <span className="delAddr">Deliver to {props.value.deliveryAddress}</span>
                        </div>
                    </div>
                    <div className="usecDiv">
                        <div className="uchmid">
                            <div className="uquanHandler">
                                <div>
                                    <span>Status</span>
                                    <p className={`${props.value.status === "Delivered" ? "markGreen" : null}`}>{props.value.status === "Delivered" ? "Order Delivered ✔️" : props.value.status}</p>
                                </div>

                                {
                                    props.value.status == "Delivered" ?
                                        <ReviewProduct signal={true} order_id={props.value._id} product_name={props.value.productName} review={props.value.review} />
                                        :
                                        <CancelOrder signal={true} order_id={props.value._id} getOrders={getOrders} />
                                }
                            </div>
                        </div>
                        <div className="uchright">
                            <div className="chrightAttr">
                                <span>Price :</span>
                                <span>Quantity :</span>
                                <hr />
                                <span>Total :</span>
                            </div>
                            <div className="chrightValue">
                                <span>${props.value.productPrice}/-</span>
                                <span>{props.value.productQuantity}</span>
                                <hr />
                                <span>${props.value.totalPrice}/-</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="ordersPage">
            {
                orders ? <>
                    <div className="cartDiv">
                        <div id="closeBtn">
                            <button>
                                X
                            </button>
                        </div>
                        <div className="userOrderDiv">
                            {
                                isLoading ? <CircularProgress /> :
                                    orders.length > 0 ?
                                        <>
                                            <div className="userDashRightTop">
                                                <h2>My Orders</h2>
                                            </div>
                                            {
                                                orders.map((item, key) => {
                                                    return (
                                                        <OrderCard key={key} value={item} />
                                                    )
                                                })
                                            }
                                        </>
                                        : <h2>Oops! No order found</h2>
                            }
                        </div>
                    </div>
                </> : null
            }
        </div>
    )
}