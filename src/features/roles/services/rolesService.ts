import { api } from '../../../lib/api';

export interface Role {
    id: number;
    name: string;
    label: string;
    description: string | null;
    isSystem: number | null;
    createdAt: string;
    _count?: { userRoles: number };
    permissions?: { permission: Permission }[];
}

export interface Permission {
    id: number;
    key: string;
    label: string;
    group: string;
    description: string | null;
}

export interface UserRole {
    id: number;
    userId: string;
    roleId: number;
    model: string;
    role: Role;
}

export const rolesService = {
    async getAll() {
        return api.get<Role[]>('/roles');
    },

    async getPermissions() {
        return api.get<Permission[]>('/roles/permissions');
    },

    async create(data: { name: string; label: string; description?: string }) {
        return api.post<Role>('/roles', data);
    },

    async update(id: number, data: { label: string; description?: string }) {
        return api.put<Role>(`/roles/${id}`, data);
    },

    async updatePermissions(id: number, permissionIds: number[]) {
        return api.put<Role>(`/roles/${id}/permissions`, { permissionIds });
    },

    async delete(id: number) {
        return api.delete<{ success: boolean }>(`/roles/${id}`);
    },

    async getUserRoles(userId: string) {
        return api.get<UserRole[]>(`/roles/user/${userId}`);
    },

    async setUserRoles(userId: string, roleIds: number[]) {
        return api.post<UserRole[]>(`/roles/user/${userId}`, { roleIds });
    },
};
