import React, { useState } from 'react';
import { ComputedFuelEntry } from '../types/fuel';
import { formatDateShort, formatNumber, formatCurrency } from '../utils/formatters';
import { TrendingUp, DollarSign, Gauge, Route } from 'lucide-react';

interface ConsumptionChartProps {
  entries: ComputedFuelEntry[];
}

type MetricType = 'kml' | 'price' | 'distance';

export const ConsumptionChart: React.FC<ConsumptionChartProps> = ({ entries }) => {
  const [metric, setMetric] = useState<MetricType>('kml');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // We want chronological order (earliest to latest) for timeline plotting
  const chronological = [...entries]
    .filter(e => {
      if (metric === 'kml') return typeof e.kmPerLiter === 'number' && e.kmPerLiter > 0;
      if (metric === 'price') return typeof e.pricePerLiter === 'number' && e.pricePerLiter > 0;
      if (metric === 'distance') return typeof e.distance === 'number' && e.distance > 0;
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.odometer - b.odometer);

  if (chronological.length < 2) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center">
        <Gauge className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-300">Gráfico de Evolução</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Adicione pelo menos 2 abastecimentos com quilometragem para visualizar o gráfico de consumo e histórico de preços.
        </p>
      </div>
    );
  }

  // Extract data values
  const dataPoints = chronological.map(e => {
    let val = 0;
    if (metric === 'kml') val = e.kmPerLiter || 0;
    else if (metric === 'price') val = e.pricePerLiter || 0;
    else if (metric === 'distance') val = e.distance || 0;

    return {
      date: e.date,
      value: val,
      entry: e,
    };
  });

  const values = dataPoints.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const avgVal = values.reduce((a, b) => a + b, 0) / values.length;

  // Add 10% padding on min/max
  const range = maxVal - minVal || 1;
  const yMin = Math.max(0, minVal - range * 0.15);
  const yMax = maxVal + range * 0.15;

  // SVG viewBox coordinates
  const width = 800;
  const height = 240;
  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    if (dataPoints.length === 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (dataPoints.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const norm = (val - yMin) / (yMax - yMin);
    return paddingTop + chartHeight - norm * chartHeight;
  };

  // Build SVG path
  const pathData = dataPoints
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(d.value).toFixed(1)}`)
    .join(' ');

  // Area under path
  const areaData = `${pathData} L ${getX(dataPoints.length - 1).toFixed(1)} ${paddingTop + chartHeight} L ${getX(0).toFixed(1)} ${paddingTop + chartHeight} Z`;

  const avgY = getY(avgVal);

  const getMetricLabel = () => {
    if (metric === 'kml') return 'Consumo (km/L)';
    if (metric === 'price') return 'Preço por Litro (R$)';
    return 'Km por Tanque';
  };

  const formatVal = (v: number) => {
    if (metric === 'kml') return `${formatNumber(v, 2)} km/L`;
    if (metric === 'price') return formatCurrency(v);
    return `${formatNumber(v, 0)} km`;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Evolução de Desempenho</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhe a curva de rendimento e custos ao longo dos abastecimentos
          </p>
        </div>

        {/* Metric Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
          <button
            onClick={() => { setMetric('kml'); setHoveredIndex(null); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              metric === 'kml'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Média (km/L)</span>
          </button>

          <button
            onClick={() => { setMetric('price'); setHoveredIndex(null); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              metric === 'price'
                ? 'bg-slate-800 text-amber-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Preço / L</span>
          </button>

          <button
            onClick={() => { setMetric('distance'); setHoveredIndex(null); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              metric === 'distance'
                ? 'bg-slate-800 text-blue-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            <span>Km / Tanque</span>
          </button>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={metric === 'kml' ? '#10b981' : metric === 'price' ? '#f59e0b' : '#3b82f6'}
                stopOpacity="0.25"
              />
              <stop
                offset="100%"
                stopColor={metric === 'kml' ? '#10b981' : metric === 'price' ? '#f59e0b' : '#3b82f6'}
                stopOpacity="0.0"
              />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={width - paddingRight}
            y2={paddingTop}
            stroke="#1e293b"
            strokeDasharray="3 3"
          />
          <text
            x={paddingLeft - 8}
            y={paddingTop + 4}
            textAnchor="end"
            className="text-[10px] fill-slate-500 font-mono"
          >
            {formatNumber(yMax, 1)}
          </text>

          {/* Average Line */}
          <line
            x1={paddingLeft}
            y1={avgY}
            x2={width - paddingRight}
            y2={avgY}
            stroke="#475569"
            strokeDasharray="4 4"
          />
          <text
            x={paddingLeft - 8}
            y={avgY + 3}
            textAnchor="end"
            className="text-[10px] fill-slate-400 font-mono font-medium"
          >
            Média: {formatNumber(avgVal, 1)}
          </text>

          {/* Bottom baseline */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={width - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="#1e293b"
          />
          <text
            x={paddingLeft - 8}
            y={paddingTop + chartHeight + 4}
            textAnchor="end"
            className="text-[10px] fill-slate-500 font-mono"
          >
            {formatNumber(yMin, 1)}
          </text>

          {/* Area fill */}
          <path d={areaData} fill="url(#chartGradient)" />

          {/* Line stroke */}
          <path
            d={pathData}
            fill="none"
            stroke={metric === 'kml' ? '#10b981' : metric === 'price' ? '#f59e0b' : '#3b82f6'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Interactive hovers */}
          {dataPoints.map((d, i) => {
            const x = getX(i);
            const y = getY(d.value);
            const isHovered = hoveredIndex === i;

            return (
              <g key={i} className="cursor-pointer">
                {/* Invisible large touch target */}
                <circle
                  cx={x}
                  cy={y}
                  r="16"
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Point */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill={isHovered ? '#ffffff' : (metric === 'kml' ? '#10b981' : metric === 'price' ? '#f59e0b' : '#3b82f6')}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* Date label at bottom */}
                <text
                  x={x}
                  y={paddingTop + chartHeight + 18}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {formatDateShort(d.date)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && dataPoints[hoveredIndex] && (
          <div
            className="absolute top-2 pointer-events-none bg-slate-950/95 border border-slate-700 rounded-lg p-2.5 shadow-xl text-xs z-10 transition-all duration-75"
            style={{
              left: `${Math.min(
                Math.max(getX(hoveredIndex) - 70, 10),
                width - 160
              )}px`,
            }}
          >
            <div className="font-semibold text-white mb-1 flex items-center justify-between gap-3">
              <span>{formatDateShort(dataPoints[hoveredIndex].date)}</span>
              <span className="font-mono text-emerald-400 font-bold tabular-nums">
                {formatVal(dataPoints[hoveredIndex].value)}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-0.5">
              <div>Odômetro: <span className="font-mono text-slate-200">{formatNumber(dataPoints[hoveredIndex].entry.odometer, 0)} km</span></div>
              {dataPoints[hoveredIndex].entry.distance && (
                <div>Rodados: <span className="font-mono text-slate-200">{formatNumber(dataPoints[hoveredIndex].entry.distance, 0)} km</span></div>
              )}
              {dataPoints[hoveredIndex].entry.daysSinceLast !== undefined && (
                <div>Intervalo: <span className="font-mono text-slate-200">{dataPoints[hoveredIndex].entry.daysSinceLast} dias</span></div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
        <span>Mostrando {dataPoints.length} abastecimentos registrados</span>
        <span className="flex items-center gap-1.5 font-mono">
          <span className="inline-block w-2.5 h-0.5 bg-slate-400"></span>
          <span>Média: <strong>{formatVal(avgVal)}</strong></span>
        </span>
      </div>
    </div>
  );
};
