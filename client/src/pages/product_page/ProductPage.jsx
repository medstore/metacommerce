import { useState } from "react";
import { useContext } from "react";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../axios"
import { AppContext } from "../../context/AppContext";
import ClockIcon from "../../static/svg/ClockIcon";
import HappyIcon from "../../static/svg/HappyIcon";
import SadIcon from "../../static/svg/SadIcon";

import UserCart from '../../components/user_dashboard/UserCart';
import UserProfile from '../../components/user_dashboard/UserProfile';
import UserSignin from '../user_signin/UserSignin';
import UserSignup from '../user_signup/UserSignup';
import UserOrders from '../../components/user_dashboard/UserOrders';
import { PageContext } from '../../context/PageContext';

import { add_to_cart } from "../../service/userApi";
import { CircularProgress } from '@material-ui/core'
import "./product_page.css"

export default function ProductPage(props) {

    const { product_id } = useParams();

    const { setContext, userAuth, user } = useContext(AppContext)
    const { page, setPage } = useContext(PageContext)

    const [product, setProduct] = useState({})
    const [review, setReview] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [reviewLoading, setReviewLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const getProduct = async () => {
            try {
                setPageLoading(true)
                const config = {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
                return await axios.post('/api/auth/getproduct', { "productId": product_id }, config).then(response => {
                    setProduct(response.data)
                    document.title = response.data.data.product_name
                    setPageLoading(false)
                }).catch((error) => {
                    console.log("Error while fetching product")
                    setPageLoading(false)
                })
            } catch (err) {
                console.log("Error while fetching product")
                setPageLoading(false)
            }
        }
        const getReviews = async () => {
            try {
                setReviewLoading(true)
                const config = {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    }
                }
                return await axios.post('/api/auth/getreviews', { "productId": product_id }, config).then(response => {
                    setReview(response.data.filter((rev => rev.review.length > 0)))
                    setReviewLoading(false)
                }).catch((error) => {
                    console.log("Error while fetching reviews")
                    setReviewLoading(false)
                })
            } catch (err) {
                console.log("Error while fetching reviews")
                setReviewLoading(false)
            }
        }
        getProduct();
        getReviews();
    }, [product_id]);

    const handleAddCart = async (e) => {
        e.preventDefault();
        if (!userAuth) {
            alert("Please Login to continue")
            return
        }
        setIsLoading(true);
        const res = await add_to_cart(product_id, user._id);
        if (res) {
            setContext();
            setIsLoading(false);
            alert("Item Added to Cart");
        } else {
            setIsLoading(false);
            alert("Failed to Add Item, try again later");
        }
    }

    const handleBuyNow = async (e) => {
        e.preventDefault();
        if (!userAuth) {
            alert("Please Login to continue")
            return
        }
        setIsLoading(true);
        const res = await add_to_cart(product_id, user._id);
        setContext();
        setIsLoading(false);
        setPage("cart")
        // if (res) {
        //     setContext();
        //     setIsLoading(false);
        //     navigate("/user/cart")
        // } else {
        //     setIsLoading(false);
        // }
    }

    const ReviewCard = (props) => {
        return (
            <div className="reviewCard">
                <div className="rcWrapper">
                    <div className="rcLeft">
                        <h3>{props.value.userName}</h3>
                        <p>{props.value.review}</p>
                        <div className="rcDate"><ClockIcon /> <span>{props.value.createdAt.slice(0, props.value.createdAt.length - 14)}</span></div>
                    </div>
                    {/* <div className="rcRight">
                        {
                            props.value.sentiment === 1 ?
                                <HappyIcon />
                                : <SadIcon />
                        }
                    </div> */}
                </div>
                <hr />
            </div>
        )
    }

    return (
        <>
            <div className="productPage">
                <div className="productPageWrapper">
                    <div className="productDetail">
                        {pageLoading ? <CircularProgress /> :
                            <>
                                <div className="productDleft">
                                    <img src={product.product_image} alt="product image" />
                                </div>
                                <div className="productDright">
                                    <h2>{product.product_name}</h2>
                                    <span>{product.product_category}</span>
                                    <h3>Price : ${product.product_price}/-</h3>
                                    <h4><s>MRP : ${Math.floor(parseInt(product.product_price) * 100 / (100 - parseInt(product.discount)))}/-</s> from {product.discount}% discount</h4>
                                    <p>{product.product_description}</p>
                                    <div className="prodActionDiv">
                                        <button className="addBagBtn" onClick={handleAddCart} disabled={isLoading || (user && user.cartItem.includes(product_id))}>{(user && user.cartItem.includes(product_id)) ? "Added" : (isLoading ? "Adding..." : "Add to Bag")}</button>
                                        <button className="buyBtn" onClick={handleBuyNow}>Buy Now</button>
                                    </div>
                                </div>
                            </>
                        }
                    </div>

                    {review &&
                        <div className="productReview">
                            <h3>{review.length} Reviews</h3>
                            <hr />
                            {
                                reviewLoading ?
                                    <div className="reviewLoadingDiv">
                                        <CircularProgress />
                                    </div>
                                    :
                                    review.map((item, key) => {
                                        return <ReviewCard key={key} value={item} />
                                    })
                            }
                        </div>}
                </div>
            </div>
            {
                page == "cart" && (user ? <UserCart /> : <UserSignin />)
            }
            {
                page == "profile" && (user ? <UserProfile /> : <UserSignin />)
            }
            {
                page == "orders" && (user ? <UserOrders /> : <UserSignin />)
            }
            {
                page == "signin" && <UserSignin />
            }
            {
                page == "signup" && <UserSignup />
            }
        </>
    )
}