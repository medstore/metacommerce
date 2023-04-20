import "./user_dashboard.css"
import { AppContext } from "../../context/AppContext"
import { useContext } from "react"
import { useEffect } from "react"
import axios from "../../axios"
import { useState } from "react"
import RemoveCart from "./RemoveCart"
import Orderconfirm from "./Orderconfirm"
import { CircularProgress } from '@material-ui/core'

export default function UserCart() {

    const { user } = useContext(AppContext)
    const [grossTotal, setGrosstotal] = useState(0);
    const [cartItem, setCartItem] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const getProduct = async () => {
        try {
            setIsLoading(true)
            const config = {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("userAuthToken")}`
                },
            }
            const { data } = await axios.post("/api/private/getcartitems", { userId: user._id }, config).catch((error) => {
                console.log("failed to load cart item")
            })
            let dummy = 0;
            for (let i = 0; i < data.length; i++) {
                data[i].user_id = user._id;
                data[i].product_price = parseInt(data[i].product_price)
                data[i].total_price = data[i].product_price;
                data[i].quantity = 1;
                dummy = dummy + data[i].product_price;
                setGrosstotal(dummy);
            }
            setCartItem(data)
            setIsLoading(false)
        } catch (e) {
            console.log("failed to load cart item")
            setIsLoading(false)
        }
    }

    useEffect(() => {
        getProduct()
    }, [user])

    function CartCard(props) {

        const handleDecrement = (e) => {
            e.preventDefault();
            for (let i = 0; i < cartItem.length; i++) {
                if (cartItem[i]._id === props.value._id) {
                    if (props.value.quantity > 1) {
                        props.value.quantity = props.value.quantity - 1;
                        props.value.total_price = props.value.total_price - props.value.product_price;
                        setGrosstotal(grossTotal - props.value.product_price)
                    }
                }
            }
        }
        const handleIncrement = (e) => {
            e.preventDefault();
            for (let i = 0; i < cartItem.length; i++) {
                if (cartItem[i]._id === props.value._id) {
                    if (props.value.quantity < props.value.product_quantity) {
                        props.value.quantity = props.value.quantity + 1;
                        props.value.total_price = props.value.total_price + props.value.product_price;
                        setGrosstotal(grossTotal + props.value.product_price);
                    }
                }
            }
        }

        return (
            <div className="cartitem">
                <div className="cartitemWrapper">
                    <div className="chleft">
                        <img className="cartHeaderImg" src={props.value.product_image} alt="product image" />
                        <div className="headerText">
                            <h4>{props.value.product_name}</h4>
                            <span className="ciPrice">Price: ${props.value.product_price}/-</span>
                            {/* <span className="removeCart">Remove</span> */}
                            <RemoveCart signal={true} product_id={props.value._id} getProduct={getProduct} />
                        </div>
                    </div>
                    <div className="secDiv">
                        <div className="chmid">
                            <div className="quanHandler">
                                <button className="idButton" onClick={handleDecrement}>-</button>
                                <span className="idTest">{props.value.quantity}</span>
                                <button className="idButton" onClick={handleIncrement}>+</button>
                            </div>
                        </div>
                        <div className="chright">
                            <span className="ciPrice">${props.value.total_price}/-</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {
                cartItem ? <>

                    <div className="userProfile">
                        <div className="userCartsDiv">
                            <div id="closeBtn">
                                <button>
                                    X
                                </button>
                            </div>
                            {
                                isLoading ? <CircularProgress /> :
                                    cartItem.length > 0 ?
                                        <>
                                            <div className="userDashRightTop">
                                                <h2>Cart</h2>
                                            </div>
                                            <div className="userCartDiv">
                                                {
                                                    cartItem.map((item, key) => {
                                                        return (
                                                            <CartCard key={key} value={item} />
                                                        )
                                                    })
                                                }
                                            </div>
                                            <div className="footer">
                                                <hr></hr>
                                                <b>
                                                    <span className="gt">Grand Total : </span>
                                                    <span>${grossTotal}/-</span>
                                                </b>
                                                <Orderconfirm signal={true} value={cartItem} getProduct={getProduct} />
                                            </div>
                                        </>
                                        : <h2>Oops! No item in cart 🙈</h2>
                            }
                        </div>
                    </div>

                </> : null
            }
        </>
    )
}