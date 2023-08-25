import { type UserEventType } from '../domain/workflow';

export type User = {
  id: string;
  name: string;
  email: string;
};

export interface CaptureUserEvent {
  (event: UserEventType): void;
}
