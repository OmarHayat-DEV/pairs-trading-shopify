## Introduction

Typical in pairs trading, we begin by looking for a pair of securities that have __reasonable justification__ for reacting in tandem to the underlying market conditions.

This reasonable justification sometimes comes from a good intuition or hueristic for how two securities __should__ behave in relation to one another. Then, statisical methods can be applied to support or disprove the initial heuristic.

In this example, we consider the two securities SHOP.TO (traded on the TSX) and SHOP (traded on the NYSE). Since the underlying value for each security is determined by the performance of Shopify the company, we are really betting on the Law of One Price (LOP) (Cochrane, 2005).

We expect that the spread here should be very tight. When we do observe increase in spread, it's a manifestation of inefficiency (lag) in the respective exchanges adherence to the LOP. 

We may futher theorize what caused this inefficiency such as irregular trading behaviour on one exchange or other equity / FX market microstructures, but this is not the focus of our investigation. 

> Note: The LOP gets used in many contexts. In most I find, its brought up as a guiding principle, not a mathematical axiom being applied. I introduce it also in this way. I recommend Cochrane (2005) for a rigorous treatment of this principle. 

## Evaluating Fit for Pairs Trading 

We first observe our two securities of interest, SHOP.TO and SHOP, as raw price time-series in their original currency. Since SHOP is traded as a USD security, to fairly compare it to SHOP.TO we need to convert its value to CAD. We do so using the market end FX exchange rate for that date. Note this is an assumption we make in our analysis, since the FX market end is at 5pm, whereas SHOP.TO and SHOP market end is at 4pm. In practice we would rely on the exchange rate at 4pm. 

<figure>
  <img src="../images/raw-price-series-2yr.svg" alt="Raw SHOP.TO and SHOP price series over the last two years">
</figure>

<figure>
  <img src="../images/raw-fx-series-2yr.svg" alt="CAD/USD exchange rate over the last two years">
</figure>

Adjusting for the exchange rate we see the overlay of the two series in CAD.

<figure>
  <img src="../images/adjusted-price-series-2yr.svg" alt="SHOP.TO and SHOP adjusted to CAD over the last two years">
</figure>

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

In this setting, $$ \epsilon_t $$ is the deviation from our empirical model in raw dollar amounts. This doesn't take into account the deviation relative to the original securities price, which comes with some inconveniences. 

For example, a $$ \$ 50 $$ raw deviation can mean drastically different things depending on the price of the securities. However, if $$ \epsilon_t $$ could represent the relative differences between the underlying securities, it would make interpreting it easier. 

This is why often log series are used in place of raw price series. If instead we let $$ y_t = \text{log} (p_t^A) $$ and $$ x_t = \text{log} (p_t^B) $$, then our model becomes,

<figure>
  <img src="../images/log-price-series-2yr.svg" alt="Log price series over the last two years">
</figure>

```math
y_t = \gamma \cdot x_t + \mu + \epsilon_t
```

where the spread, $$ \epsilon_t $$, now represents the deviation between the log series as described in our model. Isolating for it, we have that,

```math
\epsilon_t = y_t - \gamma x_t - \mu
```

In summary, we first defined an empirical model for how our log price series relate to each other via the linear relationship with estimatable parameters $$ \gamma $$ and $$ \mu $$. Then with these parameters we identify our spread series $$ \epsilon_t $$. 

Picking good estimates for $$ \gamma $$ and $$ \mu $$ can be formulated as solving the optimization problem

```math
(\mu, \gamma) := \underset{(\mu, \gamma)}{\text{arg min}}\ \ \mathcal{L}(\mu,\gamma)
```

for some choice of loss function $$ \mathcal{L} $$. In many cases we take the ordinary least squares (OLS) loss function, namely 

```math
\mathcal{L}(\mu, \gamma) = \sum_t (y_t - \gamma x_t - \mu)^2
```

But, there are many choices for what $$ \mathcal{L} $$ may be. For example, (Vidyamurthy, 2004, Ch. 7) discusses an OLS-like loss function that normalizes each residual term by a special variance term, which changes how deviations are penalized across time .



Once we decide on our parameters, we can identify our spread series $$ \epsilon_t $$. Earlier we mentioned that working with log price series improves the interpretability of the spread series. It also positions the spread series for a more __natural__ test of the statistical property of time series known as __stationarity__. 

Natural in the sense that, if we were working with raw series the range of the spread will likely increase over time as the underlying securities price increases. The data becomes noisier due to this variance overtime in the range of our spread. Think of it like the music getting louder over time. In the log price series spread, we expect the spread to stay roughly the same range.  


