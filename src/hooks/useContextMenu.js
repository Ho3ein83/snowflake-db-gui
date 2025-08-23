import { useCallback, useState } from "react";

export default function useContextMenu(){

    const [anchor, setAnchor] = useState(null);

    const opener = useCallback(e => {
        setAnchor(e.currentTarget);
    }, []);

    const closer = useCallback(() => {
        setAnchor(null);
    }, []);

    return [anchor, opener, closer];

}