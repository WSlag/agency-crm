import { ResponsiveLine } from '@nivo/line';

export interface LineChartData {
  id: string;
  data: {
    x: string | number;
    y: number;
  }[];
}

interface LineChartProps {
  data: LineChartData[];
  height?: number;
  colors?: string[];
  enableArea?: boolean;
  enablePoints?: boolean;
  axisBottomLegend?: string;
  axisLeftLegend?: string;
  curve?: 'linear' | 'monotoneX' | 'monotoneY' | 'natural' | 'step' | 'stepBefore' | 'stepAfter';
  enableGridX?: boolean;
  enableGridY?: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 400,
  colors = ['#6366f1', '#8b5cf6', '#ec4899'],
  enableArea = false,
  enablePoints = true,
  axisBottomLegend = '',
  axisLeftLegend = '',
  curve = 'monotoneX',
  enableGridX = false,
  enableGridY = true,
  margin = { top: 20, right: 20, bottom: 60, left: 60 },
}) => {
  return (
    <div style={{ height }}>
      <ResponsiveLine
        data={data}
        margin={margin}
        xScale={{ type: 'point' }}
        yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: false,
          reverse: false,
        }}
        curve={curve}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: axisBottomLegend,
          legendOffset: 50,
          legendPosition: 'middle',
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: axisLeftLegend,
          legendOffset: -50,
          legendPosition: 'middle',
        }}
        colors={colors}
        pointSize={enablePoints ? 8 : 0}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        enableArea={enableArea}
        areaOpacity={0.15}
        useMesh={true}
        enableGridX={enableGridX}
        enableGridY={enableGridY}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 100,
            translateY: 0,
            itemsSpacing: 0,
            itemDirection: 'left-to-right',
            itemWidth: 80,
            itemHeight: 20,
            itemOpacity: 0.75,
            symbolSize: 12,
            symbolShape: 'circle',
            symbolBorderColor: 'rgba(0, 0, 0, .5)',
            effects: [
              {
                on: 'hover',
                style: {
                  itemBackground: 'rgba(0, 0, 0, .03)',
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
        theme={{
          fontSize: 12,
          textColor: '#6b7280',
          grid: {
            line: {
              stroke: '#e5e7eb',
              strokeWidth: 1,
            },
          },
          tooltip: {
            container: {
              background: '#ffffff',
              color: '#1f2937',
              fontSize: 12,
              borderRadius: 8,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '8px 12px',
            },
          },
        }}
      />
    </div>
  );
};
