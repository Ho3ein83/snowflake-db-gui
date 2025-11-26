import AskDialog from "./AskDialog.jsx";
import useAppContext from "../contexts/AppContext.jsx";
import { useWebSocket } from "../contexts/WebsocketProvider.jsx";
import useTranslate from "../languages/useTranslate.jsx";
import { useEffect, useState } from "react";
import { Chip, FormControl, InputLabel, MenuItem, Select, Stack, Switch, TextField, Typography } from "@mui/material";
import Spacer from "./Spacer.jsx";
import { snowflakeStringify } from "../core/Utils.js";
import eventBus from "../core/EventBus.jsx";

function TypeValueSelector({ type, value, setValue, onEnter = null }){

    const [controlHeld, setControlHeld] = useState(false);

    useEffect(() => {
        setControlHeld(false);
        if(type === "null")
            setValue(null);
        else if(type === "number")
            setValue(parseInt(value) || 0);
        else if(type === "string")
            setValue(`${value}`);
        else if(type === "boolean")
            setValue(!!value);
    }, [type]);

    function handleKeyDown(e){
        if(typeof onEnter !== "function")
            return;
        if(e.key === "Enter")
            onEnter(e);
    }

    // Translation
    const { __ } = useTranslate();

    if(type === "boolean"){
        return (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography sx={{ transition: "color ease .3s" }} color={!value ? "warning" : "default"}>False</Typography>
                <Switch color="success" checked={value === true} onChange={e => setValue(!!e.target.checked)} />
                <Typography sx={{ transition: "color ease .3s" }} color={value ? "success" : "default"}>True</Typography>
            </Stack>
        );
    }

    if(type === "string"){
        return (
            <TextField variant="outlined"
                       label={__("value")}
                       value={`${value}`}
                       onChange={e => setValue(e.target.value)}
                       onKeyDown={handleKeyDown}
                       fullWidth
            />
        );
    }

    if(type === "number"){
        return (
            <TextField variant="outlined"
                       label={__("value")}
                       value={parseInt(value) || 0}
                       onChange={e => setValue(e.target.value)}
                       onKeyDown={e => {
                           handleKeyDown(e);
                           const { key } = e;
                           if(key === "Control"){
                               setControlHeld(true);
                               return;
                           }
                           if(!["Backspace", "ArrowLeft", "ArrowRight", "-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(key) && !controlHeld)
                               e.preventDefault();
                       }}
                       onKeyUp={e => {
                           if(e.key === "Control")
                               setControlHeld(false);
                       }}
                       fullWidth />
        );
    }

    if(type === "null"){
        return <div>
            <Chip label="Null" variant="outlined" />
        </div>
    }

    return null;

}

export default function EntryAdder({ keyName, defaultKey, open, onClose }){

    // Contexts
    // const currentAccess = useAppContext(state => state.currentAccess);
    // const currentLanguage = useAppContext(state => state.currentLanguage);
    const showSnackbar = useAppContext(state => state.showSnackbar);

    // Loading
    const [isWaiting, setIsWaiting] = useState(false);

    // Form data
    const [selectedType, setSelectedType] = useState("string");
    const [entryKey, setEntryKey] = useState(defaultKey);
    const [entryValue, setEntryValue] = useState("");

    useEffect(() => {
        setEntryKey(defaultKey);
    }, [defaultKey]);

    // Socket helper
    const { helper } = useWebSocket();

    // Translation
    const { __ } = useTranslate();

    const isNew = keyName === null;

    function handleClose(){
        if(typeof onClose === "function")
            onClose();
    }

    useEffect(() => {

        if(!open) {
            setEntryValue("");
            setEntryKey("");
            setSelectedType("string");
            return;
        }

        if(!isNew){
            helper.fetch("get", {
                key: defaultKey
            }).then(r => {
                if(r.success){
                    const { value, type } = r.data;
                    if(typeof value !== "undefined" && typeof type !== "undefined"){
                        if(type === "buffer"){
                            handleClose();
                            showSnackbar(__("cannot_edit_buffers"), "warning");
                            return;
                        }
                        setSelectedType(type);
                        setEntryValue(value);
                        return;
                    }
                }
                handleClose();
                showSnackbar(__("error_occurred"), "error");
            }).catch(() => {
                handleClose();
                showSnackbar(__("error_occurred"), "error");
            });

        }
    }, [open]);

    function addEntry(){
        setIsWaiting(true);
        helper.fetch("set", {
            stringified: true,
            key: entryKey,
            value: snowflakeStringify(entryValue)
        }).then(r => {
            if(r.success){
                eventBus.dispatchEvent(new Event("reload_database"));
                eventBus.dispatchEvent(new Event("reload_database_stats"));
                showSnackbar(__("updated"), "success");
                handleClose();
                return;
            }
            showSnackbar(__("failed"), "error");
        }).catch(() => {
            showSnackbar(__("failed"), "error");
        }).finally(() => {
            setIsWaiting(false);
        });
    }

    return (<>

        <AskDialog open={open}
                   onClose={onClose}
                   title={__(isNew ? "add_entry" : "edit_entry")}
                   yesButtonText={__(isNew ? "add" : "update")}
                   noButtonText={__("cancel")}
                   closeOnAccept={false}
                   onAccept={addEntry}>

            <Spacer space={16}/>

            <Stack direction="column" gap={2}>

                <TextField variant="outlined"
                           label={__("key_name")}
                           value={entryKey}
                           onChange={e => setEntryKey(e.target.value)}
                           disabled={!isNew || isWaiting}
                           fullWidth />

                <FormControl fullWidth>
                    <InputLabel id="entry-type-select">{__("type")}</InputLabel>
                    <Select variant="outlined"
                            labelId="entry-type-select"
                            label={__("type")}
                            disabled={isWaiting}
                            value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                        <MenuItem value="string">string</MenuItem>
                        <MenuItem value="number">number</MenuItem>
                        <MenuItem value="boolean">boolean</MenuItem>
                        <MenuItem value="null">null</MenuItem>
                    </Select>
                </FormControl>

                {
                    isWaiting
                    ?
                    null
                    :
                    <TypeValueSelector type={selectedType}
                                       value={entryValue}
                                       setValue={v => {
                                           if(isNew){
                                               if(selectedType === "boolean")
                                                   v = Boolean(v);
                                               else if(selectedType === "number")
                                                   v = parseInt(v) || 0;
                                               else if(selectedType === "string")
                                                   v = `${v}`;
                                               else if(selectedType === "null")
                                                   v = null;
                                           }
                                           setEntryValue(v);
                                       }}
                                       onEnter={addEntry}
                    />
                }

            </Stack>

        </AskDialog>

    </>);

}