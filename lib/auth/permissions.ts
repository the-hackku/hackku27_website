import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
    ...defaultStatements,
    ticket: ["read_mentor", "read_incident", "claim", "resolve", "delete"],
    project: ["create", "update", "read_draft", "award", "delete"],
    team: ["create", "update", "invite", "delete", "list"],
    judging: ["assign", "score"],
    info: ["scan"],
    checkin: ["create_self", "create_others", "list", "update", "delete"],
    mass_registration: ["create", "read", "list", "update", "delete"]
} as const;

export const accessControl = createAccessControl(statement);

export const participant = accessControl.newRole({
    project: ["create", "update", "read_draft"],
    team: ["create", "update", "invite"],
    checkin: ["create_self"]
});

export const mentor = accessControl.newRole({
    ticket: ["read_mentor", "claim", "resolve"]
});

export const judge = accessControl.newRole({
    judging: ["assign", "score"]
});

export const sponsor = accessControl.newRole({
    
});