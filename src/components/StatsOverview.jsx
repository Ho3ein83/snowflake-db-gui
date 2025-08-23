import EvenTable from "./EvenTable.jsx";
import { Box, Button, Divider, Skeleton, Typography } from "@mui/material";
import useAppContext from "../contexts/AppContext.jsx";
import { useEffect, useState } from "react";
import { useWebSocket } from "../contexts/WebsocketProvider.jsx";
import useTranslate from "../languages/useTranslate.jsx";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { sinceDate } from "../core/Utils.js";
import eventBus from "../core/EventBus.jsx";

export default function StatsOverview(){

    const [isLoading, setIsLoading] = useState(false);

    const [statsData, setStatsData] = useState({
        persistentStatus: "",
        lastPersistent: null,
        lastReload: null
    });

    const currentAccess = useAppContext(state => state.currentAccess);

    const { helper } = useWebSocket();
    const { __ } = useTranslate();

    function refreshDatabaseStats(){

        if(isLoading)
            return;

        setIsLoading(true);

        helper.fetch("dbStats", {
            parts: ["stats"]
        }).then(r => {

            setIsLoading(false);

            if(r.success) {

                const { stats } = r.data;
                setStatsData({
                    persistentStatus: stats.persistentStatus ?? "",
                    lastPersistent: stats.lastPersistent ?? null,
                    lastReload: stats.lastReload ?? 0
                });

            }

        }).catch(() => {
            setIsLoading(false);
        });

    }

    useEffect(() => {

        if(!currentAccess.hasAccess("db_stats"))
            return;

        refreshDatabaseStats();

        eventBus.addEventListener("reload_overview", refreshDatabaseStats);

        return () => {
            eventBus.removeEventListener("reload_overview", refreshDatabaseStats);
        }

    }, []);

    return (<>
        <Box sx={{ padding: 2}}>

            <EvenTable items={[
                {
                    label: "Persistent status",
                    value: (
                        isLoading
                        ?
                        <Skeleton variant="text" width={50} height={20} />
                        :
                        <Typography variant="h5" className={statsData.persistentStatus === "no_change" ? "waiting" : null}>
                            {statsData.persistentStatus !== "no_change" ? <IconDeviceFloppy size={18} color={`var(--sfd-color-${statsData.persistentStatus === "saved" ? "success" : "warning"})`} className="offset b-3 me-4"/> : null}
                            {statsData.persistentStatus ? __(statsData.persistentStatus) : null}
                        </Typography>
                    )
                },
                {
                    label: __("last_persist_call"),
                    value: __(statsData.lastPersistent > 0 ? sinceDate(statsData.lastPersistent) : "never"),
                    tooltip: __("last_persist_call_hint")
                },
                {
                    label: __("last_db_reload"),
                    value: __(statsData.lastReload > 0 ? sinceDate(statsData.lastReload) : "never"),
                    tooltip: __("last_db_reload_hint")
                }
            ]}/>

            <Divider sx={{ margin: "16px 0" }}/>

            <Button variant="outlined" onClick={refreshDatabaseStats} size="small" fullWidth>{__("refresh")}</Button>

        </Box>
    </>);

}