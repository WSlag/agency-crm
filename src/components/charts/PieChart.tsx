import { ResponsivePie } from '@nivo/pie';

export interface PieChartData {
  id: string;
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  height?: number;
  colors?: string[];
  innerRadius?: number;
  padAngle?: number;
  enableArcLabels?: boolean;
  enableArcLinkLabels?: boolean;
  arcLinkLabelsColor?: string;
  margin?: { top: number; right: number; bottom: number; left: number };
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 400,
  colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#14b8a6'],
  innerRadius = 0,
  padAngle = 0.7,
  enableArcLabels = true,
  enableArcLinkLabels = true,
  arcLinkLabelsColor = '#6b7280',
  margin = { top: 40, right: 80, bottom: 80, left: 80 },
}) => {
  return (
    <div style={{ height }}>
      <ResponsivePie
        data={data}
        margin={margin}
        innerRadius={innerRadius}
        padAngle={padAngle}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={colors}
        borderWidth={1}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 0.2]],
        }}
        enableArcLabels={enableArcLabels}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [['darker', 2]],
        }}
        enableArcLinkLabels={enableArcLinkLabels}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={arcLinkLabelsColor}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        legends={[
          {
            anchor: 'bottom',
            direction: 'row',
            justify: false,
            translateX: 0,
            translateY: 56,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: '#6b7280',
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 16,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: '#1f2937',
                },
              },
            ],
          },
        ]}
        theme={{
          fontSize: 12,
          textColor: '#6b7280',
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
        ariaLabel="Pie chart"
      />
    </div>
  );
};