This also matters in designing a trading algorithm. Working with the spread for the log price series gives stable variance across time. If we were to work with the price spread series, we would need a variable threshold that adjusts as the underlying asset prices adjusts.


Returning to __stationarity__, this condition will tell us if there is meaningful mean reverting behaviour in the spread series. If so, we can design a trading strategy informed by this mean reversion.

### Stationarity of the Spread

Returning to our pairs example, we identify $$\ \epsilon_{t} \ $$ for the raw price series and log price series, using the full 2 years historic dataset in our OLS regression. 

#### Raw Price Series Spread
<figure>
  <img src="../images/raw-spread-series-2yr.svg" alt="Raw price spread over the last two years">
</figure>

#### Log Price Series Spread
<figure>
  <img src="../images/model-spread-series-2yr.svg" alt="Full-sample OLS log spread over the last two years">
</figure>

As we expect, the log price series spread has less variability on its range, staying stable between $$\pm 0.010 $$. Both however, compared to our original price series, display mean reverting behaviour, at least visually. We can use futher statistical techniques to verify this for certain.


## Making Money on the Spread

We mentioned to make money on the spread we bet on the mean reverting property of the spread. One way to do this is as follows. We begin by keeping a rolling window of our raw price series, and use that data to estimate our regression parameters, $$ \mu $$ and $$ \gamma $$ in our log price series relationship. This then lets us characterize the spread series based on these parameters. 

When the next price data points becomes available to us, we can ask the question, __does the spread series data point characterzied by them fall significantly outside the historic mean of our spread series?__.  If so, we believe this spread will close and we enter the position and exit upon mean reversion. Doing so, we pocket the difference in price series between entry and exit. 

__How is the history defined?__ That is simply our chosen historic window. A pitfall of a __small__ window size it might capture too much noise and a pitfall of a __large__ window size is it might capture signal that is no longer relevant to the current market conditions. Here small and large are relative to our strategy and underlying securities being traded, so we can't make blanket claims on sizing. 

One property of the spread series that can influence our rolling-window (history) size is the half-life of the spread. The half life of the spread is a measure of the average time to mean reversion. In general, we would like our rolling window to contain several full cycles. If our window size is too small, we may encounter something like entering a position without close by the time our rolling window has moved on. 

A protection measure sometimes put in place is incorporating a maximum holding period, which prevents us from further loses if a position has not been closed for substantial time. This maximum hold period is referred to as the __risk-control holding period__. 

__What does it mean to enter / exit the position?__ When we enter a position, we __long__ the security that is under priced and __short__ the security that is over priced. The conditions for entering and exiting can be set as parameters in our trading algorithm. Historic testing can also inform what our thresholds should be in live trading. Different thresholds can change our total PnL on historic data, as evidenced in our dashboard.

As new data arrives we repeat this process, updating our rolling window, recomputing our regression parameters, characterizing our spread, and deciding if we should make an enter, exit, or do nothing call. 

```math

\text{\small estimate } \mu, \gamma

\rightarrow

\text{\small observe } \epsilon_t

\rightarrow

\text{\small determine thresholds}  

\rightarrow

p_{t+1} \ \text{\small arrives}

\rightarrow

\text{\small enter/exit/hold}

\rightarrow

\ \cdots
```
> We estimate $$ \mu $$ and $$ \gamma $$ using the data from $$ \{t-L, t \} $$ where $$ L $$ is the size of our rolling window. At time $$ t+1 $$, it they are estimated using data for points at $$ \{ t - L + 1, t+1 \} $$

### Desinging a Trading Strategy

In our algorithmic design, we have some decisions to make. Some obvious ones are:

- What is a good rolling window size?
- What methods should we use to estimate our regression parameters?
- How should we set our entry / exit thresholds?
- Should we have a max-holding period, and if so how long?

Each of these questions can lead to substatial depth of research. 

For example, when estimating our regression parameters, should we do so with each time step, with each $$ n $$ steps, or have a variable process that determines if recomputing the regression parameters is necessary?

Another question, for our exit conditions, should it be based on the spread at entry time $$ t $$ or based on the spread at a future time $$ t^\prime > t$$?

The above two questions also have interactions between each other, which is something to consider.

In a scenario where the two securities being traded are not as obviously related, we may also have to do extensive testing on their related movement through cointegration testing. In ours, we refrain from cointegration testing because of the nature of the securities.


### Live Trading

