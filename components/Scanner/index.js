import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import IndicatorList from "../../../Components/UnflukeMain/Scanner/IndicatorList";
import { DragDropContext } from "react-beautiful-dnd";
import ScannerExpression from "../../../Components/UnflukeMain/Scanner/ScannerExpression";
import ScannerFilters from "../../../Components/UnflukeMain/Scanner/ScannerFilters";
import ScannerMisc from "../../../Components/UnflukeMain/Scanner/ScannerMisc";
import axios from "axios";
import {
  advOperators,
  binaryOperators,
  brackets,
  conditionalOperators,
  darkErrorToastOps,
  elemsWithNoDialog,
  mathOperators,
  moreElements,
  segment1aList,
  successToastOps,
} from "../../../Components/UnflukeMain/Utils/common_vars";
import {
  handleChange,
  handleSetState,
  resetState,
} from "../../../slices/scanner/reducer";
import { ToastContainer, toast } from "react-toastify";
import IndicatorModal from "../../../Components/UnflukeMain/Scanner/ScannerExpression/Modals/IndicatorModal";
import NumberOpModal from "../../../Components/UnflukeMain/Scanner/ScannerExpression/Modals/NumberOpModal";
import LTPModal from "../../../Components/UnflukeMain/Scanner/ScannerExpression/Modals/LTPModal";
import ScannerResults from "../../../Components/UnflukeMain/Scanner/ScannerResults";
import { useLocation, useNavigate } from "react-router-dom";
import { deepCopy } from "../../../Components/UnflukeMain/BasicBacktester/StrategyLegs/utils";
import OffsetModal from "../../../Components/UnflukeMain/Scanner/ScannerMisc/Modals/OffsetModal";
import { io } from "socket.io-client";
import { backendSocket } from "../../../socket";
import { Parser } from "html-to-react";

if (
  typeof document !== "undefined" &&
  !document.getElementById("vz-light-custom-style")
) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "vz-light-custom-style";
  styleSheet.textContent = `
    html[data-bs-theme='light'] {
      --vz-light-custom: #F7FBFE;
       
    }
    html[data-bs-theme='dark'] {
      --vz-light-custom: var(--vz-light);
       
    }
  `;

  document.head.appendChild(styleSheet);
}

