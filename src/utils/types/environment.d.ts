export {}

/**
 * Add environment variables type definition.
 */
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            CREDENTIAL_BOT_TOKEN:      string
            CREDENTIAL_APPLICATION_ID: string
            USER_ID_GRAFIKART:         string
            CREDENTIAL_GUILD_ID:       string
            ROLE_ID_ACCUSTOMED:        string
            CHANNEL_ID_LOGS:           string
            CHANNEL_ID_RULES:          string
            CHANNEL_ID_ANNOUNCES:      string
            EMOJI_NAME_BIG_BRAIN:      string
            EMOJI_NAME_REPORT:         string
            EMOJI_NAME_DRY:            string
        }
    }
}