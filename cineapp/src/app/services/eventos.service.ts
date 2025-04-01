import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BackendFakeService } from "./backend.fake.service";
// import { Evento } from "../calendario/evento.model";
@Injectable({
  providedIn: 'root'
})
export class EventosService {

  constructor(private backend: BackendFakeService) {}

  // getEventos(): Observable<Evento[]> {
  //   return this.backend.getEventos();
  // }

  // agregarEvento(evento: Evento): Observable<Evento> {
  //   return this.backend.agregarEvento(evento);
  // }

  // editarEvento(evento: Evento): Observable<Evento> {
  //   return this.backend.editarEvento(evento);
  // }

  // eliminarEvento(id: number): Observable<void> {
  //   return this.backend.eliminarEvento(id);
  // }
}
