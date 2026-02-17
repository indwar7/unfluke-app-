import * as React from "react";
import DataFeed from "./api";
import { widget } from "../../../charting_library";
import { layoutModeTypes } from "../constants/layout";


function getLanguageFromURL() {
    // console.log("datafeed>>",DataFeed);
    const regex = new RegExp("[\\?&]lang=([^&#]*)");
    const results = regex.exec(window.location.search);
    return results === null
        ? null
        : decodeURIComponent(results[1].replace(/\+/g, " "));
}

export default class TVChartContainer extends React.PureComponent {
    static defaultProps = {
        symbol: "NSE:NIFTY 50",
        exchange: "NSE",
        interval: "1",
        containerId: "tv_chart_container",
        datafeedUrl: "https://demo_feed.tradingview.com",
        libraryPath: "/charting_library/",
        chartsStorageUrl: "https://saveload.tradingview.com",
        chartsStorageApiVersion: "1.1",
        clientId: "tradingview.com",
        userId: "public_user_id",
        fullscreen: false,
        autosize: true,
        studiesOverrides: {},
        currentDate: "",
        currentTime: "",
    };

    tvWidget = null;
    useEffect;
    componentDidMount() {
        // console.log("currentDate=>>",this.props.currentDate);
        // console.log("currentTime=>>",this.props.currentTime);
        const widgetOptions = {
            symbol: this.props.symbol,
            // BEWARE: no trailing slash is expected in feed URL
            datafeed: DataFeed,
            interval: this.props.interval,
            container: this.props.containerId,
            library_path: this.props.libraryPath,
            locale: getLanguageFromURL() || "en",
            disabled_features: ["use_localstorage_for_settings", "header_symbol_search"],
            charts_storage_url: this.props.chartsStorageUrl,
            charts_storage_api_version: this.props.chartsStorageApiVersion,
            client_id: this.props.clientId,
            user_id: this.props.userID,
            fullscreen: this.props.fullscreen,
            autosize: this.props.autosize,
            studies_overrides: this.props.studiesOverrides,
            enabled_features: ["study_templates", "fix_left_edge", "side_toolbar_in_fullscreen_mode", "header_in_fullscreen_mode"],
            timezone: "Asia/Kolkata",
            currentDate: this.props.currentDate,
            currentTime: this.props.currentTime,
            theme:window.document.documentElement.getAttribute("data-bs-theme"),
            debug: true,
        };

        const tvWidget = new widget(widgetOptions);
        this.tvWidget = tvWidget;

        tvWidget.onChartReady(() => {
            const page = window.location.pathname + window.location.search;
            if (page.includes("dashboard")) {
                tvWidget.activeChart().setChartType(1) // candlestick
            } else {
                tvWidget.activeChart().setChartType(2) // line

            }
            tvWidget.headerReady().then(() => {
                const button = tvWidget.createButton();
                button.setAttribute("title", "Click to show a notification popup");
                button.classList.add("apply-common-tooltip");
                button.addEventListener("click", () =>
                    tvWidget.showNoticeDialog({
                        title: "Notification",
                        body: "TradingView Charting Library API works correctly",
                        callback: () => {
                            console.log("Noticed!");
                        },
                    })
                );
                button.innerHTML = "Check API";
            });
        });
    }

    componentWillUnmount() {
        if (this.tvWidget !== null) {
            this.tvWidget.remove();
            this.tvWidget = null;
        }
    }

    getSnapshotBeforeUpdate(prevProps) {
        let chartType = window.sessionStorage.getItem("chartType")
        this.tvWidget.chart().setSymbol(this.props.symbol);

        if (prevProps.layoutMode !== this.props.layoutMode) {
            //   console.log("Theme Mode --- >> ",this.props.layoutMode)
            this.tvWidget.changeTheme( this.props.layoutMode[0].toUpperCase()+this.props.layoutMode.slice(1,) )
        }

        if (prevProps.symbol !== this.props.symbol) {
            console.log("SYMBOL --- >> ", this.props.symbol, prevProps.symbol)
            if (chartType !== "Options Chart") {
                // this.tvWidget.chart().set
            }

            // this.tvWidget.chart().setSymbol
        }

        // if (this.props.currentDate && this.props.currentTime && prevProps.currentDate && prevProps.currentTime){
        //   let cd=new Date(this.props.currentDate)
        //   cd=cd.getFullYear()
        //   let my= parseInt(this.props.maxYear)
        //   if (this.tvWidget._ready && prevProps.symbol == this.props.symbol && (cd>=my)) {
        //     for(let i=1;i<=2;i++){
        //     this.tvWidget.chart().resetData();
        //   }
        //   }
        //   // var prom = []
        // }
        return null;
    }

    render() {
        return <div id={this.props.containerId} className={"TVChartContainer"} />;
    }
}
