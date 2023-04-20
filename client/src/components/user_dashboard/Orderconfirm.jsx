import React, { useState, useContext } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import { RadioGroup, FormControlLabel, Radio } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { AppContext } from "../../context/AppContext"
import axios from '../../axios'
import './user_dashboard.css'
import { PageContext } from '../../context/PageContext';

export default function Orderconfirm(props) {

    const [open, setOpen] = React.useState(false);
    const [address, setAddress] = useState("")
    const [selectedValue, setSelectedValue] = useState(false)
    const { setContext, user } = useContext(AppContext)
    const {setPage} = useContext(PageContext)

    const handleChange = (e) => {
        e.preventDefault();
        setAddress(e.target.value)
    }
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const config = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("userAuthToken")}`
            }
        }
        try {
            let payloads = []
            props.value.forEach(async item => {
                const payload = {
                    "userId": user._id,
                    "userName": user.userName,
                    "storeId": item.store_id,
                    "totalPrice": item.total_price,
                    "productId": item._id,
                    "productQuantity": item.quantity,
                    "productName": item.product_name,
                    "productImg": item.product_image,
                    "productPrice": item.product_price,
                }
                payloads.push(payload)
            })

            await axios.post(`/api/private/orderproduct`, {"deliveryAddress": address, "items": payloads}, config).then(response => {
                // alert("Order Successful")
                handleClose();
            }).catch(error => {
                // alert("Order failed, Please try again later")
                handleClose();
            })
            props.getProduct()
            setContext()
            alert("Order Successful")
            setPage('orders')

        } catch (err) {
            alert("Order failed due to some error")
            handleClose();
        }
    }

    const handleClose = async () => {
        setOpen(false);
    };

    return (

        <div>
            {
                props.signal ?
                    <>
                        <button className="ckButton" onClick={handleClickOpen}>Check Out</button>
                        <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" fullWidth maxWidth="sm">
                            <DialogTitle id="form-dialog-title">Confirm Order</DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                </DialogContentText>
                                <RadioGroup
                                    aria-label="cod"
                                    defaultValue='true'
                                    name="radio-buttons-group"
                                >
                                    <FormControlLabel value="cod" control={<Radio onChange={() => setSelectedValue(true)} />} label="Cash on Delivery" />
                                    {/* <FormControlLabel value="other" control={<Radio onChange={() => setSelectedValue(false)} />} label="Other Payment - Unavailable" /> */}
                                </RadioGroup>
                                <TextField
                                    autoFocus
                                    margin="dense"
                                    id=""
                                    name="address"
                                    onChange={handleChange}
                                    value={address}
                                    label="Delivery Address"
                                    type="text"
                                    fullWidth />

                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose} color="primary">
                                    Cancel
                                </Button>
                                <Button onClick={handleSubmit} color="primary" disabled={!selectedValue}>
                                    Confirm Order
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </>
                    : null
            }

        </div>
    );
}