In live trading we need to account for realities of actualizing trades. This cuts into our theoretical PnL. Some costs to consider are:
- cost of entering __long__ and __short__ positions
- cost of compute to perform modelling
- cost of sourcing live data


## Dashboard 

The dashboard gives a simple interactive backtest of the rolling-window strategy described above using the last two years of data. It offers three parameters: 
- the lookback period $$ L $$
- the entry z-score threshold
- the exit z-score threshold.

At each time $$ t $$, the model estimates $$ \mu_t $$ and $$ \gamma_t $$ using the previous $$ L $$ observations of the log-price relationship

```math
y_s = \gamma_t x_s + \mu_t + \epsilon_s, \quad s \in \{t-L, \ldots, t-1\}.
```

The current spread is then computed as

```math
\epsilon_t = y_t - \gamma_t x_t - \mu_t.
```
To build threshold bands we isolate $$ p_t^A $$, recall $$ y_t = \text{log}(p_t^A)$$. This gives us,

```math
p_t^A = \exp(\gamma_t x_t + \mu_t + \epsilon_t)
```

To identify the z-score, we standardize this spread using the mean, $$\bar{\epsilon}_{t,L}$$, and standard deviation, $$\ \sigma_{t,L} \ $$,  of the fitted spread over the same lookback window,

```math
z_t = \frac{\epsilon_t - \bar{\epsilon}_{t,L}}{\sigma_{t,L}} \ \implies \epsilon_t = z_t \sigma_{t,L} + \bar{\epsilon}_{t,L}
```

The dashboard also maps these z-score thresholds back into implied SHOP.TO threshold bands. For a threshold $$ z^* $$, the corresponding upper and lower SHOP.TO levels are

```math
p_{upper,t}^A = \exp(\gamma_t x_t + \mu_t + \bar{\epsilon}_{t,L} + z^*\sigma_{t,L})
```

```math
p_{lower,t}^A = \exp(\gamma_t x_t + \mu_t + \bar{\epsilon}_{t,L} - z^*\sigma_{t,L}).
```

The entry bands use the entry z-score threshold and the exit bands use the exit z-score threshold.

If $$ z_t $$ is below the negative entry threshold, the strategy enters a long-spread position: long SHOP.TO and short FX-adjusted SHOP. If $$ z_t $$ is above the positive entry threshold, it enters a short-spread position: short SHOP.TO and long FX-adjusted SHOP. An open position exits once $$ |z_t| $$ falls below the exit threshold.

Each entry uses $$ \$1000 $$ gross exposure, split evenly across the two legs:

```math
\text{gross exposure} = \$500 \text{ long leg} + \$500 \text{ short leg}.
```

This gross exposure is a simplified CAD-equivalent convention. The SHOP.TO leg is already denominated in CAD, while the SHOP leg trades in USD and is converted to CAD in the dashboard using the observed CAD/USD close. In live trading, this would be more nuanced, as PnL is subject to loses from entering / exiting positions.

PnL is marked in CAD using the FX-adjusted SHOP price. Here $$ q_A $$ and $$ q_B $$ are the signed quantities held in the two legs, where $$ A $$ denotes SHOP.TO and $$ B $$ denotes SHOP adjusted to CAD. For a long-spread entry at time $$ \tau $$,

```math
q_A = \frac{500}{p_\tau^A}, \quad q_B = -\frac{500}{p_\tau^B}.
```

For a short-spread entry, the signs reverse:

```math
q_A = -\frac{500}{p_\tau^A}, \quad q_B = \frac{500}{p_\tau^B}.
```

Using these signed quantities, daily PnL is

```math
\text{PnL}_t = q_A(p_t^A - p_{t-1}^A) + q_B(p_t^B - p_{t-1}^B),
```

and the dashboard plots cumulative PnL over time. The cumulative PnL is identified as the running sum of daily PnL's and characterized by the recursive relationship,

```math
\text{CumPnL}_t
=
\text{CumPnL}_{t-1}
+
q_{A,t-1}(p_t^A - p_{t-1}^A)
+
q_{B,t-1}(p_t^B - p_{t-1}^B)
```
where the base case, $$ \text{CumPnL}_0 = 0 $$.

The first chart overlays SHOP.TO with SHOP converted to CAD and shows the implied entry and exit bands. The second shows our cumulative PnL overtime with this strategy, in CAD.

## References

1. Cochrane, J. H. (2005). *Asset Pricing*. Princeton University Press.

2. Vidyamurthy, G. (2004). *Pairs Trading: Quantitative Methods and Analysis*. Wiley.
