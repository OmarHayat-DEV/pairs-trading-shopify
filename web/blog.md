# Introduction

Typical in pairs trading, we begin by looking for a pair of securities that have __reasonable justification__ for reacting in tandem to the underlying market conditions.

This reasonable justification sometimes comes from a good intuition or hueristic for how two securities __should__ behave in relation to one another. Then, statisical methods can be applied to support or disprove the initial heuristic.

In this example, we consider the two securities SHOP.TO (traded on the TSX) and SHOP (traded on the NYSE). Since the underlying value for each security is determined by the performance of Shopify the company, we are really betting on the Law of One Price (LOP) (cochrane, 2005).

We expect that the spread here should be very tight. When we do observe increase in spread, it's a manifestation of inefficiency (lag) in the respective exchanges adherence to the LOP. 

We may futher theorize what caused this inefficiency such as irregular trading behaviour on one exchange or other equity / FX market microstructures, but this is not the focus of our investigation. 


# Evaluating Fit for Pairs Trading 

We first observe our two securities of interest, SHOP.TO and SHOP, as raw time series in their original currency. Since SHOP is traded as a USD security, to fairly compare it to SHOP.TO we need to convert its value to CAD. We do so using the market end FX exchange rate for that date. Note this is an assumption we make in our analysis, since the FX market end is at 5pm, whereas SHOP.TO and SHOP market end is at 4pm. In practice we would rely on the exchange rate at 4pm. 

**GRAPH OF SHOP.TO, SHOP, FX RATE**

Adjusting for the exchange rate we see the overlay of the two series in CAD.

**GRAPH OF SHOP.TO and SHOP adjusted using FX Rate**

Reading a price graph alone does little good in determining fit for trading. Instead, we turn to statistical tools to test the relationship between these two time series.  

In the introduction, we mentioned that we want to find stocks that react in tandem to market conditions. A naive way to model this is to assume that the two price series are related by a constant multiple at each time step. Using short-hand $$A = SHOP.TO$$ and $$B = SHOP$$, this comes out to

```math
 p_t^A = \gamma \cdot p_t^B
```

where $$ p_t^A $$ and $$ p_t^B  = p_t^{FX} \cdot p_t^{B_{USD}} $$ denote price at time $$ t $$ in CAD and $$ \beta > 0 $$ denotes some scalar. If we have evidence to believe this relationship, our arbitrage opportunity comes from betting on the deviation from this relationship, expecting it to revert.

This model however is limiting in its descriptive power for a price series. For example, it forces a strict equilibrium around $$ 0 $$. In practice, our securities might be centered around a shared long term mean, $$ \mu > 0 $$, and our trading signal becomes deviation from this mean. Mathematically this translates to,

```math
 p_t^A = \gamma \cdot p_t^B + \mu.
```

In real world trading, this relationship is almost guaranteed to not hold exactly, and the deviation from this at time $$ t $$ is referred to as the spread, which we denote $$ \epsilon_t $$. Adding this to our modelling we have,

```math
p_t^A = \gamma \cdot p_t^B + \mu + \epsilon_t.
```

In this setting, $$ \epsilon_t $$ is the deviation from our empirical model in raw dollar amounts. This doesn't take into account the deviation relative to the original securities price, which comes with some inconveniences. For example, a $$ \$ 50 $$ raw deviation can mean drastically different things depending on the price of the securities. However, if $$ \epsilon_t $$ could represent the relative differences between the underlying securities, it would make interpreting it easier. 

This is why often log series are used in place of raw price series. If instead we let $$ y_t = \text{log} (p_t^A) $$ and $$ x_t = \text{log} (p_t^B) $$, then our model becomes,

```math
y_t = \gamma \cdot x_t + \mu + \epsilon_t
```

where the spread, $$ \epsilon_t $$, now represents the deviation between the log series as described in our model. Isolating for it, we have that,

```math
\epsilon_t = y_t - \gamma x_t - \mu
```

In summary, we first defined an empirical model for how our log price series relate to each other via the linear relationship with estimatable parameters $$ \gamma $$ and $$ \mu $$. Then with these parameters we define our spread series $$ \epsilon_t $$. 

Picking good estimates for $$ \gamma $$ and $$ \mu $$ can be described as solving the optimization problem

```math
\text{arg min}_{(\mu, \gamma)} \ \ \mathcal{L}(\mu,\gamma)
```

for some choice of loss function $$ \mathcal{L} $$. In many cases we take the ordinary least squares (OLS) loss function, namely 

```math
\mathcal{L} = \sum_t (y_t - \gamma x_t - \mu)^2
```

But, there are many choices for what $$ \mathcal{L} $$ may be, for example in (pairs trading book) Ch 7, they discuss a choice for $$ \mathcal{L} $$ that resembles the OLS except at each $$ t $$ there is a special normalization by a variance term.

Once we decide on our parameters, we can observe our spread series $$ \epsilon_t $$. Earlier we mentioned that working with log price series improves the interpretability of the spread series. It also positions the spread series for a more natural test of the statistical property of time series known as __stationarity__. 

Natural in the sense that, if we were working with raw series the range of the spread will likely increase over time as the underlying securities price increases. The data becomes noisier due to this variance overtime in the range of our spread. Think of it like the music getting louder over time. In the log price series spread, we expect the spread to stay roughly the same range.  

This also matters in designing a trading algorithm. Working with the spread for the log price series gives stable variance across time. If we were to work with the price spread series, we would need a variable threshold that adjusts as the underlying asset prices adjusts.

This condition will tell us if there is meaningful mean reverting behaviour in the spread series, and if so, we can design a trading strategy informed by this mean reversion.




So, we turn to more sophisticated statistical machinery to talk about the movement of two price series in tandem, namely __cointegration__.  


> Note: The LOP gets used in many contexts. In most I find, its brought up as a guiding principle, not a mathematical axiom being applied. I introduce it also in this way. I can recommend (cochrane, 2005) for a rigorous treatment of this principle. 


### Cointegration

# Summary

```math
\text{estimate } \hat{\mu},\hat{\gamma}

\rightarrow

\text{compute spread}

\rightarrow

\text{compute z-score}

\rightarrow

\text{enter/exit/hold}

\rightarrow

\text{move window forward}

\rightarrow

\text{repeat.}
```

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


### Estimating our Linear Relationship

There are many ways to estimate what the coefficients that identify our relationship. Two outlined in our reference text are the __multifactor approach__ and the __regression approach__. We dive into details of applying each


- for estimating the linear relationship with the regression approach, you can do OLS (easy) or the more involved chi-squared regression which involves estimating $$\text{var}(\epsilon_t^A)$$ and $$\text{var}(\epsilon_t^B)$$
    - with just the market end price, we cannot estimate this relationship



# Live Trading

In live trading we need to account for realities of actualizing trades. This comes with costs, and cuts into our theoretical PnL.

# References

1. Pairs Trading Quantitative Methods and Analysis
2. Cochrane, 2005, Asset Pricing
