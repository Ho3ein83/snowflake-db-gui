import { Button, Grid, IconButton, Stack, Tooltip } from "@mui/material";
import { formatBytes, LocalDatabase, logDevHigh, snowflakeParse, visualizeValue } from "../core/Utils.js";
import { useWebSocket } from "../contexts/WebsocketProvider.jsx";
import useTranslate from "../languages/useTranslate.jsx";
import useAppContext from "../contexts/AppContext.jsx";
import CardWithIcon from "../components/CardWithIcon.jsx";
import { IconDroplet, IconHash, IconLock, IconLockOpen, IconPencil, IconPlus, IconProgress, IconReload, IconTrash } from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { getDataGridLocale } from "../languages/languages.js";
import DatabaseReadPermissionMissingNote from "../components/notes/DatabaseReadPermissionMissingNote.jsx";
import Spacer from "../components/Spacer.jsx";
import AskDialog from "../components/AskDialog.jsx";
import EntryAdder from "../components/EntryAdder.jsx";
import eventBus from "../core/EventBus.jsx";

const pageSizeOptions = [5, 10, 20, 50, 100];
const defaultPageSize = LocalDatabase.getInt(LocalDatabase.KEY_ENTRIES_PER_PAGE, 10);

export default function DatabasePage(){

    logDevHigh("[Render] DatabasePage");

    // Loading
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // States
    const [databaseStats, setDatabaseStats] = useState({
        entries: 0,
        count: 1,
        encrypted: false,
        usage: 0
    });

    // Pagination
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: pageSizeOptions.includes(defaultPageSize) ? defaultPageSize : pageSizeOptions[0],
    });

    // Grid data
    const [gridRows, setGridRows] = useState([]);
    const [totalRows, setTotalRows] = useState(0);

    // Dialogs state
    const [deletingQueue, setDeletingQueue] = useState({});
    const [entryToDelete, setEntryToDelete] = useState("");
    const [entryToEdit, setEntryToEdit] = useState("");

    // Contexts
    const currentAccess = useAppContext(state => state.currentAccess);
    const currentLanguage = useAppContext(state => state.currentLanguage);
    const showSnackbar = useAppContext(state => state.showSnackbar);

    // Socket helper
    const { helper } = useWebSocket();

    // Translation
    const { __ } = useTranslate();

    const BYTE_UNITS = [__("byte"), __("kilobyte"), __("megabyte"), __("gigabyte")];

    const gridColumns = useMemo(() => {

        return [
            {
                field: "id",
                headerName: __("key_hash"),
                width: 150
            },
            {
                field: "key",
                headerName: __("key_name"),
                width: 200
            },
            {
                field: "value",
                headerName: __("value"),
                width: 250
            },
            {
                field: "type",
                headerName: __("type"),
                width: 150,
                renderCell: params => {
                    const { formattedValue: format } = params;
                    const colors = {
                        string: "var(--sfd-primary)",
                        number: "var(--sfd-color-info)",
                        boolean: "var(--sfd-color-warning)",
                        null: "var(--sfd-color-warning)",
                        undefined: "var(--sfd-color-error)",
                        buffer: "var(--sfd-color-success)",
                        default: "var(--sfd-text-color)"
                    };
                    return <span style={{ color: colors[format] ?? colors["default"] }}>{format}</span>;
                }
            },
            {
                field: "location",
                headerName: __("location"),
                width: 120,
                description: __("meid_file_index"),
            },
            {
                field: "value_size",
                headerName: __("value_size"),
                width: 120,
                renderCell: params => {
                    return formatBytes(params.formattedValue, false, 2, " ", BYTE_UNITS).replace(".00", "");
                }
            },
            {
                field: "total_size",
                headerName: __("total_size"),
                width: 120,
                description: __("value_size") + " + " + __("key_size"),
                renderCell: params => {
                    return formatBytes(params.formattedValue, false, 2, " ", BYTE_UNITS).replace(".00", "");
                }
            },
            {
                field: "actions",
                headerName: __("actions"),
                width: 200,
                sortable: false,
                filterable: false,
                renderCell: params => {
                    const row = params.api.getRow(params.id);
                    const key = row ? row.key : null;
                    if(!key || !currentAccess.hasAccess("db_write"))
                        return __("no_actions");
                    return (
                        <Stack direction="row" alignItems="center" sx={{ paddingTop: 1 }} gap={1}>
                            <Tooltip title={__("edit")}>
                                <IconButton color="primary" onClick={() => setEntryToEdit(key)}
                                            sx={{ bgcolor: "rgba(var(--sfd-primary-rgb),.1)" }}>
                                    <IconPencil size={18}/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={__("delete")} onClick={() => setEntryToDelete(key)}>
                                <IconButton color="error" loading={typeof deletingQueue[key] === "boolean" && deletingQueue[key]}>
                                    <IconTrash size={18}/>
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    )
                }
            }
        ];
    }, [currentLanguage, deletingQueue]);

    function reloadDatabaseStats(useLoading = true){

        if(useLoading)
            setIsLoadingStats(true);

        helper.fetch("dbStats", {
            parts: ["meids_count", "entries_count", "is_encrypted", "usage_bytes"]
        }).then(r => {
            if(r.success){
                const { meids_count, entries_count, is_encrypted, usage_bytes } = r.data;
                setDatabaseStats({
                    encrypted: is_encrypted,
                    count: meids_count,
                    entries: entries_count,
                    usage: usage_bytes
                });
            }
        }).finally(() => {
            setIsLoadingStats(false);
        });

    }

    function reloadDatabaseArchive(){

        setIsLoadingData(true);

        helper.fetch("read", {
            perPage: paginationModel.pageSize,
            currentPage: paginationModel.page
        }).then(r => {
            if(r.success){
                const { list, entriesCount } = r.data;
                if(typeof entriesCount !== "undefined")
                    setTotalRows(parseInt(entriesCount) || 0);
                if(Array.isArray(list)){
                    setGridRows(list.map(item => {
                        // const { key, keyHash, size, index, value, type, totalSize, index } = item;
                        return {
                            id: item.keyHash,
                            key: item.key,
                            value: visualizeValue(snowflakeParse(item.value)),
                            type: item.type,
                            location: "",
                            value_size: item.size,
                            total_size: item.totalSize
                        };
                    }));
                }
            }
            else{
                showSnackbar(__("error_occurred"), "error");
            }
        }).finally(() => {
            setIsLoadingData(false);
        });

    }

    useEffect(() => {
        reloadDatabaseStats();
        reloadDatabaseArchive();
        function reloadStats(){
            reloadDatabaseStats(false);
        }
        eventBus.addEventListener("reload_database", reloadDatabaseArchive);
        eventBus.addEventListener("reload_database_stats", reloadStats);
        return () => {
            eventBus.removeEventListener("reload_database", reloadDatabaseArchive);
            eventBus.removeEventListener("reload_database_stats", reloadStats);
        }
    }, []);

    useEffect(() => {
        LocalDatabase.set(LocalDatabase.KEY_ENTRIES_PER_PAGE, paginationModel.pageSize)
        reloadDatabaseArchive();
    }, [paginationModel]);

    if(!currentAccess.hasAccess("db_read"))
        return <DatabaseReadPermissionMissingNote/>;

    if(gridColumns.length <= 0)
        return null;

    return (<>

        <Grid columns={12} spacing={2} container>

            <Grid size={12}>

                <Grid columns={12} spacing={1} container>

                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <CardWithIcon title={__("database_entries")}
                                      subtitle={databaseStats.entries}
                                      icon={IconDroplet}
                                      loading={isLoadingStats}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <CardWithIcon title={__("database_count")}
                                      subtitle={databaseStats.count}
                                      iconColor="blue"
                                      icon={IconHash}
                                      loading={isLoadingStats}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <CardWithIcon title={__("database_encryption")}
                                      subtitle={__(databaseStats.encrypted ? "encrypted" : "unencrypted")}
                                      iconColor={databaseStats.encrypted ? "green" : "orange"}
                                      icon={databaseStats.encrypted ? IconLock : IconLockOpen}
                                      loading={isLoadingStats}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <CardWithIcon title={__("used_size")}
                                      subtitle={formatBytes(databaseStats.usage, false, 2, " ", BYTE_UNITS).replace(".00", "")}
                                      iconColor="text"
                                      icon={IconProgress}
                                      loading={isLoadingStats}
                        />
                    </Grid>

                </Grid>

            </Grid>

            <Grid size={12}>

                <Stack direction="row" gap={1} flexWrap="wrap">

                    <Button variant="contained" onClick={() => setEntryToEdit(1)} startIcon={<IconPlus size={18} />} size="medium">
                        {__("add_entry")}
                    </Button>

                    <Button variant="outlined" onClick={() => reloadDatabaseArchive()} startIcon={<IconReload size={18} />} size="medium">
                        {__("reload_data")}
                    </Button>

                </Stack>

                <Spacer space={8}/>

                <DataGrid columns={gridColumns}
                          rows={gridRows}
                          localeText={getDataGridLocale(currentLanguage)}
                          loading={isLoadingData}

                          paginationModel={paginationModel}
                          pageSizeOptions={pageSizeOptions}
                          paginationMode="server"

                          rowCount={totalRows}

                          onPaginationModelChange={model => {
                              setPaginationModel(model);
                          }}

                          initialState={{
                              pagination: {
                                  paginationModel: {
                                      pageSize: 5,
                                  },
                              },
                          }}

                          slotProps={{
                              toolbar: {

                              }
                          }}

                          // checkboxSelection
                          disableRowSelectionOnClick
                          showToolbar
                          disableVirtualization
                />

            </Grid>

        </Grid>

        <AskDialog open={entryToDelete}
                   onClose={() => {
                       setEntryToDelete("");
                   }}
                   title={__("delete_confirm")}
                   content={__("delete_confirm_hint")}
                   yesButtonText={__("delete")}
                   noButtonText={__("cancel")}
                   yesButtonColor="error"
                   noButtonColor="error"
                   onAccept={() => {
                       setDeletingQueue(prev => ({ ...prev, [entryToDelete]: true }));
                       helper.fetch("remove", {
                           key: entryToDelete
                       }).then(r => {
                           if(r.success){
                               setGridRows(prev => prev.filter(row => row.key !== entryToDelete));
                               reloadDatabaseStats(false);
                           }
                           else {
                               showSnackbar(__("error_occurred"), "error");
                           }
                       }).catch(() => {
                           showSnackbar(__("error_occurred"), "error");
                       }).finally(() => {
                           setDeletingQueue(prev => {
                               prev[entryToDelete] = null;
                               delete prev[entryToDelete];
                               return {...prev};
                           });
                       });
                   }}
        />

        <EntryAdder open={entryToEdit}
                    keyName={entryToEdit === 1 ? null : entryToEdit}
                    defaultKey={typeof entryToEdit === "string" ? entryToEdit : ""}
                    onClose={() => setEntryToEdit("")}
        />

    </>);

}