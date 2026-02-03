import img1 from '../../assets/images/unfluke/custom/chart-ratings-svgrepo-com.svg'
import img2 from '../../assets/images/unfluke/custom/barchart-svgrepo-com.svg'
import img3 from '../../assets/images/unfluke/custom/brazilian-real-svgrepo-com.svg'
import img4 from '../../assets/images/unfluke/custom/diagram-bar-downtrend-2-svgrepo-com.svg'
import img5 from '../../assets/images/unfluke/custom/money-business-and-finance-svgrepo-com.svg'
import img6 from '../../assets/images/unfluke/custom/bar-chart-financial-svgrepo-com.svg'
import img7 from '../../assets/images/unfluke/custom/candlestick-svgrepo-com.svg'
import img8 from '../../assets/images/unfluke/custom/chart-stock-svgrepo-com.svg'
import img9 from '../../assets/images/unfluke/custom/chevron-rank-svgrepo-com.svg'
import img10 from '../../assets/images/unfluke/custom/indicator-svgrepo-com.svg'
import img11 from '../../assets/images/unfluke/custom/exchange-trading-svgrepo-com.svg'
import img12 from '../../assets/images/unfluke/custom/currency-exchange-svgrepo-com.svg'
import img13 from '../../assets/images/unfluke/custom/robinhood-svgrepo-com.svg'
import img14 from '../../assets/images/unfluke/custom/options-svgrepo-com.svg'
import img15 from '../../assets/images/unfluke/custom/sprout-svgrepo-com (1).svg'
import img16 from '../../assets/images/unfluke/custom/sprout-svgrepo-com.svg'
import img17 from '../../assets/images/unfluke/custom/stats-financial-svgrepo-com.svg'
import img18 from '../../assets/images/unfluke/custom/stock-movement-svgrepo-com (1).svg'
import img19 from '../../assets/images/unfluke/custom/chart-growth-invest-svgrepo-com.svg'
import img20 from '../../assets/images/unfluke/custom/stats-business-and-finance-svgrepo-com.svg'
import img21 from '../../assets/images/unfluke/custom/growth-income-investment-svgrepo-com.svg'
import img22 from '../../assets/images/unfluke/custom/currency-commerce-and-shopping-svgrepo-com.svg'
import img23 from '../../assets/images/unfluke/custom/film-reel-svgrepo-com.svg'
import img24 from '../../assets/images/unfluke/custom/options-svgrepo-com (2).svg'
import img25 from '../../assets/images/unfluke/custom/os-inventory-management-svgrepo-com.svg'
import img26 from '../../assets/images/unfluke/custom/checked-tick-svgrepo-com (2).svg'
import img27 from '../../assets/images/unfluke/custom/checked-tick-svgrepo-com (4).svg'
import img28 from '../../assets/images/unfluke/custom/money-business-and-finance-svgrepo-com (1).svg'
import img29 from '../../assets/images/unfluke/custom/diagram-bar-downtrend-svgrepo-com.svg'
import img30 from '../../assets/images/unfluke/custom/chevron-down-svgrepo-com (2).svg'
import img31 from '../../assets/images/unfluke/custom/chevron-rank-svgrepo-com (2).svg'
import img32 from '../../assets/images/unfluke/custom/ipo-svgrepo-com.svg'
import img33 from '../../assets/images/unfluke/custom/money-business-and-finance-svgrepo-com (1).svg'
import img34 from '../../assets/images/unfluke/custom/sprout-svgrepo-com (16).svg'
import img35 from '../../assets/images/unfluke/custom/free-bull-svgrepo-com.svg'



function getRandomArrIndex(max) {
    return Math.floor(Math.random() * max);
}

export const fetchRandomImage = (i) => {
    const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12, img13, img14,
        img15, img16, img17, img18, img19, img20, img21, img22, img23, img24, img25, img26, img27, img28, img29, img30,
        img31, img32, img33, img34, img35
    ]

    if(i >= images.length){
        return images[0]
    }

    return images[i]
}