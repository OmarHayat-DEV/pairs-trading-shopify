# Introduction

Typical in pairs trading, we begin by looking for a pair of securities that have __reasonable justification__ for reacting in tandem to the underlying market conditions.

This reasonable justification can come initially from a good intuition or hueristic for how two securities __should__ behave in relation to one another. Then, statisical methods can be applied to support or disprove the initial heuristic.

In this example, we consider the two securities SHOP.TO (traded on the TSX) and SHOP (traded on the NYSE). Since the underlying value for each security is determined by the performance of Shopify the company, we are really betting on the Law of One Price (LOP).

We expect that the spread here should be very tight. When we do observe increase in spread, it's a manifestation of inefficiency (lag) in the respective exchanges adherence to the LOP. 

We may futher theorize what caused this inefficiency such as irregular trading behaviour on one exchange or other equity / FX market microstructures, but this is not the focus of our investigation. 


# Evaluating Fit for Pairs Trading 

We first observe our two securities of interest, SHOP.TO and SHOP, as raw time series in their original currency. Since SHOP is traded as a USD security, to fairly compare it to SHOP.TO we need to conver its value to CAD. We do so using the market end FX exchange rate for that date. Note this is an assumption we make in our feasibility analysis, since the FX market end is at 5pm, whereas SHOP.TO and SHOP market end is at 4pm. In practice we would rely on the exchange rate at 4pm. 

**GRAPH OF SHOP.TO, SHOP, FX RATE**

Adjusting for the exchange rate we see the overlay of the two series in CAD.

**GRAPH OF SHOP.TO and SHOP adjusted using FX Rate**

Reading a price graph alone does little good in determining fit for trading. Instead, we turn to statistical tools to test the relationship between these two time series. 


Towards this we want:

1. Evidence towards the log of the price time series for each security to be integrated of order one. Denoted mathematically,
```math
X = log(p_t^{\text{SHOP.TO}}) \sim \mathbf{I}(1)
Y = log(p_t^{\text{SHOP}}) \sim \mathbf{I}(1)
```
2. Estimation of $$\gamma$$ and $$\mu$$ in the regression model:
```math
X = \mu + \gamma Y + \epsilon_t
```


### Using Log Prices

- why do we use log prices

### Notes

- log prices are usually Integrated of order 1
- log returns is more likely to be stationary
- usually we assume that log p is I(1) and that $$\delta$$ log p is stationary
- 


### Estimating our Linear Relationship

There are many ways to estimate what the coefficients that identify our relationship. Two outlined in our reference text are the __multifactor approach__ and the __regression approach__. We dive into details of applying each





# Live Trading

In live trading we need to account for realities of actualizing trades. This comes with costs, and cuts into our theoretical PnL.

# References

1. Pairs Trading Quantitative Methods and Analysis

