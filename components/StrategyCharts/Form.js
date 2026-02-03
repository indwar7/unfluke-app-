import React, { useEffect, useState } from "react";
import Select from "react-select";
import CustomSelect from "./CustomSelect";
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Container,
  Row,
  Col,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
} from "reactstrap";
import {
  getOptionChartResult,
  getStradleChartResult,
  getStraddleComboChartResult,
  getIronChartResult,
  getDoubleCalChartResult,
  getButterflyChartResult,
  getSpreadChartResult,
  getOptionsExpiries,
  getOptionsStrikes,
  getStradleStrikes,
} from "../../Unfluke_helpers/backend_helper";

import {
  StrategyChartInstruments,
  StrategyChartLoading,
  StrategyChartOptionForm,
  StrategyChartSelectedSymbol,
  StrategyChartStradleForm,
  StrategyChartForm,
} from "../../Unfluke_slices/thunks";
import { useDispatch } from "react-redux";
import { createSelector } from "reselect";
import { useSelector } from "react-redux";
import "./form.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChartForm = () => {
  // State to hold the currently selected chart type

  //chart Type ooptions
  const chartTypeOptions = [
    { label: "Options Chart", value: "Options Chart" },
    { label: "Straddle Chart", value: "Straddle Chart" },
    { label: "Spread Chart", value: "Spread Chart" },
    { label: "Butterfly Chart", value: "Butterfly Chart" },
    { label: "Iron Fly Chart", value: "Iron Fly Chart" },
    { label: "Double Calendar Chart", value: "Double Calendar Chart" },
    { label: "Straddle Combo Chart", value: "Straddle Combo Chart" },
  ];

  const isDarkMode = () =>
    typeof document !== "undefined" &&
    (document.documentElement.classList.contains("dark") ||
      document.body.classList.contains("dark"));

  const customClassNames = {
    option: (provided, state) => {
      const dark = isDarkMode();
      return {
        ...provided,
        backgroundColor: state.isSelected
          ? dark
            ? "red"
            : "#f3f4f6" // selected: dark gray or gray-100
          : state.isFocused
          ? dark
            ? "red"
            : "#f3f4f6" // focused: lighter gray
          : dark
          ? "#181a20"
          : "#fff", // default: dark or white
        color: dark ? "#e5e7eb" : "#3F5189",
        fontWeight: state.isSelected ? "bold" : "normal",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: state.isFocused || state.isSelected ? "0.5rem" : "0",
        margin: 0,
        transition: "background 0.15s, border-radius 0.15s",
      };
    },
    control: (provided) => {
      const dark = isDarkMode();
      return {
        ...provided,
        backgroundColor: dark ? "#181a20" : "#fff", // <-- fix here
        textAlign: "left",
        boxShadow: "none",
        border: dark ? "1px solid #374151" : "1px solid #0054d1",
        borderRadius: "0.475rem",
        color: dark ? "#e5e7eb" : "#3F5189",
      };
    },
    singleValue: (provided) => {
      const dark = isDarkMode();
      return {
        ...provided,
        color: dark ? "#e5e7eb" : "#3F5189",
        fontWeight: "bold",
      };
    },
    menu: (provided) => {
      const dark = isDarkMode();
      return {
        ...provided,
        backgroundColor: dark ? "#181a20" : "#fff", // <-- fix here
        zIndex: 9999,
      };
    },
    indicatorSeparator: () => ({
      display: "none",
    }),
    dropdownIndicator: (base) => {
      const dark = isDarkMode();
      return {
        ...base,
        color: dark ? "#e5e7eb" : "gray",
      };
    },
  };
  const dispatch = useDispatch();

  const data = createSelector(
    (state) => state.StrategyCharts,
    (data) => data.instrumentNames
  );

  const strategyData = createSelector(
    (state) => state.StrategyCharts,
    (data) => ({
      isLoading: data.loading,
      selectedSymbol: data.selectedSymbol,
      optionForm: data.optionForm,
      stradleForm: data.stradleForm,
      formData: data.formData,
    })
  );

  const strategyChartForm = useSelector(strategyData);

  const auth = createSelector(
    (state) => state.Login,
    (data) => data.user
  );

  const instrumentList = useSelector(data);
  const user = useSelector(auth);

  // random index generated for setting new and only one instrument as selectedSymbol for TradingView Chart
  const [index, setIndex] = useState(0);

  const [chartType, setChartType] = useState("Options Chart"); // Default chart type
  const [firstRender, setFirstRender] = useState(true);

  const [commonChartProps, setCommonChartprops] = useState({
    optionNames: [],
    callPutStrikes: [],
    callPutExpiries: [],
    callStrikes: [],
    putStrikes: [],
    callExpiries: [],
    putExpiries: [],
    types: ["CE - Call", "PE - Put"],
    selectedOptionName: "",
    selectedType: "CE - Call",
  });

  // Options chart
  const [optionChartProps, setOptionChartProps] = useState({
    strike: commonChartProps.selectedCallPutStrike,
    type: commonChartProps.selectedType,
    expiry: commonChartProps.selectedCallPutExpiry,
  });

  // Straddle chart
  const [stradleChartProps, setStradleChartProps] = useState({
    callStrike: commonChartProps.selectedCallStrike,
    putStrike: commonChartProps.selectedPutStrike,
    callLots: "1",
    putLots: "1",
    expiry: commonChartProps.selectedCallPutExpiry,
  });

  // Spread chart
  const [spreadChartProps, setSpreadChartProps] = useState({
    longStrike: commonChartProps.selectedCallPutStrike,
    shortStrike: commonChartProps.selectedCallPutStrike,
    longExpiry: commonChartProps.selectedCallPutExpiry,
    shortExpiry: commonChartProps.selectedCallPutExpiry,
    type: commonChartProps.selectedType,
    longLots: "1",
    shortLots: "-1",
  });

  // Butterfly chart
  const [butterflyChartProps, setButterflyChartProps] = useState({
    strikeOne: commonChartProps.selectedCallPutStrike,
    strikeTwo: commonChartProps.selectedCallPutStrike,
    strikeThree: commonChartProps.selectedCallPutStrike,
    expiry: commonChartProps.selectedCallPutExpiry,
    type: commonChartProps.selectedType,
    lotOne: "1",
    lotTwo: "-2",
    lotThree: "1",
  });

  // IronCondor chart
  const [ironCondorChartProps, setIronCondorChartProps] = useState({
    callStrikeOne: commonChartProps.selectedCallStrike,
    callStrikeTwo: commonChartProps.selectedCallStrike,
    putStrikeOne: commonChartProps.selectedPutStrike,
    putStrikeTwo: commonChartProps.selectedPutStrike,
    expiry: commonChartProps.selectedCallPutExpiry,
    callLotOne: "1",
    callLotTwo: "-1",
    putLotOne: "-1",
    putLotTwo: "1",
  });

  // DoubleCalendar chart
  const [doubleCalendarChartProps, setDoubleCalendarChartProps] = useState({
    longCallStrike: commonChartProps.selectedCallStrike,
    shortCallStrike: commonChartProps.selectedCallStrike,
    longPutStrike: commonChartProps.selectedPutStrike,
    shortPutStrike: commonChartProps.selectedPutStrike,
    shortExpiry: commonChartProps.selectedCallPutExpiry,
    longExpiry: commonChartProps.selectedCallPutExpiry,
    longCallLot: "1",
    shortCallLot: "-1",
    longPutLot: "1",
    shortPutLot: "-1",
  });

  // StraddleCombo chart
  const [straddleComboChartProps, setStraddleComboChartProps] = useState({
    callStrikeOne: commonChartProps.selectedCallStrike,
    callStrikeTwo: commonChartProps.selectedCallStrike,
    callStrikeThree: commonChartProps.selectedCallStrike,
    putStrikeOne: commonChartProps.selectedPutStrike,
    putStrikeTwo: commonChartProps.selectedPutStrike,
    putStrikeThree: commonChartProps.selectedPutStrike,
    expiry: commonChartProps.selectedCallPutExpiry,
  });

  const errornotify = (msg) =>
    toast(msg, {
      position: "top-center",
      hideProgressBar: true,
      closeOnClick: false,
      className: "bg-danger text-white",
    });

  const getOptionData = async (e) => {
    e.preventDefault();

    // window.sessionStorage.setItem("multiSymbol", commonChartProps.selectedOptionName);

    const baseParams = {
      chartType,
      optionName: commonChartProps.selectedOptionName,
      id: user._id,
    };

    const handleError = (errorMessage) => {
      errornotify(errorMessage);
      // dispatch(setLoading(false));
    };

    const handleSuccess = (data, additionalActions = () => {}) => {
      if (data.Error) {
        errornotify("No Data Found!");
        return false;
      }
      additionalActions(data);

      return true;
    };

    try {
      let response;
      switch (chartType) {
        case "Options Chart":
          response = await getOptionChartResult({
            ...baseParams,
            expiryDate: optionChartProps.expiry,
            optionType: commonChartProps.selectedType,
            strikePrice: optionChartProps.strike,
          });
          if (handleSuccess(response)) {
            setIndex((prevIndex) => (prevIndex + 1) % response.option.length);
            dispatch(StrategyChartSelectedSymbol(response.option));
            dispatch(
              StrategyChartForm({
                chartType: chartType,
                selectedSymbol: response.option,
                ...optionChartProps,
                // ce_pe = type
              })
            );
          }
          break;

        case "Straddle Chart":
          response = await getStradleChartResult({
            ...baseParams,
            expiryDate: stradleChartProps.expiry,
            callLots: stradleChartProps.callLots,
            putLots: stradleChartProps.putLots,
            callStrikePrice: stradleChartProps.callStrike,
            putStrikePrice: stradleChartProps.putStrike,
          });
          if (handleSuccess(response)) {
            setIndex((prevIndex) => (prevIndex + 1) % response.option.length);
            dispatch(StrategyChartSelectedSymbol(response.option[index]));
            dispatch(
              StrategyChartForm({
                chartType: chartType,
                selectedSymbol: response.option,
                ...stradleChartProps,
                // ce_pe = type
              })
            );
          }
          break;

        case "Spread Chart":
          if (
            spreadChartProps.shortExpiry === spreadChartProps.longExpiry &&
            spreadChartProps.shortStrike === spreadChartProps.longStrike
          ) {
            handleError("Please Select different Strikes or Expiries");
            return;
          }
          response = await getSpreadChartResult({
            ...baseParams,
            optionType: commonChartProps.selectedType,
            shortExpiryDate: spreadChartProps.shortExpiry,
            longExpiryDate: spreadChartProps.longExpiry,
            shortStrikePrice: spreadChartProps.shortStrike,
            longStrikePrice: spreadChartProps.longStrike,
            shortLots: spreadChartProps.shortLots,
            longLots: spreadChartProps.longLots,
          });
          if (handleSuccess(response)) {
            setIndex((prevIndex) => (prevIndex + 1) % response.option.length);
            dispatch(StrategyChartSelectedSymbol(response.option[index]));
            dispatch(
              StrategyChartForm({
                chartType: chartType,
                selectedSymbol: response.option,
                ...spreadChartProps,
                // ce_pe = type
              })
            );
          }
          break;

        case "Butterfly Chart":
          if (
            !butterflyChartProps.strikeOne ||
            !butterflyChartProps.strikeTwo ||
            !butterflyChartProps.strikeThree
          ) {
            handleError("Please Select Strikes");
            return;
          }
          response = await getButterflyChartResult({
            ...baseParams,
            expiryDate: butterflyChartProps.expiry,
            optionType: butterflyChartProps.type,
            s1: butterflyChartProps.strikeOne,
            s2: butterflyChartProps.strikeTwo,
            s3: butterflyChartProps.strikeThree,
          });
          if (handleSuccess(response)) {
            setIndex((prevIndex) => (prevIndex + 1) % response.option.length);
            dispatch(StrategyChartSelectedSymbol(response.option[index]));
            dispatch(
              StrategyChartForm({
                chartType: chartType,
                selectedSymbol: response.option,
                ...butterflyChartProps,
                // ce_pe = type
              })
            );
          }
          break;

        case "Iron Fly Chart":
          if (
            !ironCondorChartProps.callStrikeOne ||
            !ironCondorChartProps.callStrikeTwo ||
            !ironCondorChartProps.putStrikeOne ||
            !ironCondorChartProps.putStrikeTwo
          ) {
            handleError("Please Select Strikes");
            return;
          }
          response = await getIronChartResult({
            ...baseParams,
            expiryDate: ironCondorChartProps.expiry,
            s1: ironCondorChartProps.callStrikeOne,
            s2: ironCondorChartProps.callStrikeTwo,
            s3: ironCondorChartProps.putStrikeOne,
            s4: ironCondorChartProps.putStrikeTwo,
          });
          if (handleSuccess(response)) {
            setIndex((prevIndex) => (prevIndex + 1) % response.option.length);
            dispatch(StrategyChartSelectedSymbol(response.option[index]));
            dispatch(
              StrategyChartForm({
                chartType: chartType,
                selectedSymbol: response.option,
                ...ironCondorChartProps,
                // ce_pe = type
              })
            );
          }
          break;

        case "Double Calendar Chart":
          if (
            !doubleCalendarChartProps.longCallStrike ||
            !doubleCalendarChartProps.longPutStrike ||
            !doubleCalendarChartProps.shortCallLot ||
            !doubleCalendarChartProps.shortPutStrike
          ) {
            handleError("Please Select Strikes");
            return;
          }
          if (
            !doubleCalendarChartProps.shortExpiry ||
            !doubleCalendarChartProps.longExpiry
          ) {
            handleError("Please Select Expiries");
            return;
          }
          response = await getDoubleCalChartResult({
            ...baseParams,
            shortExpiryDate: doubleCalendarChartProps.shortExpiry,
            longExpiryDate: doubleCalendarChartProps.longExpiry,
            s1: doubleCalendarChartProps.shortCallStrike,
            s2: doubleCalendarChartProps.longCallStrike,
            s3: doubleCalendarChartProps.shortPutStrike,
            s4: doubleCalendarChartProps.longPutStrike,
          });
          if (handleSuccess(response)) {
            setIndex((prevIndex) => (prevIndex + 1) % response.option.length);
            dispatch(StrategyChartSelectedSymbol(response.option[index]));
            dispatch(
              StrategyChartForm({
                chartType: chartType,
                selectedSymbol: response.option,
                ...doubleCalendarChartProps,
                // ce_pe = type
              })
            );
          }
          break;

        case "Straddle Combo Chart":
          if (
            !straddleComboChartProps.callStrikeOne ||
            !straddleComboChartProps.callStrikeTwo ||
            !straddleComboChartProps.callStrikeThree ||
            !straddleComboChartProps.putStrikeOne ||
            !straddleComboChartProps.putStrikeTwo ||
            !straddleComboChartProps.putStrikeThree
          ) {
            handleError("Please Select Strikes");
            return;
          }
          response = await getStraddleComboChartResult({
            ...baseParams,
            expiryDate: straddleComboChartProps.expiry,
            s1: straddleComboChartProps.callStrikeOne, // ce
            s2: straddleComboChartProps.callStrikeTwo, // ce
            s3: straddleComboChartProps.callStrikeThree, // ce
            s4: straddleComboChartProps.putStrikeOne, // pe
            s5: straddleComboChartProps.putStrikeTwo, // pe
            s6: straddleComboChartProps.putStrikeThree, // pe
          });
          if (handleSuccess(response)) {
            setIndex((prevIndex) => (prevIndex + 1) % response.option.length);
            dispatch(StrategyChartSelectedSymbol(response.option[index]));
            dispatch(
              StrategyChartForm({
                chartType: chartType,
                selectedSymbol: response.option,
                ...straddleComboChartProps,
                // ce_pe = type
              })
            );
          }
          break;

        default:
          handleError("Invalid Chart Type");
          break;
      }
      console.log("response..................", response);
    } catch (error) {
      console.error(error);
      handleError("An error occurred while fetching the data.");
    }
  };

  function handleChange(setChartProps, key, value) {
    setChartProps((prev) => ({ ...prev, [key]: value }));
  }

  const updateChartProps = (chartPropsList, key, value) => {
    chartPropsList.forEach((chartProps) =>
      handleChange(chartProps, key, value)
    );
  };

  // Helper function to update strike prices for a given expiry date
  const updateStrikePricesForExpiry = async (
    expiryDate,
    optionName,
    optionType
  ) => {
    try {
      const strikeResponse = await getOptionsStrikes({
        params: { expiryDate, optionName, optionType, id: user._id },
      });

      const strikePrices = strikeResponse.strike_price;
      const firstStrikePrice = strikePrices[0];

      handleChange(setCommonChartprops, "callPutStrikes", strikePrices);
      handleChange(setOptionChartProps, "strike", firstStrikePrice);
      handleChange(setSpreadChartProps, "longStrike", firstStrikePrice);
      handleChange(setSpreadChartProps, "shortStrike", firstStrikePrice);
      handleChange(setButterflyChartProps, "strikeOne", firstStrikePrice);
      handleChange(setButterflyChartProps, "strikeTwo", firstStrikePrice);
      handleChange(setButterflyChartProps, "strikeThree", firstStrikePrice);
    } catch (error) {
      console.error("Error fetching strike prices:", error);
      throw error;
    }
  };

  const fetchOptionsData = async ({
    expiryDate,
    optionName,
    optionType,
    id,
  }) => {
    const params = { expiryDate, optionName, optionType, id };
    const strikeData = await getOptionsStrikes({ params });
    return strikeData.strike_price;
  };

  const fetchExpiryData = async (optionName, id) => {
    const expiryData = await getStradleStrikes({ params: { optionName, id } });
    return expiryData.expiry_date;
  };

  const optionChart = {
    getOptionsExpiryDate: async (optionName) => {
      console.log("TART GET", optionName);
      try {
        dispatch(StrategyChartLoading(true));
        handleChange(setCommonChartprops, "selectedOptionName", optionName);

        const id = user._id;
        const expiryResponse = await getOptionsExpiries({
          params: { optionName, optionType: commonChartProps.selectedType, id },
        });

        const expiryDates = expiryResponse.expiry_date;
        const firstExpiryDate = expiryDates[0];

        updateChartProps(
          [
            setOptionChartProps,
            setStradleChartProps,
            setButterflyChartProps,
            setIronCondorChartProps,
            setStraddleComboChartProps,
          ],
          "expiry",
          firstExpiryDate
        );
        updateChartProps(
          [setSpreadChartProps, setDoubleCalendarChartProps],
          "longExpiry",
          firstExpiryDate
        );
        updateChartProps(
          [setSpreadChartProps, setDoubleCalendarChartProps],
          "shortExpiry",
          firstExpiryDate
        );
        handleChange(setCommonChartprops, "callPutExpiries", expiryDates);

        await updateStrikePricesForExpiry(
          firstExpiryDate,
          optionName,
          commonChartProps.selectedType
        );
      } catch (error) {
        console.error("Error fetching expiry dates:", error);
      } finally {
        dispatch(StrategyChartLoading(false));
      }
    },

    updateStrikePrices: async (expiryDate) => {
      try {
        dispatch(StrategyChartLoading(true));
        updateChartProps(
          [
            setOptionChartProps,
            setStradleChartProps,
            setButterflyChartProps,
            setIronCondorChartProps,
            setStraddleComboChartProps,
          ],
          "expiry",
          expiryDate
        );
        updateChartProps(
          [setSpreadChartProps, setDoubleCalendarChartProps],
          "longExpiry",
          expiryDate
        );
        updateChartProps(
          [setSpreadChartProps, setDoubleCalendarChartProps],
          "shortExpiry",
          expiryDate
        );
        await updateStrikePricesForExpiry(
          expiryDate,
          commonChartProps.selectedOptionName,
          commonChartProps.selectedType
        );
      } catch (error) {
        console.error("Error updating strike prices:", error);
      } finally {
        dispatch(StrategyChartLoading(false));
      }
    },

    getOptionStrikePrice: async (newOptionType) => {
      try {
        updateChartProps(
          [setOptionChartProps, setSpreadChartProps, setButterflyChartProps],
          "type",
          newOptionType
        );
        dispatch(StrategyChartLoading(true));
        updateChartProps([setCommonChartprops], "selectedType", newOptionType);

        const id = user._id;
        const expiryResponse = await getOptionsExpiries({
          params: {
            optionName: commonChartProps.selectedOptionName,
            id,
            optionType: newOptionType,
          },
        });

        const expiryDates = expiryResponse.expiry_date;
        const firstExpiryDate = expiryDates[0];

        handleChange(setCommonChartprops, "callPutExpiries", expiryDates);

        updateChartProps(
          [
            setOptionChartProps,
            setStradleChartProps,
            setButterflyChartProps,
            setIronCondorChartProps,
            setStraddleComboChartProps,
          ],
          "expiry",
          firstExpiryDate
        );
        updateChartProps(
          [setSpreadChartProps, setDoubleCalendarChartProps],
          "longExpiry",
          firstExpiryDate
        );
        updateChartProps(
          [setSpreadChartProps, setDoubleCalendarChartProps],
          "shortExpiry",
          firstExpiryDate
        );

        await updateStrikePricesForExpiry(
          firstExpiryDate,
          commonChartProps.selectedOptionName,
          newOptionType
        );
      } catch (error) {
        console.error("Error fetching option strike prices:", error);
      } finally {
        dispatch(StrategyChartLoading(false));
      }
    },
  };

  const stradleChart = {
    getOptionsExpiryDate: async (e) => {
      try {
        const id = user._id;
        handleChange(setCommonChartprops, "selectedOptionName", e);
        dispatch(StrategyChartLoading(true));

        const expiryDates = await fetchExpiryData(e, id);
        const firstExpiryDate = expiryDates[0];

        updateChartProps(
          [
            setOptionChartProps,
            setStradleChartProps,
            setButterflyChartProps,
            setIronCondorChartProps,
            setStraddleComboChartProps,
          ],
          "expiry",
          firstExpiryDate
        );
        updateChartProps(
          [setSpreadChartProps, setDoubleCalendarChartProps],
          "longExpiry",
          firstExpiryDate
        );
        updateChartProps(
          [setSpreadChartProps, setDoubleCalendarChartProps],
          "shortExpiry",
          firstExpiryDate
        );
        handleChange(setCommonChartprops, "callPutExpiries", expiryDates);

        const callStrikePrices = await fetchOptionsData({
          expiryDate: firstExpiryDate,
          optionName: e,
          optionType: "CE - Call",
          id,
        });
        handleChange(setCommonChartprops, "callStrikes", callStrikePrices);
        handleChange(setStradleChartProps, "callStrike", callStrikePrices[0]);
        updateChartProps(
          [setIronCondorChartProps, setStraddleComboChartProps],
          "callStrikeOne",
          callStrikePrices[0]
        );
        updateChartProps(
          [setIronCondorChartProps, setStraddleComboChartProps],
          "callStrikeTwo",
          callStrikePrices[0]
        );
        handleChange(
          setStraddleComboChartProps,
          "callStrikeThree",
          callStrikePrices[0]
        );

        const putStrikePrices = await fetchOptionsData({
          expiryDate: firstExpiryDate,
          optionName: e,
          optionType: "PE - Put",
          id,
        });
        handleChange(setCommonChartprops, "putStrikes", putStrikePrices);
        handleChange(setStradleChartProps, "putStrike", putStrikePrices[0]);
        updateChartProps(
          [setIronCondorChartProps, setStraddleComboChartProps],
          "putStrikeOne",
          putStrikePrices[0]
        );
        updateChartProps(
          [setIronCondorChartProps, setStraddleComboChartProps],
          "putStrikeTwo",
          putStrikePrices[0]
        );
        handleChange(
          setStraddleComboChartProps,
          "putStrikeThree",
          putStrikePrices[0]
        );
      } finally {
        dispatch(StrategyChartLoading(false));
      }
    },

    updateStrikePrices: async (e) => {
      try {
        updateChartProps(
          [
            setStradleChartProps,
            setOptionChartProps,
            setButterflyChartProps,
            setIronCondorChartProps,
            setStraddleComboChartProps,
          ],
          "expiry",
          e
        );
        dispatch(StrategyChartLoading(true));

        const id = user._id;

        const callStrikePrices = await fetchOptionsData({
          expiryDate: e,
          optionName: commonChartProps.selectedOptionName,
          optionType: "CE - Call",
          id,
        });
        handleChange(setCommonChartprops, "callStrikes", callStrikePrices);
        handleChange(setStradleChartProps, "callStrike", callStrikePrices[0]);
        updateChartProps(
          [setIronCondorChartProps, setStraddleComboChartProps],
          "callStrikeOne",
          callStrikePrices[0]
        );
        updateChartProps(
          [setIronCondorChartProps, setStraddleComboChartProps],
          "callStrikeTwo",
          callStrikePrices[0]
        );
        handleChange(
          setStraddleComboChartProps,
          "callStrikeThree",
          callStrikePrices[0]
        );

        const putStrikePrices = await fetchOptionsData({
          expiryDate: e,
          optionName: commonChartProps.selectedOptionName,
          optionType: "PE - Put",
          id,
        });
        handleChange(setCommonChartprops, "putStrikes", putStrikePrices);
        handleChange(setStradleChartProps, "putStrike", putStrikePrices[0]);
        updateChartProps(
          [setIronCondorChartProps, setStraddleComboChartProps],
          "putStrikeOne",
          putStrikePrices[0]
        );
        updateChartProps(
          [setIronCondorChartProps, setStraddleComboChartProps],
          "putStrikeTwo",
          putStrikePrices[0]
        );
        handleChange(
          setStraddleComboChartProps,
          "putStrikeThree",
          putStrikePrices[0]
        );
      } finally {
        dispatch(StrategyChartLoading(false));
      }
    },
  };

  const spreadChart = {
    updateLongStrikePrices: async (e) => {
      try {
        handleChange(setSpreadChartProps, "longExpiry", e);
        dispatch(StrategyChartLoading(true));

        const strikePrices = await fetchOptionsData({
          expiryDate: e,
          optionName: commonChartProps.selectedOptionName,
          optionType: commonChartProps.selectedType,
          id: user._id,
        });
        handleChange(setCommonChartprops, "callPutStrikes", strikePrices);
        handleChange(setSpreadChartProps, "longStrike", strikePrices[0]);
      } finally {
        dispatch(StrategyChartLoading(false));
      }
    },

    updateShortStrikePrices: async (e) => {
      try {
        handleChange(setSpreadChartProps, "shortExpiry", e);
        dispatch(StrategyChartLoading(true));

        const strikePrices = await fetchOptionsData({
          expiryDate: e,
          optionName: commonChartProps.selectedOptionName,
          optionType: commonChartProps.selectedType,
          id: user._id,
        });
        handleChange(setCommonChartprops, "callPutStrikes", strikePrices);
        handleChange(setSpreadChartProps, "shortStrike", strikePrices[0]);
      } finally {
        dispatch(StrategyChartLoading(false));
      }
    },

    getOptionStrikeExpiry: async (e) => {
      try {
        updateChartProps(
          [setOptionChartProps, setSpreadChartProps, setButterflyChartProps],
          "type",
          e
        );
        dispatch(StrategyChartLoading(true));
        const id = user._id;

        const expiryData = await getOptionsExpiries({
          params: {
            optionName: commonChartProps.selectedOptionName,
            id,
            optionType: e,
          },
        });
        const expiryDates = expiryData.expiry_date;
        const firstExpiryDate = expiryDates[0];

        updateChartProps(
          [
            setOptionChartProps,
            setStradleChartProps,
            setButterflyChartProps,
            setIronCondorChartProps,
            setStraddleComboChartProps,
          ],
          "expiry",
          firstExpiryDate
        );
        updateChartProps(
          [setSpreadChartProps, setDoubleCalendarChartProps],
          "longExpiry",
          firstExpiryDate
        );
        updateChartProps(
          [setSpreadChartProps, setDoubleCalendarChartProps],
          "shortExpiry",
          firstExpiryDate
        );
        handleChange(setCommonChartprops, "callPutExpiries", expiryDates);

        const strikePrices = await fetchOptionsData({
          expiryDate,
          optionName: commonChartProps.selectedOptionName,
          optionType: e,
          id,
        });
        handleChange(setCommonChartprops, "callPutStrikes", strikePrices);
        handleChange(setSpreadChartProps, "longStrike", strikePrices[0]);
        handleChange(setSpreadChartProps, "shortStrike", strikePrices[0]);
        handleChange(setButterflyChartProps, "strikeOne", strikePrices[0]);
        handleChange(setButterflyChartProps, "strikeTwo", strikePrices[0]);
        handleChange(setButterflyChartProps, "strikeThree", strikePrices[0]);
      } finally {
        dispatch(StrategyChartLoading(false));
      }
    },
  };

  const doubleCalendar = {
    getOptionsExpiryDate: async (e) => {
      try {
        const id = user._id;
        handleChange(setCommonChartprops, "selectedOptionName", e);
        dispatch(StrategyChartLoading(true));

        const expiryDates = await fetchExpiryData(e, id);
        const firstExpiryDate = expiryDates[0];

        updateChartProps(
          [
            setOptionChartProps,
            setStradleChartProps,
            setButterflyChartProps,
            setIronCondorChartProps,
            setStraddleComboChartProps,
          ],
          "expiry",
          firstExpiryDate
        );
        updateChartProps(
          [setSpreadChartProps, setDoubleCalendarChartProps],
          "longExpiry",
          firstExpiryDate
        );
        updateChartProps(
          [setSpreadChartProps, setDoubleCalendarChartProps],
          "shortExpiry",
          firstExpiryDate
        );
        handleChange(setCommonChartprops, "callPutExpiries", expiryDates);

        const callStrikePrices = await fetchOptionsData({
          expiryDate: firstExpiryDate,
          optionName: e,
          optionType: "CE - Call",
          id,
        });

        handleChange(setCommonChartprops, "callStrikes", callStrikePrices);
        handleChange(
          setDoubleCalendarChartProps,
          "shortCallStrike",
          callStrikePrices[0]
        );
        handleChange(
          setDoubleCalendarChartProps,
          "longCallStrike",
          callStrikePrices[0]
        );

        const putStrikePrices = await fetchOptionsData({
          expiryDate: firstExpiryDate,
          optionName: e,
          optionType: "PE - Put",
          id,
        });
        handleChange(setCommonChartprops, "putStrikes", putStrikePrices);
        handleChange(
          setDoubleCalendarChartProps,
          "shortPutStrike",
          putStrikePrices[0]
        );
        handleChange(
          setDoubleCalendarChartProps,
          "longPutStrike",
          putStrikePrices[0]
        );
      } finally {
        dispatch(StrategyChartLoading(false));
      }
    },

    updateShortStrike: async (e) => {
      try {
        handleChange(setDoubleCalendarChartProps, "shortExpiry", e);
        dispatch(StrategyChartLoading(true));

        const callStrikePrices = await fetchOptionsData({
          expiryDate: e,
          optionName: commonChartProps.selectedOptionName,
          optionType: "CE - Call",
          id: user._id,
        });
        handleChange(setCommonChartprops, "callStrikes", callStrikePrices);
        handleChange(
          setDoubleCalendarChartProps,
          "shortCallStrike",
          callStrikePrices[0]
        );

        const putStrikePrices = await fetchOptionsData({
          expiryDate: e,
          optionName: commonChartProps.selectedOptionName,
          optionType: "PE - Put",
          id: user._id,
        });
        handleChange(setCommonChartprops, "putStrikes", putStrikePrices);
        handleChange(
          setDoubleCalendarChartProps,
          "shortPutStrike",
          putStrikePrices[0]
        );
      } finally {
        dispatch(StrategyChartLoading(false));
      }
    },

    updateLongStrike: async (e) => {
      try {
        handleChange(setDoubleCalendarChartProps, "longExpiry", e);
        dispatch(StrategyChartLoading(true));

        const callStrikePrices = await fetchOptionsData({
          expiryDate: e,
          optionName: commonChartProps.selectedOptionName,
          optionType: "CE - Call",
          id: user._id,
        });
        handleChange(setCommonChartprops, "callStrikes", callStrikePrices);
        handleChange(
          setDoubleCalendarChartProps,
          "longCallStrike",
          callStrikePrices[0]
        );

        const putStrikePrices = await fetchOptionsData({
          expiryDate: e,
          optionName: commonChartProps.selectedOptionName,
          optionType: "PE - Put",
          id: user._id,
        });
        handleChange(setCommonChartprops, "putStrikes", putStrikePrices);
        handleChange(
          setDoubleCalendarChartProps,
          "longPutStrike",
          putStrikePrices[0]
        );
      } finally {
        dispatch(StrategyChartLoading(false));
      }
    },
  };

  // Configuration for each chart type
  const fields = {
    "Options Chart": [
      {
        name: "Name",
        id: "symbol-name",
        type: "select",
        options: commonChartProps.optionNames,
        value: commonChartProps.selectedOptionName,
        onChange: (e) => optionChart.getOptionsExpiryDate(e.target.value),
      },
      {
        name: "Expiry",
        id: "symbol-expiry",
        type: "select",
        options: commonChartProps.callPutExpiries,
        value: optionChartProps.expiry,
        onChange: (e) => optionChart.updateStrikePrices(e.target.value),
      },
      {
        name: "Type",
        id: "symbole-type",
        type: "select",
        options: commonChartProps.types,
        value: optionChartProps.type,
        onChange: (e) => optionChart.getOptionStrikePrice(e.target.value),
      },
      {
        name: "StrikePrice",
        id: "symbol-strike",
        type: "select",
        options: commonChartProps.callPutStrikes,
        value: optionChartProps.strike,
        onChange: (e) =>
          handleChange(setOptionChartProps, "strike", e.target.value),
      },
    ],
    "Straddle Chart": [
      {
        name: "Name",
        id: "symbol-name",
        type: "select",
        options: commonChartProps.optionNames,
        value: commonChartProps.selectedOptionName,
        onChange: (e) => stradleChart.getOptionsExpiryDate(e.target.value),
      },
      {
        name: "Expiry",
        id: "symbol-expiry",
        type: "select",
        options: commonChartProps.callPutExpiries,
        value: stradleChartProps.expiry,
        onChange: (e) => stradleChart.updateStrikePrices(e.target.value),
      },
      {
        name: "Lot (Call)",
        id: "symbol-call-lots",
        type: "number",
        min: 1,
        value: stradleChartProps.callLots,
        onChange: (e) =>
          handleChange(setStradleChartProps, "callLots", e.target.value),
      },
      {
        name: "Call Strike",
        id: "symbol-call-strike",
        type: "select",
        options: commonChartProps.callStrikes,
        value: stradleChartProps.callStrike,
        onChange: (e) =>
          handleChange(setStradleChartProps, "callStrike", e.target.value),
      },
      {
        name: "Lot (Put)",
        id: "symbol-put-lots",
        type: "number",
        min: 1,
        value: stradleChartProps.putLots,
        onChange: (e) =>
          handleChange(setStradleChartProps, "putLots", e.target.value),
      },
      {
        name: "Put Strike",
        id: "symbol-put-strike",
        type: "select",
        options: commonChartProps.putStrikes,
        value: stradleChartProps.putStrike,
        onChange: (e) =>
          handleChange(setStradleChartProps, "putStrike", e.target.value),
      },
    ],
    "Spread Chart": [
      {
        name: "Name",
        id: "symbol-name",
        type: "select",
        options: commonChartProps.optionNames,
        value: commonChartProps.selectedOptionName,
        onChange: (e) => optionChart.getOptionsExpiryDate(e.target.value),
      },
      {
        name: "OptionType",
        id: "symbole-type",
        type: "select",
        options: commonChartProps.types,
        value: spreadChartProps.type,
        onChange: (e) => optionChart.getOptionStrikePrice(e.target.value),
      },
      {
        name: "Expiry(Long)",
        id: "symbol-expiry-long",
        type: "select",
        options: commonChartProps.callPutExpiries,
        value: spreadChartProps.longExpiry,
        onChange: (e) => spreadChart.updateLongStrikePrices(e.target.value),
      },
      {
        name: "Expiry(Short)",
        id: "symbol-expiry-short",
        type: "select",
        options: commonChartProps.callPutExpiries,
        value: spreadChartProps.shortExpiry,
        onChange: (e) => spreadChart.updateShortStrikePrices(e.target.value),
      },
      {
        name: "Lot (Long)",
        id: "symbol-long-lots",
        type: "number",
        min: 1,
        value: spreadChartProps.longLots,
        onChange: (e) =>
          handleChange(setSpreadChartProps, "longLots", e.target.value),
      },
      {
        name: "Lot (Short)",
        id: "symbol-short-lots",
        type: "number",
        max: -1,
        value: spreadChartProps.shortLots,
        onChange: (e) =>
          handleChange(setSpreadChartProps, "shortLots", e.target.value),
      },
      {
        name: "Long Strike",
        id: "symbol-long-strike",
        type: "select",
        options: commonChartProps.callPutStrikes,
        value: spreadChartProps.longStrike,
        onChange: (e) =>
          handleChange(setSpreadChartProps, "longStrike", e.target.value),
      },
      {
        name: "Short Strike",
        id: "symbol-short-strike",
        type: "select",
        options: commonChartProps.callPutStrikes,
        value: spreadChartProps.shortStrike,
        onChange: (e) =>
          handleChange(setSpreadChartProps, "shortStrike", e.target.value),
      },
    ],
    "Butterfly Chart": [
      {
        name: "Name",
        id: "symbol-name",
        type: "select",
        options: commonChartProps.optionNames,
        value: commonChartProps.selectedOptionName,
        onChange: (e) => optionChart.getOptionsExpiryDate(e.target.value),
      },
      {
        name: "Expiry",
        id: "symbol-expiry",
        type: "select",
        options: commonChartProps.callPutExpiries,
        value: butterflyChartProps.expiry,
        onChange: (e) => optionChart.updateStrikePrices(e.target.value),
      },
      {
        name: "StrikePrice 1",
        id: "strike-1",
        type: "select",
        options: commonChartProps.callPutStrikes,
        value: butterflyChartProps.strikeOne,
        onChange: (e) =>
          handleChange(setButterflyChartProps, "strikeOne", e.target.value),
      },
      {
        name: "Lots 1",
        id: "strike-1-lots",
        type: "number",
        min: 1,
        value: butterflyChartProps.lotOne,
        onChange: (e) =>
          handleChange(setButterflyChartProps, "lotOne", e.target.value),
      },
      {
        name: "StrikePrice 2",
        id: "strike-2",
        type: "select",
        options: commonChartProps.callPutStrikes,
        value: butterflyChartProps.strikeTwo,
        onChange: (e) =>
          handleChange(setButterflyChartProps, "strikeTwo", e.target.value),
      },
      {
        name: "Lots 2",
        id: "strike-2-lots",
        type: "number",
        max: -1,
        value: butterflyChartProps.lotTwo,
        onChange: (e) =>
          handleChange(setButterflyChartProps, "lotTwo", e.target.value),
      },
      {
        name: "StrikePrice 3",
        id: "strike-3",
        type: "select",
        options: commonChartProps.callPutStrikes,
        value: butterflyChartProps.strikeThree,
        onChange: (e) =>
          handleChange(setButterflyChartProps, "strikeThree", e.target.value),
      },
      {
        name: "Lots 3",
        id: "strike-3-lots",
        type: "number",
        min: 1,
        value: butterflyChartProps.lotThree,
        onChange: (e) =>
          handleChange(setButterflyChartProps, "lotThree", e.target.value),
      },
      {
        name: "Type",
        id: "symbole-type",
        type: "select",
        options: commonChartProps.types,
        value: butterflyChartProps.type,
        onChange: (e) => optionChart.getOptionStrikePrice(e.target.value),
      },
    ],
    "Iron Fly Chart": [
      {
        name: "Name",
        id: "symbol-name",
        type: "select",
        options: commonChartProps.optionNames,
        value: commonChartProps.selectedOptionName,
        onChange: (e) => stradleChart.getOptionsExpiryDate(e.target.value),
      },
      {
        name: "Expiry",
        id: "symbol-expiry",
        type: "select",
        options: commonChartProps.callPutExpiries,
        value: ironCondorChartProps.expiry,
        onChange: (e) => stradleChart.updateStrikePrices(e.target.value),
      },
      {
        name: "StrikePrice 1",
        id: "strike-1",
        type: "select",
        options: commonChartProps.callStrikes,
        value: ironCondorChartProps.callStrikeOne,
        onChange: (e) =>
          handleChange(
            setIronCondorChartProps,
            "callStrikeOne",
            e.target.value
          ),
      },
      {
        name: "Lots 1",
        id: "strike-1-lots",
        type: "number",
        min: 1,
        value: ironCondorChartProps.callLotOne,
        onChange: (e) =>
          handleChange(setIronCondorChartProps, "callLotOne", e.target.value),
      },
      {
        name: "StrikePrice 2",
        id: "strike-2",
        type: "select",
        options: commonChartProps.callStrikes,
        value: ironCondorChartProps.callStrikeTwo,
        onChange: (e) =>
          handleChange(
            setIronCondorChartProps,
            "callStrikeTwo",
            e.target.value
          ),
      },
      {
        name: "Lots 2",
        id: "strike-2-lots",
        type: "number",
        max: -1,
        value: ironCondorChartProps.callLotTwo,
        onChange: (e) =>
          handleChange(setIronCondorChartProps, "callLotTwo", e.target.value),
      },
      {
        name: "StrikePrice 3",
        id: "strike-3",
        type: "select",
        options: commonChartProps.putStrikes,
        value: ironCondorChartProps.putStrikeOne,
        onChange: (e) =>
          handleChange(setIronCondorChartProps, "putStrikeOne", e.target.value),
      },
      {
        name: "Lots 3",
        id: "strike-3-lots",
        type: "number",
        max: -1,
        value: ironCondorChartProps.putLotOne,
        onChange: (e) =>
          handleChange(setIronCondorChartProps, "putLotOne", e.target.value),
      },
      {
        name: "StrikePrice 4",
        id: "strike-4",
        type: "select",
        options: commonChartProps.putStrikes,
        value: ironCondorChartProps.putStrikeTwo,
        onChange: (e) =>
          handleChange(setIronCondorChartProps, "putStrikeTwo", e.target.value),
      },
      {
        name: "Lots 4",
        id: "strike-4-lots",
        type: "number",
        min: 1,
        value: ironCondorChartProps.putLotTwo,
        onChange: (e) =>
          handleChange(setIronCondorChartProps, "putLotTwo", e.target.value),
      },
    ],
    "Double Calendar Chart": [
      {
        name: "Name",
        id: "symbol-name",
        type: "select",
        options: commonChartProps.optionNames,
        value: commonChartProps.selectedOptionName,
        onChange: (e) => doubleCalendar.getOptionsExpiryDate(e.target.value),
      },
      { name: "-" },
      {
        name: "Short Expiry",
        id: "symbol-short-expiry",
        type: "select",
        options: commonChartProps.callPutExpiries,
        value: doubleCalendarChartProps.shortExpiry,
        onChange: (e) => doubleCalendar.updateShortStrike(e.target.value),
      },
      {
        name: "Long Expiry",
        id: "symbol-long-expiry",
        type: "select",
        options: commonChartProps.callPutExpiries,
        value: doubleCalendarChartProps.longExpiry,
        onChange: (e) => doubleCalendar.updateLongStrike(e.target.value),
      },
      {
        name: "Short CE Strike",
        id: "short-ce-strike",
        type: "select",
        options: commonChartProps.callStrikes,
        value: doubleCalendarChartProps.shortCallStrike,
        onChange: (e) =>
          handleChange(
            setDoubleCalendarChartProps,
            "shortCallStrike",
            e.target.value
          ),
      },
      {
        name: "Long CE Strike",
        id: "long-ce-strike",
        type: "select",
        options: commonChartProps.callStrikes,
        value: doubleCalendarChartProps.longCallStrike,
        onChange: (e) =>
          handleChange(
            setDoubleCalendarChartProps,
            "longCallStrike",
            e.target.value
          ),
      },
      {
        name: "Short PE Strike",
        id: "short-pe-strike",
        type: "select",
        options: commonChartProps.putStrikes,
        value: doubleCalendarChartProps.shortPutStrike,
        onChange: (e) =>
          handleChange(
            setDoubleCalendarChartProps,
            "shortPutStrike",
            e.target.value
          ),
      },
      {
        name: "Long PE Strike",
        id: "long-pe-strike",
        type: "select",
        options: commonChartProps.putStrikes,
        value: doubleCalendarChartProps.longPutStrike,
        onChange: (e) =>
          handleChange(
            setDoubleCalendarChartProps,
            "longPutStrike",
            e.target.value
          ),
      },
      {
        name: "Lot (CE Short)",
        id: "ce-short-lots",
        type: "number",
        max: -1,
        value: doubleCalendarChartProps.shortCallLot,
        onChange: (e) =>
          handleChange(
            setDoubleCalendarChartProps,
            "shortCallLot",
            e.target.value
          ),
      },
      {
        name: "Lot (CE Long)",
        id: "ce-long-lots",
        type: "number",
        min: 1,
        value: doubleCalendarChartProps.longCallLot,
        onChange: (e) =>
          handleChange(
            setDoubleCalendarChartProps,
            "longCallLot",
            e.target.value
          ),
      },
      {
        name: "Lot (PE Short)",
        id: "pe-short-lots",
        type: "number",
        max: -1,
        value: doubleCalendarChartProps.shortPutLot,
        onChange: (e) =>
          handleChange(
            setDoubleCalendarChartProps,
            "shortPutLot",
            e.target.value
          ),
      },
      {
        name: "Lot (PE Long)",
        id: "pe-long-lots",
        type: "number",
        min: 1,
        value: doubleCalendarChartProps.longPutLot,
        onChange: (e) =>
          handleChange(
            setDoubleCalendarChartProps,
            "longPutLot",
            e.target.value
          ),
      },
    ],
    "Straddle Combo Chart": [
      {
        name: "Name",
        id: "symbol-name",
        type: "select",
        options: commonChartProps.optionNames,
        value: commonChartProps.selectedOptionName,
        onChange: (e) => stradleChart.getOptionsExpiryDate(e.target.value),
      },
      {
        name: "Expiry",
        id: "symbol-expiry",
        type: "select",
        options: commonChartProps.callPutExpiries,
        value: straddleComboChartProps.expiry,
        onChange: (e) => stradleChart.updateStrikePrices(e.target.value),
      },
      {
        name: "CE StrikePrice 1",
        id: "strike-1",
        type: "select",
        options: commonChartProps.callStrikes,
        value: straddleComboChartProps.callStrikeOne,
        onChange: (e) =>
          handleChange(
            setStraddleComboChartProps,
            "callStrikeOne",
            e.target.value
          ),
      },
      {
        name: "CE StrikePrice 2",
        id: "strike-2",
        type: "select",
        options: commonChartProps.callStrikes,
        value: straddleComboChartProps.callStrikeTwo,
        onChange: (e) =>
          handleChange(
            setStraddleComboChartProps,
            "callStrikeTwo",
            e.target.value
          ),
      },
      {
        name: "CE StrikePrice 3",
        id: "strike-3",
        type: "select",
        options: commonChartProps.callStrikes,
        value: straddleComboChartProps.callStrikeThree,
        onChange: (e) =>
          handleChange(
            setStraddleComboChartProps,
            "callStrikeThree",
            e.target.value
          ),
      },
      {
        name: "PE StrikePrice 1",
        id: "strike-4",
        type: "select",
        options: commonChartProps.putStrikes,
        value: straddleComboChartProps.putStrikeOne,
        onChange: (e) =>
          handleChange(
            setStraddleComboChartProps,
            "putStrikeOne",
            e.target.value
          ),
      },
      {
        name: "PE StrikePrice 2",
        id: "strike-5",
        type: "select",
        options: commonChartProps.putStrikes,
        value: straddleComboChartProps.putStrikeTwo,
        onChange: (e) =>
          handleChange(
            setStraddleComboChartProps,
            "putStrikeTwo",
            e.target.value
          ),
      },
      {
        name: "PE StrikePrice 3",
        id: "strike-6",
        type: "select",
        options: commonChartProps.putStrikes,
        value: straddleComboChartProps.putStrikeThree,
        onChange: (e) =>
          handleChange(
            setStraddleComboChartProps,
            "putStrikeThree",
            e.target.value
          ),
      },
    ],
  };

  useEffect(() => {
    if (user._id && commonChartProps.selectedOptionName?.length > 0) {
      switch (chartType) {
        case "Options Chart":
          optionChart.getOptionsExpiryDate(commonChartProps.selectedOptionName);
          optionChart.getOptionStrikePrice(optionChartProps.type);
          break;

        case "Straddle Chart":
          stradleChart.getOptionsExpiryDate(
            commonChartProps.selectedOptionName
          );
          break;

        case "Spread Chart":
          optionChart.getOptionsExpiryDate(commonChartProps.selectedOptionName);
          break;

        case "Butterfly Chart":
          optionChart.getOptionsExpiryDate(commonChartProps.selectedOptionName);
          break;

        case "Iron Fly Chart":
          stradleChart.getOptionsExpiryDate(
            commonChartProps.selectedOptionName
          );
          break;

        case "Double Calendar Chart":
          doubleCalendar.getOptionsExpiryDate(
            commonChartProps.selectedOptionName
          );
          break;

        case "Straddle Combo Chart":
          stradleChart.getOptionsExpiryDate(
            commonChartProps.selectedOptionName
          );
          break;

        default:
          console.warn(
            `Unknown chart type: ${commonChartProps.selectedOptionName}`
          );
      }
    }
  }, [chartType, user, firstRender]);

  useEffect(() => {
    if (commonChartProps.optionNames.length === 0) {
      dispatch(StrategyChartInstruments());
    }
  }, []);

  useEffect(() => {
    handleChange(
      setCommonChartprops,
      "selectedOptionName",
      commonChartProps.optionNames[0]
    );
  }, [commonChartProps.optionNames]);

  useEffect(() => {
    if (firstRender && commonChartProps.selectedOptionName) {
      console.log("firstReander", commonChartProps.selectedOptionName);
      setFirstRender(!firstRender);
    }
  }, [commonChartProps.selectedOptionName]);

  useEffect(() => {
    handleChange(setCommonChartprops, "optionNames", instrumentList);
  }, [instrumentList]);

  // Event handler for changing chart type
  const handleChartTypeChange = (e) => {
    setChartType(e.target.value);
  };

  return (
    <Card
      className="card-light h-full strategyChart-form rounded-lg overflow-hidden bg-white dark:bg-gray-800"
      style={{ maxWidth: "500px" }}
    >
      <CardHeader className="border-bottom bg-white dark:bg-gray-800">
        <FormGroup className="flex flex-col">
          <Label for="chartType">
            <span className="text-body-emphasis">Chart Type</span>
          </Label>
          <CustomSelect
            options={chartTypeOptions}
            selected={chartType}
            onChange={(value) => setChartType(value)}
            placeholder="Select chart type"
            name="chartType"
          />
        </FormGroup>
      </CardHeader>
      <CardBody>
        <div className="d-flex align-items-center">
          <Form>
            <Row>
              {fields[chartType].map((field, index) => (
                <Col sm="6" key={index}>
                  {field.name == "-" ? (
                    <div></div>
                  ) : (
                    <FormGroup>
                      <Label for={field.id}>
                        <span className="text-body-emphasis">{field.name}</span>
                      </Label>
                      {field.type === "select" ? (
                        <CustomSelect
                          options={field.options.map((option) => ({
                            value: option,
                            label: option,
                          }))}
                          selected={field.value}
                          onChange={(value) =>
                            field.onChange({ target: { value } })
                          } // ✅ Create event object
                          name={field.name}
                        />
                      ) : (
                        <Input
                          className="rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 custom-scrollbar"
                          type={field.type}
                          name={field.name}
                          value={field.value}
                          min={field.min}
                          max={field.max}
                          onChange={field.onChange}
                        />
                      )}
                    </FormGroup>
                  )}
                </Col>
              ))}
            </Row>
          </Form>
        </div>
      </CardBody>
      <CardFooter className="border-top bg-white dark:bg-gray-800">
        <div className="text-center">
          {strategyChartForm.isLoading ? (
            <Button className="w-100 btn-load bg-blue-200 border-none dark:bg-blue-500  rounded-lg "> 
              <span className="d-flex align-items-center">
                <Spinner size="sm" type="grow" className="flex-shrink-0">
                  {" "}
                  Loading...{" "}
                </Spinner>
                <span className="flex-grow-1 ms-2">Loading...</span>
              </span>
            </Button>
          ) : (
            <Button
              type="submit"
              color="dark"
              className="w-100 btn-load rounded-lg bg-blue-600 border-none"
              outline
              onClick={getOptionData}
              style={{ color: "white" }}
            >
              <span className="d-flex align-items-center">
                <span className="flex-grow-1 ms-2">Submit</span>
              </span>
            </Button>
          )}
        </div>
      </CardFooter>
      <ToastContainer />
    </Card>
  );
};

export default ChartForm;
