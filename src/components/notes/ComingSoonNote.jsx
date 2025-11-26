import { IconClockQuestion } from "@tabler/icons-react";
import { Typography } from "@mui/material";
import React from "react";
import useTranslate from "../../languages/useTranslate.jsx";

export default function ComingSoonNote(){

    const { __ } = useTranslate();

    return (<Typography variant="body1" textAlign="center" className="waiting" sx={{ padding: 2 }}>
        <IconClockQuestion size={20} className="offset b-3 me-4"/>
        {__("feature_coming_soon")}
    </Typography>);

}