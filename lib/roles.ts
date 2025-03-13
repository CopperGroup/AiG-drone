const roles = {
    "/clients": {
        create: {
        admin: ["Owner"],
        user: ["Owner", "Admin"],
        },
        edit: {
        admin: ["Owner"],
        user: ["Owner", "Admin"],
        },
        delete: {
        admin: ["Owner"],
        user: ["Owner", "Admin"],
        },
    },
} as const;

type RolesConfig = typeof roles;
type Route = keyof RolesConfig;
type Action<R extends Route> = keyof RolesConfig[R];
type Extension<R extends Route, A extends Action<R>> = keyof RolesConfig[R][A];
// @ts-ignore
type Role<R extends Route, A extends Action<R>, E extends Extension<R, A>> = (typeof roles)[R][A][E][number];

export function hasPermission<
    R extends Route,
    A extends Action<R>,
    E extends Extension<R, A>
    >(
    route: R,
    action: A,
    extension: E,
    role: string
    ): boolean {
    const allowedRoles = roles[route]?.[action]?.[extension];
    if (!allowedRoles) {
        return false;
    }
        // @ts-ignore
    return allowedRoles.includes(role);
}


  