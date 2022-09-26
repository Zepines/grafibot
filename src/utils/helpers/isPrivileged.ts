import { GuildMember } from "discord.js";

/**
 * Checks if the member has the required privilege.
 * @param member - The member to check.
 * @returns - True if he has it, false otherwise.
 */
export default function isPrivileged(member: GuildMember): boolean {
    return member.roles.cache.has(process.env.ROLE_ID_ACCUSTOMED);
}
