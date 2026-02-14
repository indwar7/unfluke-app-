import React from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { Row } from "reactstrap";
import Scanner from ".";

const ScannerFundamental = () => {
  document.title = "Unfluke | Fundamental Scanner";

  const auth = useSelector((store) => store.Login);
  const scannerState = useSelector((store) => store.Scanner);

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <React.Fragment>
      <div className="pt-4">
        <Scanner type={"fundamental"} />
      </div>
    </React.Fragment>
  );
};

export default ScannerFundamental;
