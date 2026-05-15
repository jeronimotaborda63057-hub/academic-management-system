import type { Registration } from "../models/Registration";
import { api } from "../interceptors/authInterceptor";
import { BaseService } from "./baseService";

export class RegistrationService extends BaseService<Registration>{
    constructor (){
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
}   

export const registrationService = new RegistrationService();
