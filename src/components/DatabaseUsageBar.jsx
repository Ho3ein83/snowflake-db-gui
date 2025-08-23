import { CircularProgress, Collapse, IconButton, Skeleton, Stack, Tooltip, Typography } from "@mui/material";
import useTranslate from "../languages/useTranslate.jsx";
import React, { useEffect, useState } from "react";
import { useWebSocket } from "../contexts/WebsocketProvider.jsx";
import EvenTable from "./EvenTable.jsx";
import { IconReload, IconLock, IconLockOpen2 } from "@tabler/icons-react";
import Spacer from "./Spacer.jsx";
import { logDevLow } from "../core/Utils.js";
import useAppContext from "../contexts/AppContext.jsx";

export default function DatabaseUsageBar() {

    logDevLow("[Render] DatabaseUsageBar");

    // Loading
    const [isLoading, setIsLoading] = useState(true);

    // Values
    const [databaseInfo, setDatabaseInfo] = useState({
        memoryMonitor: false,
        usagePercent: 0,
        usageFormatted: "",
        maxDatabaseSize: "",
        isEncrypted: false
    });

    const currentAccess = useAppContext(state => state.currentAccess);
    const { __ } = useTranslate();
    const { helper } = useWebSocket();

    function reload() {
        setIsLoading(true);
        helper.fetchWithMinDelay("dbStats", {
            parts: ["usage_formatted", "usage_percent", "max_db_size_formatted", "is_encrypted", "memory_monitor"]
        }, 300).then(r => {
            if(r.success){
                const { usage_formatted, usage_percent, max_db_size_formatted, is_encrypted, memory_monitor } = r.data;
                setDatabaseInfo(prev => ({
                    ...prev,
                    memoryMonitor: memory_monitor,
                    usagePercent: usage_percent,
                    usageFormatted: usage_formatted,
                    maxDatabaseSize: max_db_size_formatted,
                    isEncrypted: is_encrypted
                }));
                setIsLoading(false);
            }
            else{
                console.log("Failed:", r.data.msg);
            }
        }).catch(e => {
            console.log("Ping Err:", e);
        });
    }

    useEffect(() => reload(), []);

    if(!currentAccess.hasAccess("db_stats")){
        return <Typography variant="body1" textAlign="center" className="waiting">
            <IconLock size={20} className="offset b-3 me-4" />
            {__("stats_permission_missing")}
        </Typography>;
    }

    if(!isLoading && !databaseInfo.memoryMonitor){
        return <Typography variant="body1" textAlign="center" className="waiting">{__("memory_monitor_disabled_hint")}</Typography>;
    }

    return (<>

        {!isLoading ? <Tooltip title={__("refresh")}>
            <IconButton onClick={reload} sx={{ position: "absolute", top: 0, left: 0, margin: 1 }}>
                <IconReload size={20}/>
            </IconButton>
        </Tooltip> : null}

        <div className="LabeledCircularProgressContainer">

            {isLoading ? <CircularProgress variant="indeterminate" size={150} thickness={1}/> : <CircularProgress variant="determinate" value={databaseInfo.usagePercent} size={150} thickness={1} />}

            <Stack direction="column" alignItems="center" justifyContent="center" className="--container" textAlign="center">

                {
                    isLoading
                    ?
                    <Skeleton variant="text" width={70} height={28}/>
                    :
                    <Typography variant="h3" dir={"ltr"}>{databaseInfo.usageFormatted}</Typography>
                }

                {
                    isLoading
                    ?
                    <Skeleton variant="text" width={40} height={21}/>
                    :
                    <Typography variant="h5" className="waiting">{databaseInfo.usagePercent.toString().replace(/\.\d{2}/g, "")} %</Typography>
                }

            </Stack>

        </div>

        <Collapse in={!isLoading} unmountOnExit={true}>

            <Spacer space={16} />

            <EvenTable divider={true}
                       items={[
                           {
                               label: __("database_usage"),
                               value: `${databaseInfo.usagePercent} %`
                           },
                           {
                               label: __("max_size"),
                               value: databaseInfo.maxDatabaseSize
                           },
                           {
                               label: __("used_size"),
                               value: databaseInfo.usageFormatted
                           },
                           {
                               label: __("encrypted"),
                               value: (
                                   <Stack direction="row" gap={1}>
                                       {databaseInfo.isEncrypted ? <IconLock color="var(--sfd-color-success)" size={18}/> : <IconLockOpen2 color="var(--sfd-color-error)" size={18}/>}
                                       <Typography>{databaseInfo.isEncrypted ? __("yes") : __("no")}</Typography>
                                   </Stack>
                               )
                           }
                       ]}
            />

        </Collapse>

    </>);

}