const str = (a) => {
    return {
        value: a,
        format: (data) => a
    };
}

const objs = {
    name: [str("Ticker"), str("Ticker")],
    description: [str("Description"), str("Description")],
    country: [str("Country"), str("Country")],
    type: [str("Symbol Type"), str("Symbol Type")],
    after_tax_margin: [str("Net Margin (TTM)"), str("Net Margin")],
    average_volume: [
        str("Average Volume (10 day)"),
        str("Avg Vol (10)"),
    ],
    average_volume_30d_calc: [
        str("Average Volume (30 day)"),
        str("Avg Vol (30)"),
    ],
    average_volume_60d_calc: [
        str("Average Volume (60 day)"),
        str("Avg Vol (60)"),
    ],
    average_volume_90d_calc: [
        str("Average Volume (90 day)"),
        str("Avg Vol (90)"),
    ],
    basic_eps_net_income: [str("Basic EPS (FY)"), str("EPS (FY)")],
    beta_1_year: [str("1-Year Beta"), str("1-Y Beta")],
    beta_3_year: [str("Beta - 3 Year"), str("Beta 3Y")],
    beta_5_year: [str("Beta - 5 Year"), str("Beta 5Y")],
    candlestick: [
        str("Pattern", {
            context: "candlestick_pattern",
        }),
        str("Pattern", {
            context: "candlestick_pattern",
        }),
    ],
    current_ratio: [str("Current Ratio (MRQ)"), str("Current Ratio")],
    debt_to_assets: [str("Debt to Assets"), str("Debt to Assets")],
    debt_to_equity: [
        str("Debt to Equity Ratio (MRQ)"),
        str("DEBT/EQUITY"),
    ],
    dividends_paid: [str("Dividends Paid (FY)"), str("Div Paid")],
    dividends_per_share_fq: [
        str("Dividends per Share (MRQ)"),
        str("Div per Share (MRQ)"),
    ],
    dividends_yield: [
        str("Dividend Yield Forward"),
        str("Div Yield FWD"),
    ],
    dividend_yield_recent: [
        str("Dividend Yield Forward"),
        str("Div Yield FWD"),
    ],
    dps_common_stock_prim_issue_fy: [
        str("Dividends per Share (FY)"),
        str("Div per Share (FY)"),
    ],
    earnings_per_share_basic_ttm: [
        str("Basic EPS (TTM)"),
        str("EPS (TTM)"),
    ],
    earnings_per_share_diluted_ttm: [
        str("EPS Diluted (TTM)"),
        str("EPS Diluted (TTM)"),
    ],
    earnings_per_share_forecast_next_fq: [
        str("EPS Forecast (FQ)"),
        str("EPS Forecast"),
    ],
    earnings_per_share_fq: [
        str("EPS Diluted (MRQ)"),
        str("EPS Diluted (MRQ)"),
    ],
    earnings_release_date: [
        str("Recent Earnings Date"),
        str("Recent Earnings Date"),
    ],
    earnings_release_next_date: [
        str("Upcoming Earnings Date"),
        str("Upcoming Earnings Date"),
    ],
    ebitda: [str("EBITDA (TTM)"), str("EBITDA")],
    enterprise_value_ebitda_ttm: [
        str("Enterprise Value/EBITDA (TTM)"),
        str("EV/EBITDA"),
    ],
    enterprise_value_fq: [str("Enterprise Value (MRQ)"), str("EV")],
    exchange: [str("Exchange"), str("Exchange")],
    gross_margin: [str("Gross Margin (TTM)"), str("Gross Margin")],
    gross_profit: [str("Gross Profit (FY)"), str("Gross Profit (FY)")],
    gross_profit_fq: [
        str("Gross Profit (MRQ)"),
        str("Gross Profit (MRQ)"),
    ],
    index: [str("Index"), str("Index")],
    industry: [str("Industry"), str("Industry")],
    last_annual_eps: [str("EPS Diluted (FY)"), str("EPS Diluted (FY)")],
    last_annual_revenue: [
        str("Last Year Revenue (FY)"),
        str("Annual Rev"),
    ],
    long_term_capital: [
        str("Capital Long Term"),
        str("Capital Long Term"),
    ],
    market_cap_basic: [str("Market Capitalization"), str("Mkt Cap")],
    market_cap_calc: [str("Market Capitalization"), str("Mkt Cap")],
    market_cap_diluted_calc: [
        str("Fully Diluted Market Cap"),
        str("FD Mkt Cap"),
    ],
    net_debt: [str("Net Debt (MRQ)"), str("Net Debt")],
    net_income: [str("Net Income (FY)"), str("Income")],
    number_of_employees: [str("Number of Employees"), str("EMPLOYEES")],
    number_of_shareholders: [
        str("Number of Shareholders"),
        str("Shareholders"),
    ],
    open_price: [str("Open Price"), str("Open")],
    operating_margin: [
        str("Operating Margin (TTM)"),
        str("Operating Margin"),
    ],
    pre_tax_margin: [str("Pretax Margin (TTM)"), str("Pretax Margin")],
    preferred_dividends: [str("Dividends Preferred"), str("Div Pref")],
    prev_close_price: [str("Previous Close Price"), str("Prev")],
    price_52_week_high: [str("52 Week High"), str("High 52W")],
    price_52_week_low: [str("52 Week Low"), str("Low 52W")],
    price_book_ratio: [str("Price to Book (FY)"), str("P/B (FY)")],
    price_earnings_ttm: [
        str("Price to Earnings Ratio (TTM)"),
        str("P/E"),
    ],
    price_percent_change_1_week: [
        str("Price % Change 1 Week"),
        str("Chng 1W"),
    ],
    price_percent_change_4_week: [
        str("Price % Change 4 Week"),
        str("Chng 4W"),
    ],
    price_percent_change_52_week: [
        str("Price % Change 52 Week"),
        str("Chng 52W"),
    ],
    price_revenue_ttm: [
        str("Price to Revenue Ratio (TTM)"),
        str("Price/Rev"),
    ],
    price_sales_ratio: [str("Price to Sales (FY)"), str("P/S")],
    quick_ratio: [str("Quick Ratio (MRQ)"), str("Quick Ratio")],
    return_of_invested_capital_percent_ttm: [
        str("Return on Invested Capital % (TTM)"),
        str("ROIC %"),
    ],
    return_on_assets: [str("Return on Assets (TTM)"), str("ROA")],
    return_on_equity: [str("Return on Equity (TTM)"), str("ROE")],
    return_on_invested_capital: [
        str("Return on Invested Capital (TTM)"),
        str("ROIC %"),
    ],
    revenue_per_employee: [
        str("Revenue per Employee (TTM)"),
        str("Revenue per Employee"),
    ],
    sector: [str("Sector"), str("Sector")],
    submarket: [str("Submarket"), str("Submarket")],
    is_primary: [str("Primary Listing"), str("Primary Listing")],
    eps_surprise_fq: [str("Surprise"), str("Surprise")],
    eps_surprise_percent_fq: [str("Surprise %"), str("Surprise %")],
    total_assets: [str("Total Assets (MRQ)"), str("Assets")],
    total_capital: [str("Total Capital"), str("Capital")],
    total_current_assets: [
        str("Total Current Assets (MRQ)"),
        str("Current Assets"),
    ],
    total_debt: [str("Total Debt (MRQ)"), str("Debt")],
    total_revenue: [str("Total Revenue (FY)"), str("Revenue")],
    total_liabilities_fy: [
        str("Total Liabilities (FY)"),
        str("Liabilities (FY)"),
    ],
    total_liabilities_fq: [
        str("Total Liabilities (MRQ)"),
        str("Liabilities (MRQ)"),
    ],
    total_shares_outstanding_fundamental: [
        str("Total Shares Outstanding (MRQ)"),
        str("Shares"),
    ],
    volume: [str("Volume"), str("Vol")],
    relative_volume: [str("Relative Volume"), str("Relative Vol")],
    relative_volume_at_time: [
        str("Relative Volume at Time"),
        str("Relative Vol at Time"),
    ],
    change_abs: [str("Change"), str("Chg")],
    change: [str("Change %"), str("Chg %")],
    "change.1": [
        str("Change {resolution}, %").format({
            resolution: str("1m"),
        }),
        str("{resolution} CHG %").format({
            resolution: str("1m"),
        }),
    ],
    "change_abs.1": [
        str("Change {resolution}").format({
            resolution: str("1m"),
        }),
        str("{resolution} CHG").format({
            resolution: str("1m"),
        }),
    ],
    "change.5": [
        str("Change {resolution}, %").format({
            resolution: str("5m"),
        }),
        str("{resolution} CHG %").format({
            resolution: str("5m"),
        }),
    ],
    "change_abs.5": [
        str("Change {resolution}").format({
            resolution: str("5m"),
        }),
        str("{resolution} CHG").format({
            resolution: str("5m"),
        }),
    ],
    "change.15": [
        str("Change {resolution}, %").format({
            resolution: str("15m"),
        }),
        str("{resolution} CHG %").format({
            resolution: str("15m"),
        }),
    ],
    "change_abs.15": [
        str("Change {resolution}").format({
            resolution: str("15m"),
        }),
        str("{resolution} CHG").format({
            resolution: str("15m"),
        }),
    ],
    "change.60": [
        str("Change {resolution}, %").format({
            resolution: str("1h"),
        }),
        str("{resolution} CHG %").format({
            resolution: str("1h"),
        }),
    ],
    "change_abs.60": [
        str("Change {resolution}").format({
            resolution: str("1h"),
        }),
        str("{resolution} CHG").format({
            resolution: str("1h"),
        }),
    ],
    "change.240": [
        str("Change {resolution}, %").format({
            resolution: str("4h"),
        }),
        str("{resolution} CHG %").format({
            resolution: str("4h"),
        }),
    ],
    "change_abs.240": [
        str("Change {resolution}").format({
            resolution: str("4h"),
        }),
        str("{resolution} CHG").format({
            resolution: str("4h"),
        }),
    ],
    "change.1W": [
        str("Change {resolution}, %").format({
            resolution: str("1W"),
        }),
        str("{resolution} CHG %").format({
            resolution: str("1W"),
        }),
    ],
    "change_abs.1W": [
        str("Change {resolution}").format({
            resolution: str("1W"),
        }),
        str("{resolution} CHG").format({
            resolution: str("1W"),
        }),
    ],
    "change.1M": [
        str("Change {resolution}, %").format({
            resolution: str("1M"),
        }),
        str("{resolution} CHG %").format({
            resolution: str("1M"),
        }),
    ],
    "change_abs.1M": [
        str("Change {resolution}").format({
            resolution: str("1M"),
        }),
        str("{resolution} CHG").format({
            resolution: str("1M"),
        }),
    ],
    pre_change: [str("Pre-market Change %"), str("Pre-market chg %")],
    post_change: [
        str("Post-market Change %"),
        str("Post-market chg %"),
    ],
    bid: [str("Bid"), str("Bid")],
    ask: [str("Ask"), str("Ask")],
    close: [str("Close"), str("Close")],
    open: [str("Open"), str("Open")],
    high: [str("High"), str("High")],
    low: [str("Low"), str("Low")],
    gap: [str("Gap %"), str("Gap %")],
    price_earnings_to_growth_ttm: [
        str("Price/Earnings/Growth (TTM)"),
        str("PEG"),
    ],
    price_sales: [str("Price/Sales"), str("Price/Sales")],
    price_book_fq: [str("Price to Book (MRQ)"), str("P/B (MRQ)")],
    price_free_cash_flow_ttm: [
        str("Price to Free Cash Flow (TTM)"),
        str("Price/Free Cash Flow"),
    ],
    float_shares_outstanding: [str("Shares Float"), str("Float")],
    free_cash_flow: [
        str("Free Cash Flow (TTM)"),
        str("Free Cash Flow"),
    ],
    total_shares_outstanding: [
        str("Shares Outstanding"),
        str("Shares Outstanding"),
    ],
    total_shares_diluted: [str("Total Coins"), str("Total Coins")],
    total_value_traded: [str("Traded Volume"), str("Traded Vol")],
    change_from_open: [
        str("Change from Open %"),
        str("Chg from Open %"),
    ],
    change_from_open_abs: [
        str("Change from Open"),
        str("Chg from Open"),
    ],
    "Perf.W": [str("Weekly Performance"), str("Weekly Perf")],
    "Perf.1M": [str("Monthly Performance"), str("Monthly Perf")],
    "Perf.3M": [str("3-Month Performance"), str("3-Month Perf")],
    "Perf.6M": [str("6-Month Performance"), str("6-Month Perf")],
    "Perf.Y": [str("Yearly Performance"), str("Yearly Perf")],
    "Perf.YTD": [str("YTD Performance"), str("YTD Perf")],
    "Volatility.W": [str("Volatility Week"), str("Volatility W")],
    "Volatility.M": [str("Volatility Month"), str("Volatility M")],
    "Volatility.D": [str("Volatility"), str("Volatility")],
    RSI: [str("Relative Strength Index (14)"), str("RSI14")],
    RSI7: [str("Relative Strength Index (7)"), str("RSI7")],
    ADX: [str("Average Directional Index (14)"), str("ADX")],
    "ADX+DI": [
        str("Positive Directional Indicator (14)"),
        str("+DI", {
            context: "Positive_Directional_Indicator_short_title",
        }),
    ],
    "ADX-DI": [
        str("Negative Directional Indicator (14)"),
        str("-DI", {
            context: "Negative_Directional_Indicator_short_title",
        }),
    ],
    ATR: [str("Average True Range (14)"), str("ATR")],
    Mom: [str("Momentum (10)"), str("MOM")],
    "High.All": [str("All Time High"), str("All Time High")],
    "Low.All": [str("All Time Low"), str("All Time Low")],
    "High.6M": [str("6-Month High"), str("6-Month High")],
    "Low.6M": [str("6-Month Low"), str("6-Month Low")],
    "High.3M": [str("3-Month High"), str("3-Month High")],
    "Low.3M": [str("3-Month Low"), str("3-Month Low")],
    "High.1M": [str("1-Month High"), str("1-Month High")],
    "Low.1M": [str("1-Month Low"), str("1-Month Low")],
    EMA5: [
        str("Exponential Moving Average ({number})").format({
            number: "5",
        }),
        str("EMA5"),
    ],
    EMA10: [
        str("Exponential Moving Average ({number})").format({
            number: "10",
        }),
        str("EMA10"),
    ],
    EMA20: [
        str("Exponential Moving Average ({number})").format({
            number: "20",
        }),
        str("EMA20"),
    ],
    EMA30: [
        str("Exponential Moving Average ({number})").format({
            number: "30",
        }),
        str("EMA30"),
    ],
    EMA50: [
        str("Exponential Moving Average ({number})").format({
            number: "50",
        }),
        str("EMA50"),
    ],
    EMA100: [
        str("Exponential Moving Average ({number})").format({
            number: "100",
        }),
        str("EMA100"),
    ],
    EMA200: [
        str("Exponential Moving Average ({number})").format({
            number: "200",
        }),
        str("EMA200"),
    ],
    SMA5: [
        str("Simple Moving Average ({number})").format({
            number: "5",
        }),
        str("SMA5"),
    ],
    SMA10: [
        str("Simple Moving Average ({number})").format({
            number: "10",
        }),
        str("SMA10"),
    ],
    SMA20: [
        str("Simple Moving Average ({number})").format({
            number: "20",
        }),
        str("SMA20"),
    ],
    SMA30: [
        str("Simple Moving Average ({number})").format({
            number: "30",
        }),
        str("SMA30"),
    ],
    SMA50: [
        str("Simple Moving Average ({number})").format({
            number: "50",
        }),
        str("SMA50"),
    ],
    SMA100: [
        str("Simple Moving Average ({number})").format({
            number: "100",
        }),
        str("SMA100"),
    ],
    SMA200: [
        str("Simple Moving Average ({number})").format({
            number: "200",
        }),
        str("SMA200"),
    ],
    "Stoch.K": [str("Stochastic %K (14, 3, 3)"), str("Stoch %K")],
    "Stoch.D": [str("Stochastic %D (14, 3, 3)"), str("Stoch %D")],
    "MACD.macd": [str("MACD Level (12, 26)"), str("MACD Level")],
    "MACD.signal": [str("MACD Signal (12, 26)"), str("MACD Signal")],
    "Aroon.Up": [str("Aroon Up (14)"), str("Aroon Up")],
    "Aroon.Down": [str("Aroon Down (14)"), str("Aroon Down")],
    "BB.upper": [str("Bollinger Upper Band (20)"), str("BB Up")],
    "BB.lower": [str("Bollinger Lower Band (20)"), str("BB Low")],
    goodwill: [str("Goodwill"), str("Goodwill")],
    debt_to_equity_fq: [str("Debt/Equity, MRQ"), str("Debt/Eq")],
    CCI20: [str("Commodity Channel Index (20)"), str("CCI20")],
    "DonchCh20.Upper": [
        str("Donchian Channels Upper Band (20)"),
        str("DonchCh20 Up"),
    ],
    "DonchCh20.Lower": [
        str("Donchian Channels Lower Band (20)"),
        str("DonchCh20 Low"),
    ],
    HullMA9: [str("Hull Moving Average (9)"), str("HullMA9")],
    AO: [str("Awesome Oscillator"), str("AO")],
    "Pivot.M.Classic.S3": [str("Pivot Classic S3"), str("S3")],
    "Pivot.M.Classic.S2": [str("Pivot Classic S2"), str("S2")],
    "Pivot.M.Classic.S1": [str("Pivot Classic S1"), str("S1")],
    "Pivot.M.Classic.Middle": [str("Pivot Classic P"), str("P")],
    "Pivot.M.Classic.R1": [str("Pivot Classic R1"), str("R1")],
    "Pivot.M.Classic.R2": [str("Pivot Classic R2"), str("R2")],
    "Pivot.M.Classic.R3": [str("Pivot Classic R3"), str("R3")],
    "Pivot.M.Fibonacci.S3": [str("Pivot Fibonacci S3"), str("S3")],
    "Pivot.M.Fibonacci.S2": [str("Pivot Fibonacci S2"), str("S2")],
    "Pivot.M.Fibonacci.S1": [str("Pivot Fibonacci S1"), str("S1")],
    "Pivot.M.Fibonacci.Middle": [str("Pivot Fibonacci P"), str("P")],
    "Pivot.M.Fibonacci.R1": [str("Pivot Fibonacci R1"), str("R1")],
    "Pivot.M.Fibonacci.R2": [str("Pivot Fibonacci R2"), str("R2")],
    "Pivot.M.Fibonacci.R3": [str("Pivot Fibonacci R3"), str("R3")],
    "Pivot.M.Camarilla.S3": [str("Pivot Camarilla S3"), str("S3")],
    "Pivot.M.Camarilla.S2": [str("Pivot Camarilla S2"), str("S2")],
    "Pivot.M.Camarilla.S1": [str("Pivot Camarilla S1"), str("S1")],
    "Pivot.M.Camarilla.Middle": [str("Pivot Camarilla P"), str("P")],
    "Pivot.M.Camarilla.R1": [str("Pivot Camarilla R1"), str("R1")],
    "Pivot.M.Camarilla.R2": [str("Pivot Camarilla R2"), str("R2")],
    "Pivot.M.Camarilla.R3": [str("Pivot Camarilla R3"), str("R3")],
    "Pivot.M.Woodie.S3": [str("Pivot Woodie S3"), str("S3")],
    "Pivot.M.Woodie.S2": [str("Pivot Woodie S2"), str("S2")],
    "Pivot.M.Woodie.S1": [str("Pivot Woodie S1"), str("S1")],
    "Pivot.M.Woodie.Middle": [str("Pivot Woodie P"), str("P")],
    "Pivot.M.Woodie.R1": [str("Pivot Woodie R1"), str("R1")],
    "Pivot.M.Woodie.R2": [str("Pivot Woodie R2"), str("R2")],
    "Pivot.M.Woodie.R3": [str("Pivot Woodie R3"), str("R3")],
    "Pivot.M.Demark.S1": [str("Pivot DM S1"), str("S1")],
    "Pivot.M.Demark.Middle": [str("Pivot DM P"), str("P")],
    "Pivot.M.Demark.R1": [str("Pivot DM R1"), str("R1")],
    "KltChnl.upper": [
        str("Keltner Channels Upper Band (20)"),
        str("KltCh20 Up"),
    ],
    "KltChnl.lower": [
        str("Keltner Channels Lower Band (20)"),
        str("KltCh20 Low"),
    ],
    "P.SAR": [str("Parabolic SAR"), str("SAR")],
    "Value.Traded": [str("Volume*Price"), str("Volume*Price")],
    MoneyFlow: [
        str("Money Flow (14)"),
        str("MFI", {
            context: "Money_Flow_short_title",
        }),
    ],
    ChaikinMoneyFlow: [
        str("Chaikin Money Flow (20)"),
        str("CMF", {
            context: "Chaikin_Money_Flow_short_title",
        }),
    ],
    "Recommend.All": [str("Technical Rating"), str("Technical Rating")],
    "Recommend.MA": [
        str("Moving Averages Rating"),
        str("Moving Averages Rating"),
    ],
    "Recommend.Other": [
        str("Oscillators Rating"),
        str("Oscillators Rating"),
    ],
    "Stoch.RSI.K": [
        str("Stochastic RSI Fast (3, 3, 14, 14)"),
        str("Stoch RSI Fast"),
    ],
    "Stoch.RSI.D": [
        str("Stochastic RSI Slow (3, 3, 14, 14)"),
        str("Stoch RSI Slow"),
    ],
    "W.R": [str("Williams Percent Range (14)"), str("%R")],
    ROC: [str("Rate Of Change (9)"), str("ROC")],
    BBPower: [str("Bull Bear Power"), str("BBPower")],
    UO: [str("Ultimate Oscillator (7, 14, 28)"), str("UO")],
    "Ichimoku.CLine": [
        str("Ichimoku Conversion Line (9, 26, 52, 26)"),
        str("Ichimoku Conversion"),
    ],
    "Ichimoku.BLine": [
        str("Ichimoku Base Line (9, 26, 52, 26)"),
        str("Ichimoku Base"),
    ],
    "Ichimoku.Lead1": [
        str("Ichimoku Leading Span A (9, 26, 52, 26)"),
        str("Ichimoku Leading Span A"),
    ],
    "Ichimoku.Lead2": [
        str("Ichimoku Leading Span B (9, 26, 52, 26)"),
        str("Ichimoku Leading Span B"),
    ],
    VWAP: [str("Volume Weighted Average Price"), str("VWAP")],
    VWMA: [str("Volume Weighted Moving Average (20)"), str("VWMA")],
    ADR: [str("Average Day Range (14)"), str("ADR")],
};
