import { OpenTdbQuestion } from './open-tdb-question.model';

export interface OpenTdbResponse {
  response_code: number;
  results: OpenTdbQuestion[];
}