const Scanner = ({ type, shared }) => {
  document.title = "Scanners | Unfluke";

  const auth = useSelector((store) => store.Login);
  const scannerState = useSelector((store) => store.Scanner);

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [expression, setExpression] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [scannerIndicators, setScannerIndicators] = useState([]);
  const [indicatorModalOpen, setIndicatorModalOpen] = useState(false);
  const [numberModalOpen, setNumberModalOpen] = useState(false);
  const [ltpModalOpen, setLTPModalOpen] = useState(false);
  const [offsetModalOpen, setOffsetModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Loading results...");
  const [resultsMessage, setResultsMessage] = useState("");

  const [lastElem, setLastElem] = useState({});

  const [lastElemCoords, setLastElemCoords] = useState({
    x: 0,
    y: 0,
  });

  const [scannerResults, setScannerResults] = useState([]);

  const [link, setLink] = useState("");
  const [loading, isLoading] = useState(false);
  const [headers, setHeaders] = useState([]);
  const windowId = useRef(new Date().getMilliseconds());

  const [subUrl, setSubUrl] = useState("");
  const globalState = useSelector((store) => store.Layout);
  const htmlParser = new Parser();

  useEffect(() => {
    if (globalState && globalState.appType) {
      setSubUrl(globalState.appType);
    }
  }, [globalState]);

  /***** FUNCTIONS *****/

  const showErrorToast = (message) =>
    toast(message, {
      position: "top-center",
      hideProgressBar: true,
      closeOnClick: false,
      className: "bg-danger text-white",
    });

  const lhsRhsValid = (subEquation) => {
    const LHS = [];
    const RHS = [];
    let op = "";

    for (let item of subEquation) {
      const indicName = item.indicatorName;

      if (binaryOperators.indexOf(indicName) !== -1) return true;

      if (
        conditionalOperators.indexOf(indicName) !== -1 ||
        advOperators.indexOf(indicName) !== -1
      ) {
        if (op === "") {
          op = indicName;
        } else {
          return false;
        }
      } else {
        if (op !== "") {
          LHS.push(indicName);
        } else {
          RHS.push(indicName);
        }
      }
    }

    if (LHS.length > 0 && RHS.length > 0) {
      return true;
    } else {
      return false;
    }
  };

  const checkEquation = (equation) => {
    let pseudoEquation = "";
    let totalLength = 0;

    for (let subEquation of equation) {
      if (!lhsRhsValid(subEquation)) return false;

      for (let item of subEquation) {
        const indicName = item.indicatorName;

        if (
          mathOperators.indexOf(indicName) !== -1 ||
          conditionalOperators.indexOf(indicName) !== -1 ||
          brackets.indexOf(indicName) !== -1
        ) {
          if (indicName === "(") {
            pseudoEquation += " * " + indicName + " ";
          } else {
            pseudoEquation += " " + indicName + " ";
          }
        } else if (advOperators.indexOf(indicName) !== -1) {
          pseudoEquation += " > ";
        } else if (binaryOperators.indexOf(indicName) !== -1) {
          pseudoEquation += " || ";
        } else {
          pseudoEquation += " 1 ";
        }

        totalLength += 1;
      }
    }

    pseudoEquation = pseudoEquation.trim();

    if (totalLength <= 1) return false;

    try {
      let evalVal = eval(pseudoEquation) + "";
      if (evalVal !== "") {
        return true;
      }
    } catch (err) {
      return false;
    }

    return true;
  };

  const handleSaving = async () => {
    const scannerType = type === "scanner" ? "technical" : type === "fundamental" ? "fundamental" : "alert";

    if (checkEquation(expression)) {
      console.log("scanner name", scannerState.name);
      if (scannerState.name.trim() === "") {
        alert("Please enter the name of the scanner");
        return;
      }

      let date = new Date();
      let todaysDate =
        date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
      let timeAdded =
        date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

      if (location.state) {
        const scannerId = scannerState._id;

        //console.log(auth.user._id, scannerState.owner, auth.user._id === scannerState.owner)

        if (auth.user._id !== scannerState.owner) {
          if (
            window.confirm("This scanner will be saved as your own.") === true
          ) {
            handleAllChanges({
              target: {
                name: "categories",
                value: [],
              },
            });

            const tmp = deepCopy(scannerState);

            tmp.owner = auth.user._id;
            tmp.date = todaysDate;
            tmp.time = timeAdded;
            tmp.scannerType = scannerType;

            const res = await axios.post(
              `${process.env.REACT_APP_BACKEND_URL}/api/scanner/setScanner`,
              {
                tmp: tmp,
              },
            );

            if (res) {
              alert(res.msg);
              navigate("/scanner-home");
            }
          }
        } else {
          const res = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/api/scanner/updateScanner`,
            {
              scannerId,
              tmp: scannerState,
            },
          );

          if (res) {
            alert(res.msg);
          }
        }
      } else {
        const tmp = deepCopy(scannerState);
        delete tmp._id;

        tmp.date = todaysDate;
        tmp.time = timeAdded;
        tmp.scannerType = scannerType;

        const res = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/scanner/setScanner`,
          {
            tmp: tmp,
          },
        );

        if (res) {
          alert(res.msg);
        }
      }
    } else {
      alert("Please create a valid expression");
    }
  };

  async function handleShare() {
    const res = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/scanner/generateSharingUrl`,
      {
        scannerState,
      },
    );

    if (res) {
      const link = `${process.env.REACT_APP_PUBLIC_URL}/scanner-sharing?code=${res.sharingCode}&alert=false&type=${type}&market=in`;

      navigator.clipboard.writeText(link).then(
        function () {
          toast.success("Link copied to clipboard", successToastOps);
        },
        function (err) {
          toast.error("Could not copy Link", darkErrorToastOps);
        },
      );
    }
  }

  async function handleSubmit() {
    if (checkEquation(expression) && auth.user) {
      isLoading(true);

      const res = await axios
        .get(`${process.env.REACT_APP_BACKEND_URL}/api/stocks/`, {
          params: {
            ...scannerState,
            windowId: windowId.current,
            scanner_type: type,
            market: subUrl,
          },
        })
        .then((res) => {
          if (res) {
            setStatusMessage(res.message);
          }
        })
        .catch((err) => console.log(err));
    } else {
      alert("Please create a valid expression");
    }
  }

  function handleAllChanges(e) {
    const name = e.target.name;
    const value = e.target.value;

    if (name === "segment") {
      //integers
      dispatch(handleChange({ name, value: parseInt(value) }));
    } else if (name === "duplicate" || name === "showLatestRes") {
      //booleans
      dispatch(handleChange({ name, value: e.target.checked }));
    } else {
      dispatch(handleChange({ name, value }));
    }
  }

  const addElem = (e, x, y, indicatorResults) => {
    try {
      let parsedData;

      if (e.dataTransfer) {
        //if it has been dragged and dropped
        parsedData = JSON.parse(e.dataTransfer.getData("text"));
      } else {
        //if double clicked
        if (e.target.dataset.index) {
          parsedData = {
            index: e.target.dataset.index,
            indicatorName: e.target.dataset.indicatorname,
            displayName: e.target.dataset.displayname,
            settings: indicatorResults[e.target.dataset.index].settings
              ? indicatorResults[e.target.dataset.index].settings
              : [],
            ...indicatorResults[e.target.dataset.index],
          };
        } else {
          parsedData = {
            indicatorName: e.target.dataset.indicatorname,
            displayName: e.target.dataset.displayname,
          };
        }
      }

      const tmpExpr = JSON.parse(JSON.stringify(expression));
      const indicatorName = parsedData.indicatorName;

      setLastElem(parsedData);
      setLastElemCoords({
        x: x,
        y: y,
      });

      if (indicatorName === "number") {
        setNumberModalOpen(true);
      } else if (indicatorName === "ltp") {
        setLTPModalOpen(true);
      } else if (indicatorName === "offset") {
        setOffsetModalOpen(true);
      } else if (
        binaryOperators.indexOf(indicatorName) === -1 &&
        mathOperators.indexOf(indicatorName) === -1 &&
        conditionalOperators.indexOf(indicatorName) === -1 &&
        advOperators.indexOf(indicatorName) === -1 &&
        brackets.indexOf(indicatorName) === -1 &&
        elemsWithNoDialog.indexOf(indicatorName) === -1
      ) {
        setIndicatorModalOpen(true);
      }

      if (tmpExpr.length <= 0) {
        tmpExpr.push([parsedData]);
        setExpression(tmpExpr);
        return;
      }

      const xLength = tmpExpr[x].length;

      if (
        binaryOperators.indexOf(indicatorName) !== -1 ||
        binaryOperators.indexOf(tmpExpr[x][0].indicatorName) !== -1
      ) {
        //add binary operators in a separate row
        //if it's a binary operator row, add the new indicator in a separate row
        tmpExpr.splice(x + 1, 0, [parsedData]);
        setLastElemCoords({
          x: x + 1,
          y: 0,
        });
      } else {
        if (y === xLength) {
          tmpExpr[x].push(parsedData);
        } else {
          setLastElemCoords({
            x: x,
            y: y + 1,
          });

          tmpExpr[x].splice(y + 1, 0, parsedData);
        }
      }

      setExpression(tmpExpr);
    } catch (e) {
      console.log(e);
    }
  };

  const removeElem = (x, y) => {
    const tmpExpr = JSON.parse(JSON.stringify(expression));
    tmpExpr[x].splice(y, 1);

    if (tmpExpr[x].length <= 0) {
      tmpExpr.splice(x, 1);
    }

    setExpression(tmpExpr);
  };

  const editElem = (x, y) => {
    const tmpExpr = JSON.parse(JSON.stringify(expression));
    const elem = tmpExpr[x][y];
    const indicatorName = elem.indicatorName;

    setLastElem(elem);
    setLastElemCoords({
      x: x,
      y: y,
    });

    if (indicatorName === "number") {
      setNumberModalOpen(true);
    } else if (indicatorName === "ltp") {
      setLTPModalOpen(true);
    } else if (indicatorName === "offset") {
      setOffsetModalOpen(true);
    } else if (
      binaryOperators.indexOf(indicatorName) === -1 &&
      mathOperators.indexOf(indicatorName) === -1 &&
      conditionalOperators.indexOf(indicatorName) === -1 &&
      advOperators.indexOf(indicatorName) === -1 &&
      brackets.indexOf(indicatorName) === -1
    ) {
      setIndicatorModalOpen(true);
    }
  };

  const closeModal = (output) => {
    if (numberModalOpen) setNumberModalOpen(false);
    if (indicatorModalOpen) setIndicatorModalOpen(false);
    if (ltpModalOpen) setLTPModalOpen(false);
    if (offsetModalOpen) setOffsetModalOpen(false);

    const x = lastElemCoords.x;
    const y = lastElemCoords.y;

    const tmpExpr = JSON.parse(JSON.stringify(expression));
    tmpExpr[x][y] = output;

    setExpression(tmpExpr);
  };

  const addElemDblClick = (e, indicatorResults) => {
    if (expression.length <= 0) {
      addElem(e, 0, 0, indicatorResults);
    } else {
      addElem(
        e,
        expression.length - 1,
        expression[expression.length - 1].length,
        indicatorResults,
      );
    }
  };

  const handleSharedMouseClick = () => {
    if (shared) {
      if (auth && auth.user._id) {
        alert("To edit, you'll be redirected to the scanner page...");
        navigate(`/${subUrl}/scanner`, {
          state: scannerState,
        });
      } else {
        alert("Please login to edit/create a scanner");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    if (type === "fundamental") {
      axios
        .get(
          `${process.env.REACT_APP_BACKEND_URL}/api/scanner/getFundamentalIndicatorsNew`,
        )
        .then((res) => {
          if (res) {
            if (res["indicator_values"] && res["scanner_indicators"]) {
              const indic_values = Object.values(res["indicator_values"]);

              indic_values.forEach((element, i) => {
                indic_values[i].index = i;
              });

              setIndicators(indic_values);
              setScannerIndicators(res["scanner_indicators"]);
            }
          }
        })
        .catch((err) => console.log(err));
    } else {
      axios
        .get(
          `${process.env.REACT_APP_BACKEND_URL}/api/scanner/overlap-studies?type=${type}`,
        )
        .then((res) => {
          setIndicators(res);
        })
        .catch((err) => console.log(err));
    }
  }, []);

  useEffect(() => {
    dispatch(
      handleChange({
        name: "expression",
        value: expression,
      }),
    );
  }, [expression]);

  useEffect(() => {
    setExpression(scannerState.expression);

    //ONLY FOR DEBUGGING
    //console.log("scannerState", scannerState)
  }, [scannerState]);

  useEffect(() => {
    if (backendSocket) {
      const handleScannerResults = (data) => {
        if (data) {
          if (!shared) {
            if (
              data.userId === auth.user._id &&
              data.windowId == windowId.current
            ) {
              isLoading(false);

              if (data.results.length > 0) {
                setLink(data.link);
                setScannerResults(data.results);
                setResultsMessage(data.message);

                if (data.headers) {
                  setHeaders(data.headers);
                }
              } else {
                alert(data.message);
              }
            }
          } else {
            if (data.windowId == windowId.current && data.results.length > 0) {
              isLoading(false);

              setLink(data.link);
              setScannerResults(data.results);

              if (data.headers) {
                setHeaders(data.headers);
              }
            } else {
              alert(data.message);
            }
          }
        }
      };

      backendSocket.on("scanner-results", handleScannerResults);

      return () => {
        backendSocket.off("scanner-results", handleScannerResults);
      };
    }
  }, [auth.user._id]);

  useEffect(() => {
    if (location.state) {
      const scannerDetails = location.state;
      const newState = {};

      for (let prop in scannerDetails) {
        if (scannerState[prop] !== undefined) {
          if (prop === "segment") {
            newState[prop] = parseInt(scannerDetails[prop]);
          } else {
            newState[prop] = scannerDetails[prop];
          }
        }
      }

      dispatch(handleSetState(newState));
    } else {
      dispatch(resetState());
    }

    if (auth.user) {
      if (!location.state) {
        dispatch(
          handleChange({
            name: "owner",
            value: auth.user._id,
          }),
        );
      }

      dispatch(
        handleChange({
          name: "user",
          value: auth.user,
        }),
      );

      if (type === "alerts") {
        dispatch(
          handleChange({
            name: "alerts",
            value: true,
          }),
        );

        if (!location.state) {
          dispatch(
            handleChange({
              name: "segment1a",
              value: "360ONE",
            }),
          );
        }
      }

      if (location.search && subUrl) {
        //this scanner is a shared scanner
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const alert = params.get("alert");
        const type = params.get("type");

        if (code && alert && type) {
          axios
            .post(
              `${process.env.REACT_APP_BACKEND_URL}/api/scanner/getScannerBySharingCode`,
              {
                sharingCode: code,
              },
            )
            .then((res) => {
              if (shared) {
                if (res.scanner) {
                  const scannerDetails = res.scanner;
                  const newState = {};

                  for (let prop in scannerDetails) {
                    if (scannerState[prop] !== undefined) {
                      if (prop === "segment") {
                        newState[prop] = parseInt(scannerDetails[prop]);
                      } else {
                        newState[prop] = scannerDetails[prop];
                      }
                    }
                  }

                  dispatch(handleSetState(newState));
                }
              }
            });
        }
      }
    }
  }, [location, auth, subUrl]);

  return (
    <React.Fragment>
      <ToastContainer />
      {(type === "scanner" || type === "alerts") && !shared && (
        <div style={{ marginTop: 70 }}></div>
      )}
      <div className=" bg-background-light pt-8 mt-9 mb-8  dark:bg-gray-900 transition-colors duration-200 px-4 md:px-8 lg:px-16 xl:px-32">
        <div>
          {!shared && type !== "fundamental" && (
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {type === "scanner" ? "SCANNER HOME" : "ALERTS HOME"}
                  </h1>
                </div>
              </div>
            </div>
          )}

          {!shared && type == "fundamental" && (
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {type === "fundamental" ? "Fundamental Scanner" : "Alerts"}
                  </h1>
                </div>
              </div>
            </div>
          )}

          {
            <div
              onMouseDown={handleSharedMouseClick}
              className="grid grid-cols-1 gap-4"
            >
              <div>
                <Label
                  htmlFor="scannerName"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {type !== "alerts" ? "Scanner Name" : "Alert Name"}
                </Label>
                <textarea
                  id="scannerName"
                  placeholder="Enter scanner name"
                  className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                  name="name"
                  value={scannerState.name}
                  onChange={handleAllChanges}
                />
              </div>

              <div>
                <Label
                  htmlFor="scannerDescription"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {type !== "alerts"
                    ? "Scanner Description"
                    : "Alert Description"}
                </Label>
                <textarea
                  id="scannerDescription"
                  placeholder="Enter scanner description"
                  name="description"
                  value={scannerState.description}
                  onChange={handleAllChanges}
                  rows={4}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white resize-none"
                />
              </div>
            </div>
          }

          {/* indicator , filter and misc */}
          <Row className="mt-3 mb-3" onMouseDown={handleSharedMouseClick}>
            {type !== "fundamental" ? (
              <>
                <Col md={3} className="mb-3">
                  <IndicatorList
                    indicators={indicators}
                    addElemDblClick={addElemDblClick}
                  />
                </Col>
                <Col md={5} className="mb-3">
                  <ScannerFilters
                    scannerState={scannerState}
                    handleChange={handleAllChanges}
                    type={type}
                  />
                </Col>
                <Col md={4} className="mb-3">
                  <ScannerMisc addElemDblClick={addElemDblClick} />
                </Col>
              </>
            ) : (
              <>
                <Col md={3} className="mb-3">
                  <IndicatorList
                    indicators={indicators}
                    // ✅ FIXED: quarterly only for fundamental
                    addElemDblClick={addElemDblClick}
                    type={type}
                  />
                </Col>
                <Col md={5} className="mb-3">
                  <IndicatorList
                    indicators={scannerIndicators}
                    addElemDblClick={addElemDblClick}
                  />
                </Col>
                <Col md={4} className="mb-3">
                  <ScannerMisc addElemDblClick={addElemDblClick} type={type} />
                </Col>
              </>
            )}
          </Row>

          <div className="bg-white dark:bg-gray-800 rounded-lg">
            {/* Expression */}
            <Row onMouseDown={handleSharedMouseClick}>
              <Col>
                <ScannerExpression
                  expression={expression}
                  addElem={addElem}
                  removeElem={removeElem}
                  editElem={editElem}
                />
              </Col>
            </Row>

            {/* Buttons */}
            <Row className="px-6 py-3 mx-0  rounded-lg bg-white dark:bg-gray-800">
              {!shared && (
                <Col>
                  <Button
                    onClick={handleSaving}
                    disabled={loading}
                    className=" bg-white border-gray-400 dark:border-gray-600 text-black dark:text-white dark:bg-gray-800"
                  >
                    Save
                  </Button>
                </Col>
              )}
              {(type === "scanner" || type === "alerts") &&
                auth &&
                scannerState &&
                auth.user._id !== scannerState.owner &&
                !shared && (
                  <Col>
                    <Button
                      onClick={handleShare}
                      disabled={loading}
                      className="bg-white border-gray-200 dark:border-gray-600 text-black dark:text-white dark:bg-gray-800"
                    >
                      Share
                    </Button>
                  </Col>
                )}
              <Col>
                {(type === "scanner" || type === "fundamental") && (
                  <div className="d-flex justify-content-end">
                    <Button
                      className="bg-blue-600 py-2 px-3 rounded-md hover:bg-blue-700 text-white border-0"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </Col>
            </Row>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <Row>
              <Col>
                <Card className="card-success">
                  <CardBody>
                    <div className="hstack">
                      <Spinner />
                      <span className="ms-3" style={{ fontSize: 15 }}>
                        {statusMessage}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )}

          {/* Results */}
          <Row>
            <Col>
              {scannerResults.length > 0 && (
                <>
                  {resultsMessage && (
                    <Card className="card-danger">
                      <CardBody>
                        <div className="hstack">
                          <span style={{ fontSize: 15 }}>
                            {htmlParser.parse(resultsMessage)}
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  )}
                  <p>
                    The results are based on a {scannerState.timeframe}{" "}
                    timeframe.
                  </p>
                  <ScannerResults
                    results={scannerResults}
                    downloadUrl={link}
                    type={type}
                    headers={headers}
                  />
                </>
              )}
            </Col>
          </Row>

          {/* Modals */}
          {indicatorModalOpen && (
            <IndicatorModal
              closeModal={closeModal}
              settings={lastElem}
              type={type}
              stock_symbol={scannerState.segment || "Unknown"}
            />
          )}
          {numberModalOpen && (
            <NumberOpModal closeModal={closeModal} settings={lastElem} />
          )}
          {ltpModalOpen && (
            <LTPModal closeModal={closeModal} settings={lastElem} />
          )}
          {offsetModalOpen && (
            <OffsetModal
              closeModal={closeModal}
              settings={lastElem}
              indicators={indicators}
            />
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Scanner;
