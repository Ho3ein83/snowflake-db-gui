/**
 * @param className
 * @param {"vertical"|"horizontal"} type
 * @param children
 * @param ref
 * @returns {JSX.Element}
 * @constructor
 */
export default function Spacer({className = "", type = "vertical", space = 0, ref = null}) {
    let classList = ["DashboardSpacer"];
    if(className) classList.push(className);
    let style;
    if(type === "vertical")
        style = { height: space }
    else
        style = { width: space }
    return (<div className={classList.join(" ")} style={style} ref={ref}></div>)
}
