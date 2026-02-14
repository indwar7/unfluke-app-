import React from "react";
import { Card,CardBody,CardHeader } from "reactstrap";

const Info = () => {
    return (
        <React.Fragment>
            <div className="col-lg-12 ">
                < Card >
                <CardHeader className="d-md-flex justify-content-center border-0">
                  <div className="d-md-flex align-items-center">
                    <h5 className="card-title mb-3 mb-md-0 flex-grow-1">
                      Earn on Unfluke
                    </h5>
               
                  </div>
                </CardHeader>
                <CardBody>

                    <p className="mb-6">
                        <b>Refer and Earn:</b> Users can profit from the Unfluke website by participating in its referral program. By sharing their unique referral links with others, users can encourage new sign-ups to the platform. Whenever someone opens an Unfluke account using a user's referral link and subsequently pays for any subscription, the referring user receives a referral bonus. This referral bonus serves as a form of passive income for users, incentivizing them to promote the Unfluke platform and expand its user base. As users refer more individuals who become paying subscribers, they can accumulate referral bonuses, contributing to their overall profits from using the Unfluke website.
                        <br /><br />
                        <b>Share Strategy on Unfluke:</b> Users can utilize the basic and advanced backtester tools provided by Unfluke to create effective trading strategies. Once users have developed successful strategies, they have the option to monetize them by offering to share the rules of these strategies for a fee. Users can set the fees they wish to charge for sharing their strategies with other platform users.
                        <br /><br />
                        When a user's strategy is purchased by another user on Unfluke, the platform deducts applicable taxes (like GST) and calculates the net revenue. The user who created the strategy receives 75% of this net revenue as their share. For example, if a user offers a strategy for Rs 500, and after tax deductions, the net revenue is Rs 423, the user receives Rs 317 (75% of Rs 423) as their share.
                        <br /><br />
                        By sharing their successful trading strategies on Unfluke, users can generate additional income streams while also contributing to the community by providing valuable insights and techniques to other traders. This feature incentivizes users to create high-quality strategies and fosters a collaborative environment for knowledge sharing and financial success.
                    </p>
                </CardBody>
                </Card >
            </div >
        </React.Fragment>
    )
}

export default Info