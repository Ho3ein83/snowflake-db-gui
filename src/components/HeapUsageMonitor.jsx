import { Typography } from "@mui/material";
import { formatBytes, getAppSettingInt } from "../core/Utils.js";
import React, { useEffect, useState } from "react";
import { useWebSocket } from "../contexts/WebsocketProvider.jsx";
import useTranslate from "../languages/useTranslate.jsx";
import { sparkLineChartSettings } from "./settings.js";
import { SparkLineChart } from "@mui/x-charts";
import useAppContext from "../contexts/AppContext.jsx";
import StatsPermissionMissingNote from "./notes/StatsPermissionMissingNote.jsx";

export default function HeapUsageMonitor(){

    //logDevLow("[Render] HeapUsageMonitor");

    const [usedHeapData, setUsedHeapData] = useState([]);

    const currentAccess = useAppContext(state => state.currentAccess);

    const { helper } = useWebSocket();
    const { __ } = useTranslate();

    useEffect(() => {

        if(!currentAccess.hasAccess("db_stats"))
            return;

        function refreshUsedHeap(){
            helper.fetch("dbStats", {
                parts: ["used_heap"]
            }).then(r => {
                if(r.success) {
                    const { used_heap } = r.data;
                    setUsedHeapData((prev) => {
                        const updated = [...prev, used_heap];
                        // Keep only the last 20 values for better chart readability
                        return updated.length > 20 ? updated.slice(updated.length - 20) : updated;
                    });
                }
            });
        }

        const intervalTime = getAppSettingInt("refresh_interval.used_heap", 0);

        if(intervalTime <= 0){
            refreshUsedHeap();
            return;
        }

        const interval = setInterval(refreshUsedHeap, intervalTime);

        return () => clearInterval(interval);

    }, []);

    if(!currentAccess.hasAccess("db_stats"))
        return <StatsPermissionMissingNote/>;

    return (<>

        <Typography variant="h5" textAlign="center" sx={{ padding: 2 }}>{__("database_heap_memory")}</Typography>

        <SparkLineChart
            data={usedHeapData}
            height={80}
            curve="linear"
            showTooltip
            showHighlight
            area
            valueFormatter={value => formatBytes(value)}
            {...sparkLineChartSettings}
        />

    </>);
}