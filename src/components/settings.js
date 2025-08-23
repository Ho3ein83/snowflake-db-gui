import { areaElementClasses, chartsAxisHighlightClasses, lineElementClasses } from "@mui/x-charts";

export const sparkLineChartSettings = {
    baseline: 'min',
    margin: { bottom: 0, top: 5, left: 4, right: 0 },

    sx: {
        [`& .${areaElementClasses.root}`]: { opacity: 0.2 },
        [`& .${lineElementClasses.root}`]: { strokeWidth: 3 },
        [`& .${chartsAxisHighlightClasses.root}`]: {
            stroke: 'rgb(137, 86, 255)',
            strokeDasharray: 'none',
            strokeWidth: 2,
        }
    },
    slotProps: {
        lineHighlight: { r: 4 }, // Reduce the radius of the axis highlight.
    },
    clipAreaOffset: { top: 2, bottom: 2 },
};