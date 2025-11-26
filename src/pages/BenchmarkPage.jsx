import { LineChart } from "@mui/x-charts";
import useTranslate from "../languages/useTranslate.jsx";
import { Card, Grid } from "@mui/material";
import { useWebSocket } from "../contexts/WebsocketProvider.jsx";
import { useEffect, useState } from "react";
import useAppContext from "../contexts/AppContext.jsx";
import StatsPermissionMissingNote from "../components/notes/StatsPermissionMissingNote.jsx";
import ChartsLoadingOverlay from "../components/ChartsLoadingOverlay.jsx";
import { logDev, logDevHigh } from "../core/Utils.js";

function EntriesBenchmark() {

    // Loading
    const [isLoading, setIsLoading] = useState(true);

    const [data, setData] = useState({
        read: [0],
        write: [0],
        delete: [0],
    });

    // Socket helper
    const { helper } = useWebSocket();

    // Translation
    const { __, _n } = useTranslate();

    // Snackbar
    const showSnackbar = useAppContext(state => state.showSnackbar);

    const entriesAmount = [1, 10, 100, 1000];

    function reloadData(){
        helper.fetch("benchmark", {
            tests: ["entries"]
        }).then(r => {
            if(r.success){
                const {
                    benchmark: {
                        entries_write: entriesWrite,
                        entries_read: entriesRead,
                        entries_delete: entriesDelete
                    }
                } = r.data;
                if(typeof entriesWrite === "object" && typeof entriesRead === "object" && typeof entriesDelete === "object"){
                    setData(() => {
                        const read = [],
                            write = [],
                            remove = [];
                        for(let [, entry] of Object.entries(entriesRead)){
                            const { time } = entry;
                            read.push(Number(time));
                        }
                        for(let [, entry] of Object.entries(entriesWrite)){
                            const { time } = entry;
                            write.push(Number(time));
                        }
                        for(let [, entry] of Object.entries(entriesDelete)){
                            const { time } = entry;
                            remove.push(Number(time));
                        }
                        return { read, write, delete: remove};
                    });
                }
            }
            else{
                const { msgId } = r.data;
                if(msgId)
                    showSnackbar(__(msgId), "error");
            }
            setIsLoading(false);
        });
    }

    useEffect(() => {
        reloadData();
    }, []);

    return (<>

        {isLoading ? <ChartsLoadingOverlay message={__("loading") + "..."} /> : null}

        <LineChart height={350}
                   xAxis={[{
                       data: entriesAmount,
                       label: __("entries"),
                       scaleType: "point",
                       valueFormatter: (value, context) => {
                           if(context.location === "tooltip")
                               return _n("entries", value);
                           return `${value}`;
                       }
                   }]}
                   yAxis={[
                       {
                           label: __("execution_time_ms"),
                       }
                   ]}
                   series={[
                       {
                           id: "read",
                           data: data.read,
                           label: "Read",
                           labelMarkType: "square",
                           valueFormatter: value => {
                               return `${value} ms`;
                           }
                       },
                       {
                           id: "write",
                           data: data.write,
                           label: "Write",
                           labelMarkType: "square",
                           valueFormatter: value => {
                               return `${value} ms`;
                           }
                       },
                       {
                           id: "delete",
                           data: data.delete,
                           label: "Delete",
                           labelMarkType: "square",
                           valueFormatter: value => {
                               return `${value} ms`;
                           }
                       }
                   ]}
        />

    </>);

}

export default function BenchmarkPage() {

    logDevHigh("[Render] BenchmarkPage");

    const currentAccess = useAppContext(state => state.currentAccess);

    if (!currentAccess.hasAccess("db_stats"))
        return <StatsPermissionMissingNote/>;

    return (
        <>
            <Grid container>

                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
                    <Card>
                        <EntriesBenchmark/>
                    </Card>
                </Grid>

            </Grid>
        </>
    );

}