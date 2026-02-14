import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { Trash2, TrendingUp } from 'lucide-react-native';


import { CustomSelect } from "../../components/OptionSimulator/Selects";

import {
  getHistoricalWatchlist,
  deleteHistoricalWatchlist,
  postHistoricalWatchlist,
  updateHistoricalWatchlist,
  postHistoricalOrders,
  getOptionNames,
  getOptionsExpiries,
  getOptionsStrikes,
  getWatchlistExpiryDate,
  getWatchlistOptionsResults,
  getWatchlistSearchResults,
  getWatchlistStrikePrices,
  postHistoricalFeed,
} from "../../Unfluke_helpers/backend_helper";
import { createSelector } from "reselect";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import BuyModel from "./BuyModel";
import SellModel from "./SellModel";
import {
  UserHistoricalWatchlist,
  UserHistoricalSelectedSymbol,
} from "../../redux/Unfluke_slices/thunks";
import { setHistoricalWatchlist } from "../../redux/Unfluke_slices/historicalTrading/reducer";

const Watchlist = () => {
  const dispatch = useDispatch();

  const [tooltipOpen, setTooltipOpen] = useState({});
  const [activeCardIndex, setActiveCardIndex] = useState(null);
  const [search, setSearch] = useState("");
  const [colSize, setColSize] = useState("col-4");
  const [selectMarket, setSelectMarket] = useState("Equity");
  const [buyModelOpen, setBuyModelOpen] = useState(false);
  const [sellModelOpen, setSellModelOpen] = useState(false);
  const [marketList, setMarketList] = useState([]);
  const [tradeWatch, setTradeWatch] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [buyInstrument, setBuyInstrument] = useState({
    instrument_token: 0,
    market: "",
    name: "",
    exchange: "",
    price: "",
    currentDate: "",
  });
  const [sellInstrument, setSellInstrument] = useState({
    instrument_token: 0,
    market: "",
    name: "",
    exchange: "",
    price: "",
    currentDate: "",
  });
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [itemOne, setItemOne] = useState(currentDate);
  const [itemTwo, setItemTwo] = useState(currentTime);
  const [loader, setLoader] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [optionNames, setOptionNames] = useState([]);
  const [optionName, setOptionName] = useState("");
  const [expiryDates, setExpiryDates] = useState([]);
  const [expiryDate, setExpiryDate] = useState("");
  const [optionType, setOptionType] = useState("");
  const [strikePrices, setStrikePrices] = useState([]);
  const [strikePrice, setStrikePrice] = useState();
  const [priceData, setPriceData] = useState({});

  const prevDateTime = useRef("");

  const auth = createSelector(
    (state) => state.Login,
    (auth) => auth.user,
  );

  const watchlistData = createSelector(
    (state) => state.Historical,
    (data) => data.historicalWatchlist,
  );
  const dateTime = createSelector(
    (state) => state.Historical,
    (data) => data.historicalDateTime,
  );

  const currentDateTime = useSelector(dateTime);
  const watchlist = useSelector(watchlistData);
  const user = useSelector(auth);

  useEffect(() => {
    const val = watchlist?.map((item) => {
      return {
        ...item,
        feed: 0,
        change: 0,
      };
    });
    setTradeWatch(val);
  }, [watchlist]);

  useEffect(() => {
    getCurrentFeed();
  }, [tradeWatch]);

  useEffect(() => {
    selectedSymbol !== "" &&
      dispatch(UserHistoricalSelectedSymbol(selectedSymbol));
  }, [selectedSymbol]);

  useEffect(() => {
    console.log("cur", currentDateTime);
  }, [selectMarket, currentDateTime]);

  useEffect(() => {
    console.log(
      "MARKET",
      selectMarket,
      typeof currentDateTime,
      currentDateTime,
    );

    if (
      currentDateTime &&
      currentDateTime !== "" &&
      currentDateTime !== "Invalid Date"
    ) {
      const date = new Date(currentDateTime);

      if (!isNaN(date.getTime())) {
        getOptionNames({
          selectedDate: date.toJSON().split("T")[0],
        }).then((data) => {
          setOptionNames([
            {
              options: data.map((x) => {
                return { label: x, value: x };
              }),
            },
          ]);
        });
      } else {
        console.error("Invalid Date:", currentDateTime);
      }
    }
  }, [currentDateTime]);

  const market = [
    {
      options: [
        { label: "Equity", value: "Equity" },
        { label: "Future", value: "Future" },
        { label: "Option", value: "Option" },
        { label: "Index", value: "Index" },
      ],
    },
  ];

  const optionTypes = [
    {
      options: [
        { label: "CE - Call", value: "CE - Call" },
        { label: "PE - Put", value: "PE - Put" },
      ],
    },
  ];

  const getSearchResults = (e) => {
    setSearch(e);
    if (!e) {
      return setMarketList([]);
    }
    e.length > 1 &&
      getWatchlistSearchResults({
        market: selectMarket.toLowerCase(),
        search: e,
        date: new Date(currentDateTime).toJSON().split("T")[0],
      }).then((data) => {
        if (!data.length) {
          setMarketList([
            {
              _id: "6487edc360f836ebbf7a4023",
              type: "equity",
              equity: "NSE:Symbol Unavailable",
              tablename: "eq_aplltd_1min",
              database: "unfluke_equity",
              leverage: 1,
              multiple: 1,
              instrument_token: "uf-a-1648650242937",
            },
          ]);
          return [];
        }
        const reduceRedundancyData = data.filter((listItem) => {
          if (
            !tradeWatch.some(
              (trade) => trade.instrument_token == listItem.instrument_token,
            )
          )
            return listItem;
        });
        setMarketList(reduceRedundancyData);
      });
  };

  const addToWatchList = (marketListItem) => {
    if (
      marketListItem.type == "equity" &&
      marketListItem.equity.split(":")[1] == "Symbol Unavailable"
    ) {
      return;
    }
    const data = {
      userID: user._id,
      instrument_token: marketListItem.instrument_token,
      type: marketListItem.type,
      date: currentDateTime,
    };
    if (selectMarket == "Option") {
      data["name"] = marketListItem.option.split(":")[1];
      data["exch"] = marketListItem.option.split(":")[0];
      data["expiry"] = expiryDate;
    } else {
      data["name"] = marketListItem[marketListItem.type].split(":")[1];
      data["exch"] = marketListItem[marketListItem.type].split(":")[0];
    }
    postHistoricalWatchlist(data).then((data) => {
      if (data) {
        const val = data.watchlist.map((item) => {
          return {
            ...item,
            feed: 0,
            change: 0,
          };
        });
        setTradeWatch(val);
      }
    });
  };

  const deleteTrade = (instrument_token) => {
    const data = {
      userID: user._id,
      instrument_token: instrument_token,
    };
    deleteHistoricalWatchlist({ data }).then((data) => {
      setTradeWatch(data.watchlist);
      setActiveCardIndex(null); // Hide action buttons after delete
    });
  };

  const getCurrentFeed = async () => {
    if (!currentDateTime || loader) return;
    if (prevDateTime.current == "")
      prevDateTime.current = new Date(currentDateTime);
    var time = new Date(currentDateTime);
    if (time.getFullYear() < parseInt(user.charts_fno)) {
      Alert.alert("Error", "Please subscribe to a plan to access more historical data");
      return;
    }
    if (time.getTime() > new Date().getTime()) {
      Alert.alert("Error", "Please select a valid time");
      return;
    }
    if (time.getTime() < prevDateTime.current.getTime())
      prevDateTime.current = time;
    setLoader(true);
    await postHistoricalFeed({
      time,
      userID: user._id,
      currentDate: new Date(currentDateTime).toJSON().split("T")[0],
      prevDateTime: prevDateTime.current,
    }).then((data) => {
      console.log("current feed==>", data);
      setLoader(false);
      
      // Update price data state instead of manipulating DOM
      const newPriceData = {};
      data.forEach((feed) => {
        if (feed) {
          if (feed.open === "EXP" || feed.open === "NA") {
            newPriceData[feed.instrument_token] = feed.open;
          } else {
            newPriceData[feed.instrument_token] = parseFloat(feed.open).toFixed(2);
          }
        }
      });
      setPriceData(newPriceData);
    });
  };

  const getOptionsExpiryDate = (e) => {
    setOptionName(e);
    getOptionsExpiries({
      params: {
        optionName: e,
        id: user._id,
        optionType: "CE - Call",
      },
    }).then((data) => {
      setExpiryDates([
        {
          options: data.expiry_date.map((x) => {
            return { label: x, value: x };
          }),
        },
      ]);
    });
  };

  const getOptionStrikePrice = (e) => {
    setOptionType(e);
    getOptionsStrikes({
      params: {
        expiryDate: expiryDate,
        optionName: optionName,
        optionType: e,
        id: user._id,
      },
    }).then((data) => {
      setStrikePrices([
        {
          options: data.strike_price
            .sort((a, b) => a - b)
            .map((x) => {
              return { label: x, value: x };
            }),
        },
      ]);
    });
  };

  const getOptionData = (e) => {
    setStrikePrice(e);
    console.table([expiryDate, optionName, optionType, e]);
    getWatchlistOptionsResults({
      expiryDate: expiryDate,
      optionName: optionName,
      optionType: optionType,
      strikePrice: e,
      date: new Date(currentDateTime).toJSON().split("T")[0],
    }).then((data) => {
      setStrikePrice(0);
      const reduceRedundancyData = data.filter((listItem) => {
        if (
          !tradeWatch.some(
            (trade) => trade.instrument_token == listItem.instrument_token,
          )
        )
          return listItem;
      });
      setMarketList(reduceRedundancyData);
    });
  };

  useEffect(() => {
    user._id && !loader && getCurrentFeed();
  }, [tradeWatch, currentDateTime]);

  const handleCardPress = (index) => {
    if (activeCardIndex === index) {
      setActiveCardIndex(null); // Hide if already active
    } else {
      setActiveCardIndex(index); // Show for this card
    }
  };

  const handleChartPress = (tradeWatchItem) => {
    setIsDisabled(true);
    if (!isDisabled) {
      setSelectedSymbol(`${tradeWatchItem.exch}:${tradeWatchItem.name}`);
    }
    setActiveCardIndex(null); // Hide action buttons
    setTimeout(() => {
      setIsDisabled(false);
    }, 2000);
  };

  const handleDeletePress = (instrument_token) => {
    deleteTrade(instrument_token);
    // Action buttons will be hidden in deleteTrade function
  };

  console.log(tradeWatch[0], "nifty");

  return (
    <View style={styles.container}>
      <View style={styles.marketSelectWrapper}>
        <CustomSelect
          placeholder="Select"
          name="choices-instrument-default"
          options={market[0]?.options || []}
          selected={selectMarket}
          onChange={setSelectMarket}
          disableTyping={true}
        />
        
        {selectMarket !== "Option" && (
          <View style={styles.searchInputWrapper}>
            <TextInput
              style={styles.searchInput}
              value={search}
              placeholder="Search e.g. Nifty, Infy"
              onChangeText={getSearchResults}
              placeholderTextColor="#9CA3AF"
            />
          </View>
        )}
      </View>

      {loader && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
        </View>
      )}

      {selectMarket === "Option" ? (
        optionNames.length > 0 ? (
          <>
            <View style={styles.optionsContainer}>
              <View style={styles.selectItem}>
                <Text style={styles.selectLabel}>Name</Text>
                <CustomSelect
                  placeholder="Select Name"
                  options={optionNames[0]?.options || []}
                  selected={optionName}
                  onChange={(val) => {
                    setOptionName(val);
                    getOptionsExpiryDate(val);
                  }}
                />
              </View>

              <View style={styles.selectItem}>
                <Text style={styles.selectLabel}>Expiry</Text>
                <CustomSelect
                  placeholder="Select Expiry"
                  options={expiryDates[0]?.options || []}
                  selected={expiryDate}
                  onChange={setExpiryDate}
                />
              </View>

              <View style={styles.selectItem}>
                <Text style={styles.selectLabel}>Type</Text>
                <CustomSelect
                  placeholder="Select Type"
                  options={optionTypes[0]?.options || []}
                  selected={optionType}
                  onChange={(val) => {
                    setOptionType(val);
                    getOptionStrikePrice(val);
                  }}
                />
              </View>

              {strikePrices && strikePrices.length > 0 && (
                <View style={styles.selectItem}>
                  <Text style={styles.selectLabel}>Strike</Text>
                  <CustomSelect
                    placeholder="Select Strike"
                    options={strikePrices[0]?.options || []}
                    selected={strikePrice}
                    onChange={(val) => {
                      setStrikePrice(val);
                      getOptionData(val);
                    }}
                  />
                </View>
              )}
            </View>

            <ScrollView style={styles.marketListContainer}>
              {marketList.map((marketListItem, index) => (
                <TouchableOpacity
                  key={marketListItem.option || index}
                  style={styles.marketListItem}
                  onPress={() => {
                    addToWatchList(marketListItem);
                    setMarketList([]);
                  }}
                >
                  <Text style={styles.marketListText}>
                    {marketListItem.option}
                  </Text>
                  <Text style={styles.addIcon}>+</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        ) : (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#EF4444" />
          </View>
        )
      ) : (
        <>
          {search && marketList.length === 0 ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#EF4444" />
            </View>
          ) : (
            <ScrollView style={styles.marketListScrollContainer}>
              {marketList.map((marketListItem, index) => (
                <TouchableOpacity
                  key={marketListItem[marketListItem.type] || index}
                  style={styles.marketListItem}
                  onPress={() => {
                    addToWatchList(marketListItem);
                    setMarketList([]);
                  }}
                >
                  <Text style={styles.marketListText}>
                    {marketListItem[marketListItem.type]
                      ?.split(":")[1]
                      ?.toUpperCase()}
                  </Text>
                  <Text style={styles.addIcon}>+</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </>
      )}

      <View style={styles.tradeWatchContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {tradeWatch?.map((tradeWatchItem, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tradeWatchItem,
                activeCardIndex === index && styles.tradeWatchItemActive
              ]}
              onPress={() => handleCardPress(index)}
              activeOpacity={0.9}
            >
              <View style={styles.tradeWatchContent}>
                <View style={styles.tradeWatchHeader}>
                  <Text style={styles.tradeName}>
                    {tradeWatchItem.name.toUpperCase()}
                  </Text>
                  <Text style={styles.tradePrice}>
                    {priceData[tradeWatchItem.instrument_token] || "0.0"}
                  </Text>
                </View>

                {activeCardIndex === index && (
                  <View style={styles.actionButtonsContainer}>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.chartButton}
                      disabled={isDisabled}
                      onPress={() => handleChartPress(tradeWatchItem)}
                    >
                      <TrendingUp size={16} color="#101010" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      disabled={loader}
                      onPress={() => handleDeletePress(tradeWatchItem.instrument_token)}
                    >
                      <Trash2 size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 400,
    height: '100%',
    borderWidth: 1,
    borderColor: '#CECECE',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  marketSelectWrapper: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInputWrapper: {
    marginTop: 16,
  },
  searchInput: {
    backgroundColor: '#F4F8FD',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  optionsContainer: {
    padding: 16,
    gap: 16,
  },
  selectItem: {
    marginBottom: 4,
  },
  selectLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  marketListContainer: {
    paddingHorizontal: 16,
    maxHeight: 200,
  },
  marketListScrollContainer: {
    paddingHorizontal: 16,
    maxHeight: 400,
    minHeight: 100,
  },
  marketListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  marketListText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  addIcon: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  tradeWatchContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 8,
    paddingTop: 8,
    maxHeight: 410,
  },
  tradeWatchItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  tradeWatchItemActive: {
    backgroundColor: '#F9FAFB',
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
  tradeWatchContent: {
    position: 'relative',
  },
  tradeWatchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tradeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  tradePrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'right',
    marginLeft: 8,
  },
  actionButtonsContainer:{
position: 'absolute',
    top:-10,
    right: 0,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical:4,
    paddingHorizontal: 8,
    borderRadius: 4,
    gap: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  chartButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
});

export default Watchlist;