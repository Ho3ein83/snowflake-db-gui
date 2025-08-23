import eventBus from "../core/EventBus.jsx";
import { getAppSettingInt } from "../core/Utils.js";

export default class SocketHelper {

    /**
     * Websocket object
     * @type {null|WebSocket}
     * @since 1.0.0
     */
    #socket = null;

    /**
     * The request ID counter for round-trip requests
     * @type {number}
     * @since 1.0.0
     */
    #requestId = 0;

    /**
     * @param {WebSocket} socket
     */
    constructor(socket) {

        if (socket instanceof WebSocket) {

            this.#socket = socket;

            this.initEvents();

        }

    }

    /**
     * Parse the response from server
     * @param {MessageEvent} message
     * @returns {{msg: string, msgId: string, success: boolean, requestId: string, data: any}}
     * @since 1.0.0
     */
    parseResponse(message) {
        try {
            return JSON.parse(message.data);
        } catch (e) {}
        return {};
    }

    initEvents() {

        this.#socket.addEventListener("message", message => {

            const resp = this.parseResponse(message);

            const { success, requestId, data } = resp;
            const { msg, msgId } = data;

            if (typeof requestId === "string") {

                // Internal requests
                if (requestId.startsWith(":")) {

                    // Get the action without the first colon
                    const requestAction = requestId.substring(1);

                    // Fire the event for handling the response
                    eventBus.dispatchEvent(new CustomEvent("socket_action_received", {
                        detail: {
                            resp,
                            action: requestAction
                        }
                    }));

                    // No need for other handlers
                    return;

                }

                // Handle the request manually
                eventBus.dispatchEvent(new CustomEvent("socket_message_response", {
                    detail: {
                        resp, requestId
                    }
                }));

                // Handle the request for this specified request ID
                // Used for round-trip requests that needs to send a message and get the response of that specific message
                eventBus.dispatchEvent(new CustomEvent(`socket_message_response_${requestId}`, {
                    detail: {
                        resp, requestId
                    }
                }));

                // It was a controller response, not just a raw message
                return;
            }

            eventBus.dispatchEvent(new CustomEvent("socket_message_received", {
                detail: {
                    resp
                }
            }));

        });

    }

    fetch(endpoint, data = {}, preferredTimeout = null) {

        return new Promise((resolve, reject) => {

            const requestId = "req_" + ++this.#requestId;
            const eventName = `socket_message_response_${requestId}`;
            let timeout = null;

            this.#socket.send(JSON.stringify({
                endpoint, data, requestId
            }));

            function removeEvent() {
                eventBus.removeEventListener(eventName, responseHandler);
            }

            function responseHandler(resp) {

                removeEvent();

                if (timeout)
                    clearTimeout(timeout);

                resolve(resp.detail?.resp || { success: false, msgId: "error", msg: "An error has occurred"});

            }

            eventBus.addEventListener(eventName, responseHandler);

            timeout = setTimeout(() => {
                console.log("Timed out!");
                removeEvent();
                reject(new Error("timed_out"));
            }, preferredTimeout === null ? getAppSettingInt("socket.timeout", 15000) : preferredTimeout);

        });

    }

    async fetchWithMinDelay(endpoint, data, minDelay = 100) {
        const start = Date.now();
        const result = await this.fetch(endpoint, data);
        const elapsed = Date.now() - start;

        if (elapsed < minDelay) {
            await new Promise(r => setTimeout(r, minDelay - elapsed));
        }

        return result;
    }

}