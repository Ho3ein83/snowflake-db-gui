import { IconLock } from "@tabler/icons-react";
import { Typography } from "@mui/material";
import React from "react";
import useTranslate from "../../languages/useTranslate.jsx";

export default function DatabaseReadPermissionMissingNote(){

    const { __ } = useTranslate();

    return (<Typography variant="body1" textAlign="center" className="waiting" sx={{ padding: 2 }}>
        <IconLock size={20} className="offset b-3 me-4"/>
        {__("db_read_permission_missing")}
    </Typography>);

}