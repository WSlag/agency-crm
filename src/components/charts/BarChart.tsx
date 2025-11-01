import { ResponsiveBar } from '@nivo/bar';

export interface BarChartData {
  [key: string]: string | number;
}

interface BarChartProps {
  data: BarChartData[];
  keys: string[];
  indexBy: string;
  height?: number;
  colors?: string[];
  layout?: 'horizontal' | 'vertical';
  axisBottomLegend?: string;
  axisLeftLegend?: string;
  enableLabel?: boolean;
  enableGridY?: boolean;
  margin?: { top: number; right: number; bottom: number; left: number };
  groupMode?: 'stacked' | 'grouped';
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  keys,
  indexBy,
  height = 400,
  colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'],
  layout = 'vertical',
  axisBottomLegend = '',
  axisLeftLegend = '',
  enableLabel = true,
  enableGridY = true,
  margin = { top: 20, right: 130, bottom: 60, left: 60 },
  groupMode = 'grouped',
}) => {
  return (
    <div style={{ height }}>
      <ResponsiveBar
        data={data}
        keys={keys}
        indexBy={indexBy}
        margin={margin}
        padding={0.3}
        layout={layout}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={colors}
        groupMode={groupMode}
        borderRadius={4}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 1.6]],
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: layout === 'vertical' ? -45 : 0,
          legend: axisBottomLegend,
          legendPosition: 'middle',
          legendOffset: 50,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: axisLeftLegend,
          legendPosition: 'middle',
          legendOffset: -50,
        }}
        enableLabel={enableLabel}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: 'color',
          modifiers: [['darker', 1.6]],
        }}
        enableGridY={enableGridY}
        legends={[
          {
            dataFrom: 'keys',
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: 120,
            translateY: 0,
            itemsSpacing: 2,
            itemWidth: 100,
            itemHeight: 20,
            itemDirection: 'left-to-right',
            itemOpacity: 0.85,
            symbolSize: 16,
            effects: [
              {
                on: 'hover',
                style: {
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
        role="application"
        ariaLabel="Bar chart"
        barAriaLabel={(e) =>
          `${e.id}: ${e.formattedValue} in ${indexBy}: ${e.indexValue}`
        }
      />
    </div>
  );
};
