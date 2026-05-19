import type {
    AcademicRegistrationStatus,
    CreateCareerRegistrationPayload,
    Registration,
} from "../models/uml/Registration";
import { api } from "../interceptors/authInterceptor";
import { BaseService } from "./baseService";

export class RegistrationService extends BaseService<Registration> {
    constructor() {
        super("academic/registrations");
    }

    async getActiveStudents(): Promise<Registration[]> {
        const response = await api.get<{ data: Registration[] }>(this.apiURL);
        return (response.data.data ?? []).filter(
            (registration) =>
                registration.is_active === true ||
                registration.academic_status === "ACTIVE"
        );
    }

    async createCareerRegistration(
        payload: CreateCareerRegistrationPayload
    ): Promise<Registration> {
        const response = await api.post<{ data: Registration }>(
            this.apiURL,
            payload
        );

        return response.data.data;
    }

    async updateAcademicStatus(
        registrationId: string,
        status: AcademicRegistrationStatus
    ): Promise<Registration> {
        const response = await api.put<{ data: Registration }>(
            `${this.apiURL}/${registrationId}`,
            {
                academic_status: status,
                is_active: status === "ACTIVE",
            }
        );

        return response.data.data;
    }
}

export const registrationService = new RegistrationService();
