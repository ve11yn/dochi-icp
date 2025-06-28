import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Appointment {
  'id' : AppointmentId,
  'startTime' : string,
  'title' : string,
  'endTime' : string,
  'userId' : UserId,
  'date' : string,
  'createdAt' : Time,
  'color' : string,
  'completed' : boolean,
  'updatedAt' : Time,
  'category' : string,
}
export type AppointmentId = bigint;
export interface Category {
  'name' : string,
  'color' : string,
  'textColor' : string,
}
export interface CreateAppointmentRequest {
  'startTime' : string,
  'title' : string,
  'endTime' : string,
  'date' : string,
  'category' : string,
}
export type Result = { 'ok' : Appointment } |
  { 'err' : string };
export type Result_1 = { 'ok' : string } |
  { 'err' : string };
export type Time = bigint;
export interface UpdateAppointmentRequest {
  'id' : AppointmentId,
  'startTime' : [] | [string],
  'title' : [] | [string],
  'endTime' : [] | [string],
  'completed' : [] | [boolean],
  'category' : [] | [string],
}
export type UserId = Principal;
export interface UserProfile {
  'categories' : Array<Category>,
  'userId' : UserId,
  'createdAt' : Time,
}
export interface _SERVICE {
  'addCategory' : ActorMethod<[UserId, Category], Result_1>,
  'createAppointment' : ActorMethod<[UserId, CreateAppointmentRequest], Result>,
  'deleteAppointment' : ActorMethod<[UserId, AppointmentId], Result_1>,
  'deleteCategory' : ActorMethod<[UserId, string], Result_1>,
  'getAllAppointments' : ActorMethod<[UserId], Array<Appointment>>,
  'getAppointmentsByDate' : ActorMethod<[UserId, string], Array<Appointment>>,
  'getAppointmentsByDateRange' : ActorMethod<
    [UserId, string, string],
    Array<Appointment>
  >,
  'getAppointmentsGroupedByDate' : ActorMethod<
    [UserId],
    Array<[string, Array<Appointment>]>
  >,
  'getUserProfile' : ActorMethod<[UserId], UserProfile>,
  'toggleAppointmentCompletion' : ActorMethod<[UserId, AppointmentId], Result>,
  'updateAppointment' : ActorMethod<[UserId, UpdateAppointmentRequest], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
