import { PieChart, PieChartData } from './PieChart';

interface DonutChartProps {
  data: PieChartData[];
  height?: number;
  colors?: string[];
  innerRadius?: number;
  centerLabel?: string;
  centerValue?: string | number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  height = 400,
  colors,
  innerRadius = 0.6,
  centerLabel,
  centerValue,
  margin,
}) => {
  return (
    <div className="relative">
      <PieChart
        data={data}
        height={height}
        colors={colors}
        innerRadius={innerRadius}
        margin={margin}
        enableArcLinkLabels={false}
      />
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <div className="text-3xl font-bold text-gray-900">
              {centerValue}
            </div>
          )}
          {centerLabel && (
            <div className="text-sm text-gray-500 mt-1">
              {centerLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
