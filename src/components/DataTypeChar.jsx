import { Alert, CircularProgress, Collapse, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { IconReload } from "@tabler/icons-react";
import { PieChart } from "@mui/x-charts";
import Spacer from "./Spacer.jsx";
import React, { useEffect, useState } from "react";
import useTranslate from "../languages/useTranslate.jsx";
import { useWebSocket } from "../contexts/WebsocketProvider.jsx";
import useError from "../hooks/useError.js";
import { getAppSettingInt, logDevLow } from "../core/Utils.js";
import useAppContext from "../contexts/AppContext.jsx";
import StatsPermissionMissingNote from "./notes/StatsPermissionMissingNote.jsx";
import { ChartLocaleProvider } from "../languages/ChartLocaleProvider.jsx";

const COLORS = [
    "var(--sfd-primary)",
    "var(--sfd-color-error)",
    "var(--sfd-color-success)",
    "var(--sfd-color-info)",
    "var(--sfd-color-warning)",
    "var(--sfd-secondary)",
    "var(--sfd-color-cyan)",
];

const COLORS_MAP = {
    string: 0,
    number: 1,
    boolean: 2,
    array: 3,
    object: 4,
    buffer: 5,
    null: 6,
};

const CHART_WIDTH = 210;
const CHART_HEIGHT = 210;

export default function DataTypeChar(){

    logDevLow("[Render] DataTypeChar");

    const [isLoading, setIsLoading] = useState(true);
    const [typesData, setTypesData] = useState([]);

    const [showError, errorText, setShowError, setErrorText] = useError();

    const currentAccess = useAppContext(state => state.currentAccess);

    const { helper } = useWebSocket();
    const { __ } = useTranslate();

    function refreshAnalyze(){
        setIsLoading(true);
        helper.fetch("dataTypeAnalyze").then(r => {
            setIsLoading(false);
            if(r.success){
                const { analyzed } = r.data;
                if(typeof analyzed === "object"){
                    let list = [];
                    for (const type of ["string", "boolean", "number", "array", "object", "buffer", "null"]) {
                        if(typeof analyzed[type] === "number"){
                            list.push({
                                value: analyzed[type],
                                label: type,
                                color: COLORS[COLORS_MAP[type] ?? 0]
                            });
                        }
                    }
                    setTypesData(list);
                }
            }
            else{
                setShowError(true);
                setErrorText(__(r.data.msgId || "error_occurred"));
            }
        }).catch(() => {
            setIsLoading(false);
            setShowError(true);
            setErrorText(__("error_occurred"));
        });
    }

    useEffect(() => {

        if(!currentAccess.hasAccess("db_stats"))
            return;

        const intervalTime = getAppSettingInt("refresh_interval.type_analyze", 0);

        if(intervalTime <= 0){
            refreshAnalyze();
            return;
        }

        const interval = setInterval(refreshAnalyze, intervalTime);

        return () => clearInterval(interval);

    }, []);

    if(!currentAccess.hasAccess("db_stats"))
        return <StatsPermissionMissingNote/>;

    return (<>

        <Tooltip title={__("refresh")}>
            <IconButton onClick={refreshAnalyze} sx={{ position: "absolute", top: 0, left: 0, margin: 1 }}>
                <IconReload size={20}/>
            </IconButton>
        </Tooltip>

        <Typography variant="h5" textAlign="center" sx={{ padding: 2 }}>{__("data_type_analyze")}</Typography>

        <Collapse in={showError}>
            <div style={{ padding: "8px 16px 0" }}>
                <Alert severity="error">
                    <Typography>{errorText}</Typography>
                </Alert>
            </div>
        </Collapse>

        {
            !isLoading
            ?
            (
                showError
                ?
                null
                :
                <ChartLocaleProvider>
                    <PieChart
                        width={CHART_WIDTH}
                        height={CHART_HEIGHT}
                        colors={COLORS}
                        series={[
                            {
                                data: typesData,
                                innerRadius: 60,
                                outerRadius: 100,
                                paddingAngle: 2,
                                cornerRadius: 4,
                                startAngle: 0,
                                endAngle: 360,
                                cx: 100,
                                cy: 100
                            }
                        ]}

                    />
                </ChartLocaleProvider>
            )
            :
            <Stack direction="column" alignItems="center" justifyContent="center"
                   sx={{ width: CHART_WIDTH, height: CHART_HEIGHT, margin: "auto" }}>
                <CircularProgress size={30}/>
            </Stack>
        }

        <Spacer space={16}/>

    </>);
}