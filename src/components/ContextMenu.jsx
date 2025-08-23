import { ListItemIcon, ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * @param {Element|null} anchor
 * @param {SnowflakeContextMenuItemType[]} items
 * @param {boolean} scrollToSelected
 * @param {function} onClose
 * @param {{ vertical: "top"|"center"|"bottom", horizontal: "left"|"center"|"right" }} transformOrigin
 * @param {{ vertical: "top"|"center"|"bottom", horizontal: "left"|"center"|"right" }} anchorOrigin
 * @param {null|JSX.Element} children
 * @param {{
 *     [P in keyof {
 *         root: object,
 *         paper: object,
 *         list: object,
 *         transition: object,
 *         backdrop: object
 *     }]?: {
 *         root: object,
 *         paper: object,
 *         list: object,
 *         transition: object,
 *         backdrop: object
 *     }[P]
 * }} slotProps
 * @param {object|null} sx
 * @returns {JSX.Element}
 */
export default function ContextMenu({
                                        anchor,
                                        items = [],
                                        scrollToSelected = false,
                                        onClose,
                                        transformOrigin = {},
                                        anchorOrigin = {},
                                        children = null,
                                        slotProps = {},
                                        sx = null
                                    }) {

    const [anchorEl, setAnchorEl] = useState(anchor);
    const selectedRef = useRef(null);

    useEffect(() => {
        setAnchorEl(anchor);
    }, [anchor]);

    const handleClose = useCallback(() => onClose(), []);

    return (<Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
        sx={sx}
        transformOrigin={Object.assign({
            vertical: "top",
            horizontal: "center"
        }, transformOrigin)}
        anchorOrigin={Object.assign({
            vertical: "bottom",
            horizontal: "center"
        }, anchorOrigin)}
        slotProps={{
            transition: scrollToSelected ? {
                onEnter: () => {
                    if (selectedRef.current) {
                        selectedRef.current.scrollIntoView({
                            block: "center",
                            behavior: "smooth",
                            inline: "nearest"
                        });
                    }
                }
            } : {},
            ...slotProps
        }}
    >
        {children ? children : items.map((item, index) => {
            const color = item.color ?? "default";
            const Icon = item.icon;
            return (
                <MenuItem key={index}
                          ref={item?.isSelected ? selectedRef : null}
                          disabled={item.disabled ?? null}
                          onClick={item.callback ?? null}>

                    {
                        Icon
                        ?
                        <ListItemIcon>
                            <Icon className={`color-${color}`} size={20}/>
                        </ListItemIcon>
                        :
                        null
                    }

                    <ListItemText>
                        <Typography variant="body2" className={`color-${color}`}>
                            {item.label}
                        </Typography>
                    </ListItemText>

                    {
                        item.caption
                        ?
                        <Typography variant="body2" sx={{color: 'text.secondary'}}>{item.caption}</Typography>
                        :
                        null
                    }

                </MenuItem>
            );
        })}
    </Menu>);
}