/**
 * Types and enumerations for the interaction filters.
 */

/**
 * Enumerations for the filters scopes.
 */
export enum FilterScopeEnum {
    Message = 'message',
    Member  = 'member'
}

/**
 * Type for the returned data after the error regex check.
 */
 export type KnownErrorFilterErrorMap = {
    key?:   string;
    value?: string;
}
