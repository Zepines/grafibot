/**
 * Converts milliseconds timestamp in seconds timestamp. Thanks to Discord for being inconsistent.
 * @param timestamp - The timestamp in milliseconds.
 * @return - The formated timestamp in seconds.
 */
export default function toFormatedTimestamp(timestamp: number): string {
    return `<t:${Math.round(timestamp / 1000)}:f>`;
}
