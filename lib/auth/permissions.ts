import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
    ...defaultStatements,
    mentor_tickets: ["create", "manage", "claim", "view"],
    organizer_tickets: ["create", "manage", "claim", "view"],
    travel_reimbursements: ["request", "manage", "invite", "view", "delete"],
    room_reservations: ["create", "manage", "view", "delete"],
    themed_rooms: ["create", "manage", "view", "delete"],
    projects: ["create", "disqualify", "view", "delete"],
    teams: ["create", "view", "invite"],
    quests: ["create", "view", "complete", "force_complete"],
    info_pages: ["manage"],
    blog_posts: ["create", "manage", "delete"],
    checkins: ["perform", "view", "manage", "delete"],
    events: ["create", "manage", "delete"],
    organizer_tasks: ["create", "view", "manage"],
    judging: ["participate", "manage", "view"],
    user_data: ["view_resumes", "view", "manage"],
    mass_registrations: ["create", "view", "manage"],
} as const;

export const ac = createAccessControl(statement);

export const roles = {
    hacker: ac.newRole({
        mentor_tickets: ["create"],
        organizer_tickets: ["create"],
        travel_reimbursements: ["request"],
        projects: ["create"],
        teams: ["create"],
        quests: ["view", "complete"]
    }),
    mentor: ac.newRole({
        mentor_tickets: ["claim", "view"],
        organizer_tickets: ["create"]
    }),
    judge: ac.newRole({
        organizer_tickets: ["create"],
        judging: ["participate"]
    }),
    bronze_sponsor: ac.newRole({
        organizer_tickets: ["create"]
    }),
    silver_sponsor: ac.newRole({
        organizer_tickets: ["create"],
        user_data: ["view_resumes"]
    }),
    gold_sponsor: ac.newRole({
        organizer_tickets: ["create"],
        user_data: ["view_resumes"]
    }),
    volunteer: ac.newRole({
        mentor_tickets: ["view"],
        organizer_tickets: ["claim", "view"],
        projects: ["view"],
        teams: ["view", "invite"],
        quests: ["view", "force_complete"],
        checkins: ["perform", "view"],
        organizer_tasks: ["view"],
        judging: ["view"],
        mass_registrations: ["view"]
    }),
    writer: ac.newRole({
        blog_posts: ["create", "manage"]
    }),
    admin: ac.newRole({
        ...adminAc.statements,
        mentor_tickets: ["manage", "claim", "view"],
        organizer_tickets: ["manage", "claim", "view"],
        travel_reimbursements: ["manage", "view"],
        projects: ["disqualify", "view", "delete"],
        teams: ["view", "invite"],
        quests: ["create", "view", "force_complete"],
        blog_posts: ["create", "manage", "delete"],
        checkins: ["perform", "view", "manage", "delete"],
        events: ["create", "manage", "delete"],
        organizer_tasks: ["create", "view", "manage"],
        judging: ["manage", "view"],
        user_data: ["view_resumes", "view", "manage"],
        mass_registrations: ["create", "view", "manage"]
    })
};