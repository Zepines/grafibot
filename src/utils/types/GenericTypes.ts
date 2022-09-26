/**
 * Generic types and enumerations shared acros the application.
 */

/**
 * Enumerations for various durations in seconds.
 */
export enum DurationInSeconds {
    Zero        = 0,
    OneMinute   = 60,
    FiveMinutes = 300,
    TenMinutes  = 600,
    OneHour     = 3600,
    SixHours    = 21600,
    TwelveHours = 43200,
    OneDay      = 86400,
    ThreeDays   = 259200,
    OneWeek     = 604800
}

/**
 * Enumerations for various default messages.
 */
 export enum DefaultReason {
    NoReasonGiven = 'Aucune raison donnée.',
    DiscordLink   = 'Envoi d\'un lien d\'invitation Discord.'
}
