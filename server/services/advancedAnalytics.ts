import * as ss from 'simple-statistics';
import { linearRegression, linearRegressionLine } from 'simple-statistics';

export interface StatisticalTest {
  test: string;
  pValue: number;
  statistic: number;
  significant: boolean;
  interpretation: string;
}

export interface PredictiveModel {
  type: string;
  accuracy?: number;
  predictions: { x: number; y: number; predicted: number }[];
  coefficients?: any;
  rmse?: number;
}

export interface AnomalyDetection {
  anomalies: any[];
  method: string;
  threshold: number;
  totalAnomalies: number;
}

export class AdvancedAnalyticsService {
  // Statistical Significance Testing
  static performTTest(data1: number[], data2: number[]): StatisticalTest {
    const mean1 = ss.mean(data1);
    const mean2 = ss.mean(data2);
    const variance1 = ss.variance(data1);
    const variance2 = ss.variance(data2);
    const n1 = data1.length;
    const n2 = data2.length;

    // Welch's t-test
    const t = (mean1 - mean2) / Math.sqrt(variance1/n1 + variance2/n2);
    const df = Math.pow(variance1/n1 + variance2/n2, 2) / 
                (Math.pow(variance1/n1, 2)/(n1-1) + Math.pow(variance2/n2, 2)/(n2-1));
    
    // Approximate p-value (simplified)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(t)));

    return {
      test: "Welch's t-test",
      pValue,
      statistic: t,
      significant: pValue < 0.05,
      interpretation: pValue < 0.05 
        ? "There is a statistically significant difference between the two groups"
        : "No statistically significant difference found between the groups"
    };
  }

  static performChiSquareTest(observed: number[], expected: number[]): StatisticalTest {
    let chiSquare = 0;
    for (let i = 0; i < observed.length; i++) {
      chiSquare += Math.pow(observed[i] - expected[i], 2) / expected[i];
    }

    const df = observed.length - 1;
    // Simplified p-value calculation
    const pValue = 1 - this.chiSquareCDF(chiSquare, df);

    return {
      test: "Chi-square test",
      pValue,
      statistic: chiSquare,
      significant: pValue < 0.05,
      interpretation: pValue < 0.05
        ? "The observed frequencies differ significantly from expected frequencies"
        : "No significant difference between observed and expected frequencies"
    };
  }

  // Predictive Modeling
  static buildLinearRegressionModel(data: { x: number; y: number }[]): PredictiveModel {
    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);

    const regression = linearRegression([xValues, yValues]);
    const line = linearRegressionLine(regression);

    // Calculate predictions and RMSE
    const predictions = data.map(d => ({
      x: d.x,
      y: d.y,
      predicted: line(d.x)
    }));

    const rmse = Math.sqrt(
      ss.mean(predictions.map(p => Math.pow(p.y - p.predicted, 2)))
    );

