import { useContext, useEffect } from "react"
import "./dashboardstyle.css"
import OrdersCard from "./product_card/OrdersCard"
import { get_admin_orders } from "../../service/adminApi"
import { useState } from "react"
import axios from "../../axios"
import { CircularProgress } from '@material-ui/core'
import { Navigate, Route, useNavigate } from 'react-router-dom'
import { AppContext } from "../../context/AppContext"

export default function AdminOrders() {

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useContext(AppContext);
    const navigate = useNavigate();

    const getAdminOrders = async () => {
        setIsLoading(true)
        try {
            setIsLoading(true)
            const config = {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                },
            }
            const { data } = await axios.get("/api/auth/getallordereditem", config).catch((error) => {
                console.log("failed to load cart item")
            })
            if (data) {
                console.log(data)
                setOrders(data)
            }
            setIsLoading(false)
        } catch (e) {
            console.log("failed to load cart item")
            setIsLoading(false)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        if (localStorage.getItem("userAuthToken")==null || user && user.role != "admin") {
            navigate(`/`)
        }else{
            getAdminOrders()
        }
    }, [user])

    return (
        <>
            <div className="adDashRightTop">
                <h2>Orders</h2>
            </div>
            {
                isLoading ? <CircularProgress /> :
                    <div className="adminOrdersDiv">
                        <h3 className="ordHeading">Pending Orders</h3>
                        {
                            orders && orders.map((item, key) => {
                                return (
                                    item.status != "Delivered" ? <OrdersCard key={key} value={item} getAdminOrders={getAdminOrders} /> : null
                                )
                            })
                        }
                        <h3 className="ordHeading">Delivered</h3>
                        {
                            orders && orders.map((item, key) => {
                                return (
                                    item.status === "Delivered" ? <OrdersCard key={key} value={item} getAdminOrders={getAdminOrders} /> : null
                                )
                            })
                        }
                    </div>
            }
        </>
    )
}