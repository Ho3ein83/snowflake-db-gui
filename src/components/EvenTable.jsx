import { Divider, Stack, Tooltip, Typography } from "@mui/material";
import { Fragment, isValidElement } from "react";
import { IconInfoCircle } from "@tabler/icons-react";

/**
 * @param {{label: string, value: string|number|JSX.Element, tooltip?: string}[]} items
 * @param {boolean} divider
 * @returns {JSX.Element}
 * @constructor
 */
export default function EvenTable({ items, divider = false }){
    return (
        <Stack direction="column" gap={2}>

            {items.map((item, idx) => (<Fragment key={idx}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                    <Typography variant="h5" sx={{ opacity: ".7" }}>
                        {item.tooltip ? <Tooltip title={item.tooltip}>
                            <IconInfoCircle size={18} className="offset b-4 me-4"/>
                        </Tooltip> : null}
                        {item.label}
                    </Typography>
                    {isValidElement(item.value) ? item.value : <Typography variant="h5" dir="auto">{item.value}</Typography>}
                </Stack>
                {divider && idx < items.length-1 ? <Divider/> : null}
            </Fragment>))}

        </Stack>
    );
}