    return {
      type: "Linear Regression",
      predictions,
      coefficients: { slope: regression.m, intercept: regression.b },
      rmse,
      accuracy: 1 - (rmse / ss.standardDeviation(yValues))
    };
  }

  static buildPolynomialRegressionModel(data: { x: number; y: number }[], degree: number = 2): PredictiveModel {
    // Simplified polynomial regression
    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);

    // Create polynomial features
    const features: number[][] = [];
    for (let i = 0; i < xValues.length; i++) {
      const row = [];
      for (let j = 0; j <= degree; j++) {
        row.push(Math.pow(xValues[i], j));
      }
      features.push(row);
    }

    // Solve using normal equation (simplified)
    // In production, use a proper matrix library
    const coefficients = this.solveNormalEquation(features, yValues);

    const predictions = data.map(d => {
      let predicted = 0;
      for (let j = 0; j <= degree; j++) {
        predicted += coefficients[j] * Math.pow(d.x, j);
      }
      return { x: d.x, y: d.y, predicted };
    });

    const rmse = Math.sqrt(
      ss.mean(predictions.map(p => Math.pow(p.y - p.predicted, 2)))
    );

    return {
      type: `Polynomial Regression (degree ${degree})`,
      predictions,
      coefficients,
      rmse,
      accuracy: 1 - (rmse / ss.standardDeviation(yValues))
    };
  }

  // Anomaly Detection
  static detectAnomaliesZScore(data: number[], threshold: number = 3): AnomalyDetection {
    const mean = ss.mean(data);
    const stdDev = ss.standardDeviation(data);

    const anomalies = data.map((value, index) => {
      const zScore = Math.abs((value - mean) / stdDev);
      return { index, value, zScore, isAnomaly: zScore > threshold };
    }).filter(item => item.isAnomaly);

    return {
      anomalies,
      method: "Z-Score",
      threshold,
      totalAnomalies: anomalies.length
    };
  }

  static detectAnomaliesIQR(data: number[]): AnomalyDetection {
    const sorted = [...data].sort((a, b) => a - b);
    const q1 = ss.quantile(sorted, 0.25);
    const q3 = ss.quantile(sorted, 0.75);
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    const anomalies = data.map((value, index) => ({
      index,
      value,
      isAnomaly: value < lowerBound || value > upperBound,
      bounds: { lower: lowerBound, upper: upperBound }
    })).filter(item => item.isAnomaly);

    return {
      anomalies,
      method: "Interquartile Range (IQR)",
      threshold: 1.5,
      totalAnomalies: anomalies.length
    };
  }

  static detectAnomaliesIsolationForest(data: any[], features: string[]): AnomalyDetection {
    // Simplified isolation forest implementation
    // In production, use a proper ML library
    const anomalyScores = data.map((row, index) => {
      let score = 0;
      
      // Calculate anomaly score based on feature values
      features.forEach(feature => {
        const values = data.map(d => d[feature]);
        if (typeof values[0] === 'number') {
          const mean = ss.mean(values);
          const stdDev = ss.standardDeviation(values);
          const zScore = Math.abs((row[feature] - mean) / stdDev);
          score += zScore;
        }
      });

      return {
        index,
        data: row,
        anomalyScore: score / features.length,
        isAnomaly: score / features.length > 2.5
      };
    });

    const anomalies = anomalyScores.filter(item => item.isAnomaly);

    return {
      anomalies,
      method: "Isolation Forest",
      threshold: 2.5,
      totalAnomalies: anomalies.length
    };
  }

  // Time Series Analysis
  static performSeasonalDecomposition(data: { date: Date; value: number }[]): any {
    // Simplified seasonal decomposition
    const values = data.map(d => d.value);
    const period = 12; // Assume monthly seasonality

    // Calculate trend using moving average
    const trend = this.movingAverage(values, period);

    // Calculate seasonal component
    const detrended = values.map((v, i) => v - (trend[i] || ss.mean(values)));
    const seasonal = this.calculateSeasonalComponent(detrended, period);

    // Calculate residual
    const residual = values.map((v, i) => 
      v - (trend[i] || ss.mean(values)) - seasonal[i % period]
    );

    return {
      trend,
      seasonal,
      residual,
      original: values
    };
  }

  static forecastARIMA(data: number[], periods: number): number[] {
    // Simplified ARIMA forecast (AR(1) model)
    const mean = ss.mean(data);
    const lastValue = data[data.length - 1];
    const phi = 0.8; // AR coefficient (simplified)

    const forecast: number[] = [];
    let prevValue = lastValue;

    for (let i = 0; i < periods; i++) {
      const nextValue = mean + phi * (prevValue - mean);
      forecast.push(nextValue);
      prevValue = nextValue;
    }

    return forecast;
  }

  // Helper functions
  private static normalCDF(x: number): number {
    // Approximate normal CDF using error function
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private static erf(x: number): number {
    // Approximate error function
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private static chiSquareCDF(x: number, df: number): number {
    // Simplified chi-square CDF approximation
    // In production, use a proper statistics library
    if (x <= 0) return 0;
    
    const k = df / 2;
    const gammaK = this.gamma(k);
    
    return this.lowerIncompleteGamma(k, x / 2) / gammaK;
  }

  private static gamma(n: number): number {
    // Stirling's approximation for gamma function
    if (n < 0.5) return Math.PI / (Math.sin(Math.PI * n) * this.gamma(1 - n));
    
    n -= 1;
    const x = 0.99999999999980993;
    const coefficients = [
      676.5203681218851, -1259.1392167224028, 771.32342877765313,
      -176.61502916214059, 12.507343278686905, -0.13857109526572012,
      9.9843695780195716e-6, 1.5056327351493116e-7
    ];

    for (let i = 0; i < coefficients.length; i++) {
      x += coefficients[i] / (n + i + 1);
    }

    const t = n + coefficients.length - 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
  }

  private static lowerIncompleteGamma(a: number, x: number): number {
    // Simplified lower incomplete gamma function
    // Series expansion for small x
    if (x < a + 1) {
      let sum = 0;
      let term = 1 / a;
      for (let n = 0; n < 100; n++) {
        sum += term;
        term *= x / (a + n + 1);
        if (Math.abs(term) < 1e-10) break;
      }
      return sum * Math.pow(x, a) * Math.exp(-x);
    }
    
    // Continued fraction for large x
    return this.gamma(a) - this.upperIncompleteGamma(a, x);
  }

  private static upperIncompleteGamma(a: number, x: number): number {
    // Simplified upper incomplete gamma using continued fraction
    let b = x + 1 - a;
    let c = 1 / 1e-30;
    let d = 1 / b;
    let h = d;

    for (let i = 1; i < 100; i++) {
      const an = -i * (i - a);
      b += 2;
      d = an * d + b;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = b + an / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      const delta = d * c;
      h *= delta;
      if (Math.abs(delta - 1) < 1e-10) break;
    }

    return Math.exp(-x + a * Math.log(x) - this.logGamma(a)) * h;
  }

  private static logGamma(x: number): number {
    return Math.log(this.gamma(x));
  }

  private static solveNormalEquation(X: number[][], y: number[]): number[] {
    // Simplified normal equation solver (X'X)^-1 X'y
    // In production, use a proper linear algebra library
    const n = X.length;
    const p = X[0].length;
    
    // Calculate X'X
    const XtX: number[][] = Array(p).fill(0).map(() => Array(p).fill(0));
    for (let i = 0; i < p; i++) {
      for (let j = 0; j < p; j++) {
        for (let k = 0; k < n; k++) {
          XtX[i][j] += X[k][i] * X[k][j];
        }
      }
    }

    // Calculate X'y
    const Xty: number[] = Array(p).fill(0);
    for (let i = 0; i < p; i++) {
      for (let k = 0; k < n; k++) {
        Xty[i] += X[k][i] * y[k];
      }
    }

    // Solve using Gaussian elimination (simplified)
    return this.gaussianElimination(XtX, Xty);
  }

  private static gaussianElimination(A: number[][], b: number[]): number[] {
    const n = A.length;
    const aug = A.map((row, i) => [...row, b[i]]);

    // Forward elimination
    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
          maxRow = k;
        }
      }
      [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];

      for (let k = i + 1; k < n; k++) {
        const factor = aug[k][i] / aug[i][i];
        for (let j = i; j <= n; j++) {
          aug[k][j] -= factor * aug[i][j];
        }
      }
    }

    // Back substitution
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = aug[i][n];
      for (let j = i + 1; j < n; j++) {
        x[i] -= aug[i][j] * x[j];
      }
      x[i] /= aug[i][i];
    }

    return x;
  }

  private static movingAverage(data: number[], period: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
        result.push(sum / period);
      }
    }
    return result;
  }

  private static calculateSeasonalComponent(data: number[], period: number): number[] {
    const seasonal: number[] = [];
    
    for (let i = 0; i < period; i++) {
      const values = [];
      for (let j = i; j < data.length; j += period) {
        values.push(data[j]);
      }
      seasonal.push(ss.mean(values));
    }

    // Normalize seasonal component
    const meanSeasonal = ss.mean(seasonal);
    return seasonal.map(s => s - meanSeasonal);
  }
}