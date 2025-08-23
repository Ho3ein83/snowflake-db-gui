export default class AccessToken {

    /**
     * Token alias
     * @type {string}
     * @since 1.0.0
     */
    #alias = "";

    /**
     * Permissions list
     * @type {string[]}
     * @since 1.0.0
     */
    #permissions = [];

    constructor(object) {

        if(typeof object === "object"){
            this.#alias = object.alias ?? "";
            this.#permissions = object.permissions ?? [];
        }

    }

    /**
     * Check if current token has access to specific action
     * @param {string} accessId - Access ID
     * @returns {boolean}
     * @since 1.0.0
     */
    hasAccess(accessId){
        if(this.#permissions.includes("*"))
            return true;
        return this.#permissions.includes(accessId);
    }

    /**
     * Export current access data
     * @returns {{alias: string, permissions: string[]}}
     * @since 1.0.0
     */
    export(){
        return {
            alias: this.#alias,
            permissions: this.#permissions
        };
    }

    /**
     * The alias of the token
     * @returns {string}
     * @since 1.0.0
     */
    get alias(){
        return this.#alias;
    }

    /**
     * The list of permissions allowed for this token
     * @returns {string[]}
     * @since 1.0.0
     */
    get permissions(){
        return this.#permissions;
    }

}