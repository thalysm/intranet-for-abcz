import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "./api.service";

@Injectable({
  providedIn: "root",
})
export class EventService {
  constructor(private api: ApiService) {}

  confirmPresence(id: string): Observable<any> {
    return this.api.post(`/events/${id}/confirm`, {});
  }

  declinePresence(id: string): Observable<any> {
    return this.api.post(`/events/${id}/decline`, {});
  }
}
