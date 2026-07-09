import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { Trash2, TrendingUp, Search, X } from 'lucide-react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

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
import { setSelectedStock } from "../../redux/Unfluke_slices/globalStock/reducer";
import { useTheme } from "@/constants/ThemeContext";

const Watchlist = () => {
  const dispatch = useDispatch();
  const { colors: c, isDark } = useTheme();
  const styles = makeStyles(c, isDark);

  const [activeCardIndex, setActiveCardIndex] = useState(null);
  const [search, setSearch] = useState("");
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
  const [loader, setLoader] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
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
  const searchTimeout = useRef(null);

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
  // Market scope ("in" | "crypto") — crypto search uses market=spot and a
  // {symbol, type:"spot"} result shape (website parity).
  const appType = useSelector((state: any) => state?.Layout?.appType ?? "in");
  const isCrypto = appType === "crypto";

  // Keep the instrument-type selector valid for the active market, reset the
  // Option cascade, and (re)fetch the market's own watchlist — the backend
  // keeps separate NSE/crypto lists, so a market toggle must reload it. This
  // effect also covers the initial mount fetch (runs on first render).
  useEffect(() => {
    setSelectMarket(isCrypto ? "Spot" : "Equity");
    setMarketList([]);
    setSearch("");
    setOptionName("");
    setExpiryDates([]);
    setExpiryDate("");
    setOptionType("");
    setStrikePrices([]);
    setPriceData({});
    if (user?._id) {
      dispatch(UserHistoricalWatchlist(user._id));
    }
  }, [isCrypto, user?._id]);

  useEffect(() => {
    const val = watchlist?.map((item) => ({
      ...item,
      feed: 0,
      change: 0,
    }));
    setTradeWatch(val);
  }, [watchlist]);

  // NOTE: getCurrentFeed is also called from the [tradeWatch, currentDateTime]
  // effect below with a user/loader guard. Calling it here too was firing the
  // postHistoricalFeed API twice per watchlist change. Keep only one effect.

  useEffect(() => {
    selectedSymbol !== "" &&
      dispatch(UserHistoricalSelectedSymbol(selectedSymbol));
  }, [selectedSymbol]);

  useEffect(() => {
    if (
      currentDateTime &&
      currentDateTime !== "" &&
      currentDateTime !== "Invalid Date"
    ) {
      const date = new Date(currentDateTime);
      if (!isNaN(date.getTime())) {
        const dateISO = date.toJSON();
        if (!dateISO) return;
        getOptionNames({
          selectedDate: dateISO.split("T")[0],
        }).then((data) => {
          // Array guard: an error payload here must not crash the sidebar.
          setOptionNames([
            {
              options: (Array.isArray(data) ? data : []).map((x) => ({ label: x, value: x })),
            },
          ]);
        }).catch(() => setOptionNames([]));
      }
    }
    // isCrypto dep: the same endpoint serves market-scoped names via the
    // appType header (crypto → ["BTC","ETH"]), so refetch on market toggle.
  }, [currentDateTime, isCrypto]);

  // Website parity (main.js): "crypto"===K ? [Spot, Future, Option]
  //                          : [Equity, Future, Option, Index]
  const market = [
    {
      options: isCrypto
        ? [
            { label: "Spot", value: "Spot" },
            { label: "Future", value: "Future" },
            { label: "Option", value: "Option" },
          ]
        : [
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

  const getDateString = () => {
    const d = currentDateTime ? new Date(currentDateTime) : new Date();
    return d.toJSON()?.split("T")[0] || new Date().toISOString().split("T")[0];
  };

  const getSearchResults = (e) => {
    setSearch(e);
    if (!e) {
      setMarketList([]);
      setSearchLoading(false);
      return;
    }

    // Debounce search
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (e.length > 1) {
      setSearchLoading(true);
      searchTimeout.current = setTimeout(async () => {
        // Website parity: send the SELECTED market lowercased (crypto: spot |
        // future; NSE: equity/future/option/index). Guard rail: the market
        // param family must match the appType header from AsyncStorage "mkt" —
        // a mismatch makes this endpoint HANG server-side (verified live:
        // appType=in + market=spot never responds). If component state lags a
        // market toggle by a render, clamp to that market's default. Note
        // crypto market=option also hangs — options use the cascade UI below,
        // never this search (search bar is hidden for Option).
        const mkt = (await AsyncStorage.getItem("mkt")) || "in";
        let marketParam = selectMarket.toLowerCase();
        if (mkt === "crypto") {
          if (marketParam !== "spot" && marketParam !== "future") marketParam = "spot";
        } else if (marketParam === "spot") {
          marketParam = "equity";
        }
        getWatchlistSearchResults({
          market: marketParam,
          search: e,
          date: getDateString(),
        }).then((data) => {
          setSearchLoading(false);
          if (!data || !data.length) {
            setMarketList([]);
            return;
          }
          // Show all results - even if already in watchlist (user can still switch chart)
          setMarketList(data);
        }).catch(() => {
          setSearchLoading(false);
          setMarketList([]);
        });
      }, 300);
    }
  };

  const addToWatchList = (marketListItem) => {
    let itemName, itemExch;
    if (isCrypto) {
      // Crypto search result shape: { symbol: "ETHUSDT", type: "spot", ... }
      itemName = marketListItem.symbol;
      itemExch = "CRYPTO";
    } else if (selectMarket == "Option") {
      itemName = marketListItem.option?.split(":")[1];
      itemExch = marketListItem.option?.split(":")[0];
    } else {
      const fullName = marketListItem[marketListItem.type];
      itemName = fullName?.split(":")[1];
      itemExch = fullName?.split(":")[0];
    }

    if (!itemName || !itemExch) return;

    // Switch chart to this symbol immediately
    const symbol = `${itemExch}:${itemName}`;
    setSelectedSymbol(symbol);
    dispatch(setSelectedStock({ symbol, name: itemName }));

    // Clear search
    setSearch("");
    setMarketList([]);
    Keyboard.dismiss();

    // Website parity: crypto watchlist entries are keyed by the search
    // result's Mongo _id (instrument_token: "crypto"===K ? e._id :
    // e.instrument_token); prices then resolve via feed.ticker ↔ row name.
    const token = isCrypto
      ? marketListItem._id
      : marketListItem.instrument_token;

    // Check if already in watchlist — if so, skip the API call
    const alreadyInWatchlist = tradeWatch?.some(
      (trade) => trade.instrument_token === token,
    );
    if (alreadyInWatchlist) return;

    const data = {
      userID: user._id,
      instrument_token: token,
      type: marketListItem.type,
      date: currentDateTime || new Date().toISOString(),
    };
    if (selectMarket == "Option") {
      data["name"] = itemName;
      data["exch"] = itemExch;
      data["expiry"] = expiryDate;
    } else {
      data["name"] = itemName;
      data["exch"] = itemExch;
    }
    postHistoricalWatchlist(data).then((resp: any) => {
      if (resp) {
        // Website parity: the backend maintains SEPARATE lists — crypto rows
        // live in resp.cryptoWatchlist; the NSE view filters CRYPTO rows out.
        const list = isCrypto
          ? resp.cryptoWatchlist || []
          : (resp.watchlist || []).filter((item) => item.exch !== "CRYPTO");
        const val = list.map((item) => ({
          ...item,
          feed: 0,
          change: 0,
        }));
        setTradeWatch(val);
      }
    }).catch(() => {});
  };

  const deleteTrade = (instrument_token) => {
    const data = {
      userID: user._id,
      instrument_token: instrument_token,
    };
    deleteHistoricalWatchlist({ data }).then((resp: any) => {
      // Same crypto/NSE list split as the add flow (website parity).
      const list = isCrypto
        ? resp?.cryptoWatchlist || []
        : (resp?.watchlist || []).filter((item) => item.exch !== "CRYPTO");
      setTradeWatch(list.map((item) => ({ ...item, feed: 0, change: 0 })));
      setActiveCardIndex(null);
    }).catch(() => setActiveCardIndex(null));
  };

  const getCurrentFeed = async () => {
    if (!currentDateTime || loader) return;
    if (prevDateTime.current == "")
      prevDateTime.current = new Date(currentDateTime);
    var time = new Date(currentDateTime);
    if (time.getFullYear() < parseInt(user?.charts_fno)) {
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
      currentDate: getDateString(),
      prevDateTime: prevDateTime.current,
    }).then((data) => {
      setLoader(false);
      const newPriceData = {};
      (Array.isArray(data) ? data : []).forEach((feed) => {
        if (feed) {
          // Website parity: crypto feed rows are keyed by `ticker` (matches
          // the watchlist row's `name`); NSE rows by instrument_token.
          const key = isCrypto ? feed.ticker : feed.instrument_token;
          if (key === undefined || key === null) return;
          if (feed.open === "EXP" || feed.open === "NA") {
            newPriceData[key] = feed.open;
          } else {
            newPriceData[key] = parseFloat(feed.open).toFixed(2);
          }
        }
      });
      setPriceData(newPriceData);
    }).catch(() => setLoader(false));
  };

  // NOTE: APIClient.get serialises params by iterating Object.keys(obj), so
  // these must be FLAT objects. The axios-style { params: {...} } wrapper the
  // website uses (its client passes it as axios config) went out from OUR
  // client as "?params=[object Object]" — which silently broke the Option
  // cascade in BOTH markets. The endpoints + params otherwise mirror the
  // website exactly and work for crypto (BTC/ETH) too.
  const getOptionsExpiryDate = (e) => {
    setOptionName(e);
    getOptionsExpiries({
      optionName: e,
      id: user._id,
      optionType: "CE - Call",
    }).then((data) => {
      setExpiryDates([
        {
          options: (data?.expiry_date || []).map((x) => ({ label: x, value: x })),
        },
      ]);
    }).catch(() => setExpiryDates([]));
  };

  const getOptionStrikePrice = (e) => {
    setOptionType(e);
    getOptionsStrikes({
      expiryDate: expiryDate,
      optionName: optionName,
      optionType: e,
      id: user._id,
    }).then((data) => {
      setStrikePrices([
        {
          options: (data?.strike_price || [])
            .sort((a, b) => a - b)
            .map((x) => ({ label: x, value: x })),
        },
      ]);
    }).catch(() => setStrikePrices([]));
  };

  const getOptionData = (e) => {
    setStrikePrice(e);
    getWatchlistOptionsResults({
      expiryDate: expiryDate,
      optionName: optionName,
      optionType: optionType,
      strikePrice: e,
      date: getDateString(),
    }).then((data) => {
      setStrikePrice(0);
      const rows = Array.isArray(data) ? data : [];
      const reduceRedundancyData = rows.filter((listItem) => {
        if (
          !tradeWatch?.some(
            (trade) => trade.instrument_token == listItem.instrument_token,
          )
        )
          return listItem;
      });
      setMarketList(reduceRedundancyData);
    }).catch(() => setMarketList([]));
  };

  useEffect(() => {
    user._id && !loader && getCurrentFeed();
  }, [tradeWatch, currentDateTime]);

  const handleCardPress = (index) => {
    if (activeCardIndex === index) {
      setActiveCardIndex(null);
    } else {
      setActiveCardIndex(index);
    }
  };

  const handleChartPress = (tradeWatchItem) => {
    setIsDisabled(true);
    if (!isDisabled) {
      const symbol = `${tradeWatchItem.exch}:${tradeWatchItem.name}`;
      setSelectedSymbol(symbol);
      dispatch(setSelectedStock({
        symbol: symbol,
        name: tradeWatchItem.name,
      }));
    }
    setActiveCardIndex(null);
    setTimeout(() => {
      setIsDisabled(false);
    }, 2000);
  };

  const handleDeletePress = (instrument_token) => {
    deleteTrade(instrument_token);
  };

  const showSearchDropdown = search.length > 1;

  return (
    <View style={styles.container}>
      {/* Title is shown by the parent modal header — avoid duplicate "Watchlist" text */}
      {/* Market selector */}
      <View style={styles.topSection}>
        <CustomSelect
          placeholder="Select"
          name="choices-instrument-default"
          options={market[0]?.options || []}
          selected={selectMarket}
          onChange={setSelectMarket}
          disableTyping={true}
        />
      </View>

      {/* Option filters */}
      {selectMarket === "Option" && optionNames.length > 0 && (
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
      )}

      {/* Search bar */}
      {selectMarket !== "Option" && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBarWrapper}>
            <Search size={16} color={c.textSecondary} style={{ marginLeft: 12 }} />
            <TextInput
              style={styles.searchInput}
              value={search}
              placeholder={isCrypto ? "Search e.g. BTC, ETH" : "Search e.g. Nifty, Reliance, TCS"}
              onChangeText={getSearchResults}
              placeholderTextColor={c.textMuted}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearch("");
                  setMarketList([]);
                  Keyboard.dismiss();
                }}
                style={styles.clearBtn}
              >
                <X size={16} color={c.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Search results dropdown */}
          {showSearchDropdown && (
            <View style={styles.searchDropdown}>
              {searchLoading ? (
                <View style={styles.searchLoading}>
                  <ActivityIndicator size="small" color={c.gold} />
                  <Text style={styles.searchLoadingText}>Searching...</Text>
                </View>
              ) : marketList.length === 0 ? (
                <View style={styles.searchLoading}>
                  <Text style={styles.searchLoadingText}>No results found</Text>
                </View>
              ) : (
                <ScrollView
                  style={styles.searchResultsList}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                >
                  {marketList.map((marketListItem, index) => {
                    const displayName = (
                      marketListItem.symbol ||
                      marketListItem[marketListItem.type]?.split(":")[1]
                    )?.toUpperCase();
                    const alreadyAdded = tradeWatch?.some(
                      (t) =>
                        t.instrument_token ===
                        (marketListItem.instrument_token ?? marketListItem.symbol),
                    );
                    return (
                      <TouchableOpacity
                        key={marketListItem.symbol || marketListItem[marketListItem.type] || index}
                        style={styles.searchResultItem}
                        onPress={() => addToWatchList(marketListItem)}
                      >
                        <Text style={styles.searchResultText}>
                          {displayName || "Unknown"}
                        </Text>
                        <Text style={styles.searchResultAdd}>
                          {alreadyAdded ? "View" : "+ Add"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          )}
        </View>
      )}

      {/* Option search results — NSE rows: { option: "NFO:NIFTY..." };
          crypto rows: { symbol: "C-BTC-60000-030726" } (no `option` field). */}
      {selectMarket === "Option" && marketList.length > 0 && (
        <ScrollView style={styles.optionResultsList} keyboardShouldPersistTaps="handled">
          {marketList.map((marketListItem, index) => (
            <TouchableOpacity
              key={marketListItem.option || marketListItem.symbol || index}
              style={styles.searchResultItem}
              onPress={() => addToWatchList(marketListItem)}
            >
              <Text style={styles.searchResultText}>
                {marketListItem.option || marketListItem.symbol}
              </Text>
              <Text style={styles.searchResultAdd}>+ Add</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loader && (
        <View style={styles.loaderRow}>
          <ActivityIndicator size="small" color={c.gold} />
        </View>
      )}

      {/* Stock List */}
      <View style={styles.watchlistContainer}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {tradeWatch?.length === 0 && (
            <Text style={styles.emptyText}>No items in watchlist. Search and add stocks above.</Text>
          )}
          {tradeWatch?.map((tradeWatchItem, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.watchItem,
                activeCardIndex === index && styles.watchItemActive,
              ]}
              onPress={() => handleCardPress(index)}
              activeOpacity={0.8}
            >
              <View style={styles.watchItemRow}>
                <Text style={styles.watchItemName} numberOfLines={1}>
                  {tradeWatchItem.name?.toUpperCase()}
                </Text>
                <Text style={styles.watchItemPrice}>
                  {priceData[
                    isCrypto ? tradeWatchItem.name : tradeWatchItem.instrument_token
                  ] || "--"}
                </Text>
              </View>

              {activeCardIndex === index && (
                <View style={styles.watchItemActions}>
                  <TouchableOpacity
                    style={styles.actionBtnChart}
                    disabled={isDisabled}
                    onPress={() => handleChartPress(tradeWatchItem)}
                  >
                    <TrendingUp size={14} color={c.gold} />
                    <Text style={styles.actionBtnText}>Chart</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnDelete}
                    disabled={loader}
                    onPress={() => handleDeletePress(tradeWatchItem.instrument_token)}
                  >
                    <Trash2 size={14} color={c.loss} />
                    <Text style={styles.actionBtnDeleteText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const makeStyles = (c, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.card,
  },
  topSection: {
    padding: 12,
    paddingBottom: 8,
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    zIndex: 10,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.inputBg,
    borderWidth: 1,
    borderColor: c.inputBorder,
    borderRadius: 8,
    height: 42,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 0,
    fontSize: 14,
    color: c.text,
    height: 42,
  },
  clearBtn: {
    padding: 10,
  },
  searchDropdown: {
    marginTop: 4,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 200,
  },
  searchLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  searchLoadingText: {
    fontSize: 13,
    color: c.textSecondary,
  },
  searchResultsList: {
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  searchResultDisabled: {
    opacity: 0.5,
  },
  searchResultText: {
    fontSize: 14,
    color: c.text,
    fontWeight: '500',
    flex: 1,
  },
  searchResultTextDisabled: {
    color: c.textMuted,
  },
  searchResultAdd: {
    fontSize: 13,
    color: c.gold,
    fontWeight: '600',
    marginLeft: 8,
  },
  optionsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 10,
  },
  selectItem: {
    marginBottom: 12,
  },
  selectLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: c.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  optionResultsList: {
    paddingHorizontal: 12,
    maxHeight: 180,
  },
  loaderRow: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  watchlistContainer: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: c.text,
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 13,
    color: c.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  watchItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  watchItemActive: {
    backgroundColor: c.surfaceElevated,
  },
  watchItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  watchItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: c.text,
    flex: 1,
  },
  watchItemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: c.text,
    marginLeft: 8,
  },
  watchItemActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  actionBtnChart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: c.goldLight,
    borderWidth: 1,
    borderColor: c.gold,
  },
  actionBtnText: {
    fontSize: 12,
    color: c.gold,
    fontWeight: '600',
  },
  actionBtnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: c.lossBg,
    borderWidth: 1,
    borderColor: c.loss,
  },
  actionBtnDeleteText: {
    fontSize: 12,
    color: c.loss,
    fontWeight: '600',
  },
});

export default Watchlist;
