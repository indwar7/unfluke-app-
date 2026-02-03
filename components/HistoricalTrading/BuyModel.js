/* eslint-disable */

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input } from "reactstrap";
import { getHistoricalInstrumentData, postHistoricalTrades } from "../../Unfluke_helpers/backend_helper"
import {  toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createSelector } from "reselect";

const errornotify = (msg) => toast(msg, { position: "top-right", className: 'bg-danger text-white' });
const successnotify = (msg) => toast(msg, { position: "top-right", className: 'bg-success text-white' });


const BuyModal = ({
  show,
  onClose,
  instrument,
  setShow,
  currTime
}) => {
  const [orderTypes, setOrderTypes] = useState("market");
  const [qty, setQty] = useState(0);
  const [price, setPrice] = useState(0);
  const [triggeredPrice, setTriggeredPrice] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(-1);
  const [product, setProduct] = useState("MIS");
  const [leverage, setLeverage] = useState(1);
  const [multiple, setMultiple] = useState(1);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const auth = createSelector(
    (state) => state.Login,
    (data) => data.user,
  );

  const user = useSelector(auth)

  let ct = new Date(currTime);
  let hh, mm, ss, MM, DD, YY;
  hh = ct.getHours();
  mm = ct.getMinutes();
  ss = ct.getSeconds();
  MM = ct.getMonth() + 1;
  DD = ct.getDate();
  YY = ct.getFullYear();

  useEffect(() => {
    setCurrentTime(`${hh < 10 ? "0" + hh : hh}:${mm < 10 ? "0" + mm : mm}:00`);
    setCurrentDate(`${YY}-${MM < 10 ? "0" + MM : MM}-${DD < 10 ? "0" + DD : DD}`);
  }, [currTime]);

  useEffect(() => {
    if (orderTypes === "market") {
      setPrice(0);
      setTriggeredPrice(0);
    }
    if (orderTypes === "limit") {
      setTriggeredPrice(0);
    }
    if (orderTypes === "slm") {
      setPrice(0);
    }
  }, [orderTypes]);

  useEffect(() => {
    instrument !== "" && currentDate && getHistoricalInstrumentData({
      market: instrument.market,
      symbol: instrument.exchange + ":" + instrument.name,
      currentDate,

    })
      .then((data) => {
        setLeverage(data.leverage || data["buy_leverage"]);
        setMultiple(data.multiple);
        setCurrentPrice(instrument.price);
      }).catch(e => { e });
  }, [instrument]);


  const buy = () => {
    if (qty % multiple !== 0)
      return errornotify(`Quantity not multiple of ${multiple}`);
    const data = {
      userID: user._id,
      type: "buy",
      instrument_token: instrument.instrument_token,
      marketSearch: instrument.market, // Equity, future, Crypto....
      qty,
      price,
      triggeredPrice,
      market: false,
      limit: false,
      slm: false,
      name: instrument.name,
      product: product === "MIS" ? "MIS" : instrument.market === "equity" || instrument.market === "index" ? "CNC" : "NRML",
      exchange: instrument.exchange,
      margin: (qty * price) / leverage,
      currentPrice: currentPrice,
      currentTime: currentDate + " " + currentTime,
    };

    data[orderTypes] = true;
    if (orderTypes === "slm") data.margin = (qty * triggeredPrice) / leverage;

    if (qty === 0) {
      return errornotify(`Quantity cannot be 0`);
    } else {
      postHistoricalTrades(data).then((data) => {
        setShow(false);
        if (!data.error) {
          return successnotify(data);
        } else {
          return errornotify(data.message);

        }
      }).catch((err) => {
        console.log(err);
      });
    }
  };

  return (
    <>

      <Modal isOpen={show} toggle={onClose} centered>
        <ModalHeader>
          <div className="container">
            <h3 className="text-success">BUY</h3>
            <div className="row">
              <div className="col-md-9">
                <h6>
                  {instrument.name} X {qty} QTY
                </h6>
              </div>
              {/* <div className="col-md-6"></div> */}
              <div className="col-md-6">
                <h6>
                  {currentPrice === -1
                    ? (<span className="text-info">Change the date and time to get the price, as the contract has expired.</span> )
                    : currentPrice}
                </h6>
              </div>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <div className="container">
            <div className="row">
              <div className="col-md-8">
                <FormGroup check className="d-flex justify-content-between">
                  <div>
                    <Input
                      type="radio"
                      name="flexRadioDefault"
                      id="intraday"
                      onChange={() => setProduct("MIS")}
                      checked={product === "MIS"}
                    />
                    <Label for="intraday" check className="text-success">
                      Intraday <span>MIS</span>
                    </Label>
                  </div>
                  <div>
                    <Input
                      type="radio"
                      name="flexRadioDefault"
                      id="longterm"
                      onChange={() =>
                        setProduct(
                          instrument.market === "equity" || instrument.market === "index" ? "CNC" : "NRML"
                        )
                      }
                      checked={product === "CNC" || product === "NRML"}
                    />
                    <Label for="longterm" check className="text-success">
                      Longterm{" "}
                      {instrument.market === "equity" || instrument.market === "index" ? (
                        <span>CNC</span>
                      ) : (
                        <span>NRML</span>
                      )}
                    </Label>
                  </div>
                </FormGroup>
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-4">
                <Label for="qty" className="mb-2">
                  QTY
                </Label>
                <Input
                  type="number"
                  id="qty"
                  min={0}
                  value={qty}
                  onChange={(e) => setQty(parseFloat(e.target.value))}
                />
              </div>
              <div className="col-md-4">
                <Label for="price" className="mb-2">
                  Price
                </Label>
                <Input
                  type="number"
                  value={price}
                  disabled={orderTypes === "market" || orderTypes === "slm"}
                  id="price"
                  onChange={(e) => setPrice(parseFloat(e.target.value))}
                  step={0.05}
                />
              </div>
              <div className="col-md-4">
                <Label for="triggerPrice" className="mb-2">
                  Trigger Price
                </Label>
                <Input
                  type="number"
                  value={triggeredPrice}
                  disabled={orderTypes === "market" || orderTypes === "limit"}
                  id="triggerPrice"
                  onChange={(e) => {
                    setTriggeredPrice(parseFloat(e.target.value));
                  }}
                  step={0.05}
                />
              </div>
            </div>
            <div className="row mt-2">
              <div className="col-md-12">
                <FormGroup check className="d-flex justify-content-between">
                  <div>
                    <Input
                      type="radio"
                      name="stoploss"
                      id="market"
                      onChange={() => setOrderTypes("market")}
                      checked={orderTypes === "market"}
                    />
                    <Label for="market" check className="text-success">
                      Market
                    </Label>
                  </div>
                  <div>
                    <Input
                      type="radio"
                      name="stoploss"
                      id="limit"
                      onChange={() => setOrderTypes("limit")}
                      checked={orderTypes === "limit"}
                    />
                    <Label for="limit" check className="text-success">
                      Limit
                    </Label>
                  </div>
                  <div>
                    <Input
                      type="radio"
                      name="stoploss"
                      id="slm"
                      onChange={() => setOrderTypes("slm")}
                      checked={orderTypes === "slm"}
                    />
                    <Label for="slm" check className="text-success">
                      SL-M
                    </Label>
                  </div>
                </FormGroup>
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <span className="text-start" style={{ width: "50%" }}>
            Margin Required <i className="ri-information-line text-success"></i>{" "}
            &#8377;
            {orderTypes === "market" && (
              <span>{(qty * currentPrice) / leverage}</span>
            )}
            {orderTypes === "limit" && <span>{(qty * price) / leverage}</span>}
            {orderTypes === "slm" && (
              <span>{(qty * triggeredPrice) / leverage}</span>
            )}
          </span>
          <Button color="secondary" onClick={buy}>
            Buy
          </Button>
          <Button color="primary" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      {/* <ToastContainer limit={1}/> */}
    </>
  );
};

export default BuyModal;
