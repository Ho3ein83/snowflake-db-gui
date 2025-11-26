import { Typography } from "@mui/material";

export default function ChartsLoadingOverlay({ message, ...props }){

    return (<div className="ChartOverlay">
        <Typography>{message}</Typography>
    </div>);

}